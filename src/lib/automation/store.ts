/**
 * Enquiry storage.
 *
 * Cloudflare D1 is the source of truth for enquiries. Email is a notification
 * channel, not a database: an inbox can be deleted, filtered or missed, and
 * nothing about it lets us answer "did that enquiry arrive?" later.
 *
 * Deliberately a thin, typed wrapper rather than an ORM. The table has one
 * shape, three queries, and no relations; an ORM would add a dependency and
 * a build step for nothing.
 */

/**
 * The slice of Cloudflare's D1 API this module uses.
 *
 * Declared locally instead of pulling in @cloudflare/workers-types, which
 * would add a large ambient type package to satisfy three method signatures.
 */
export type D1Database = {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
};

export type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  run<T = unknown>(): Promise<D1Result<T>>;
  first<T = unknown>(colName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
};

export type D1Result<T = unknown> = {
  results?: T[];
  success: boolean;
  meta?: Record<string, unknown>;
};

export type EnquiryOrigin = "website" | "assistant";

export type EnquiryRecord = {
  id: string;
  formId: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  message: string;
  source: string;
  origin: EnquiryOrigin;
  createdAt: string;
};

export type StoreResult =
  { ok: true } | { ok: false; error: string } | { ok: false; error: string; duplicate: true };

/**
 * How far back a byte-identical enquiry counts as a duplicate.
 *
 * This replaces an in-process Map that could never work reliably: Workers run
 * many isolates concurrently, each with its own memory, so a double-submit
 * landing on a second isolate was never caught. The database is shared, so
 * this check actually holds.
 */
const DEDUPE_WINDOW_MS = 5 * 60 * 1000;

export function generateEnquiryId(): string {
  // crypto.randomUUID exists in Workers and in Node 19+. No fallback branch,
  // because a missing crypto here means the runtime is not one we support and
  // silently degrading to Math.random would be worse than failing loudly.
  return crypto.randomUUID();
}

/**
 * Returns true when an identical enquiry was stored within the dedupe window.
 *
 * A storage-level failure here returns false rather than throwing: a broken
 * duplicate check must not block a genuine enquiry from being saved.
 */
export async function isDuplicate(db: D1Database, record: EnquiryRecord): Promise<boolean> {
  const since = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString();
  try {
    const row = await db
      .prepare(
        `SELECT id FROM enquiries
         WHERE email = ?1 AND form_id = ?2 AND message = ?3 AND created_at >= ?4
         LIMIT 1`,
      )
      .bind(record.email.toLowerCase(), record.formId, record.message, since)
      .first<{ id: string }>();
    return row !== null;
  } catch (err) {
    console.error("[enquiry-store] duplicate check failed", err);
    return false;
  }
}

export async function saveEnquiry(db: D1Database, record: EnquiryRecord): Promise<StoreResult> {
  try {
    await db
      .prepare(
        `INSERT INTO enquiries
           (id, form_id, name, email, phone, category, message, source, origin, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`,
      )
      .bind(
        record.id,
        record.formId,
        record.name,
        record.email.toLowerCase(),
        record.phone,
        record.category,
        record.message,
        record.source,
        record.origin,
        record.createdAt,
      )
      .run();
    return { ok: true };
  } catch (err) {
    console.error("[enquiry-store] insert failed", err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Records what actually happened to the notifications for an enquiry.
 *
 * This is the "observable and recoverable" half: a row whose admin_notified is
 * 0 is an enquiry nobody was told about, and can be found and replayed with a
 * single query rather than by reading logs.
 */
export async function recordDelivery(
  db: D1Database,
  id: string,
  delivery: { adminNotified: boolean; acknowledged: boolean; error?: string },
): Promise<void> {
  try {
    await db
      .prepare(
        `UPDATE enquiries
            SET admin_notified = ?2, acknowledged = ?3, delivery_error = ?4
          WHERE id = ?1`,
      )
      .bind(
        id,
        delivery.adminNotified ? 1 : 0,
        delivery.acknowledged ? 1 : 0,
        delivery.error ?? null,
      )
      .run();
  } catch (err) {
    // Never fatal. The enquiry is already stored; this only annotates it.
    console.error("[enquiry-store] delivery update failed", err);
  }
}
