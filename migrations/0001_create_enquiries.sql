-- Enquiries received through the website form and the voice assistant.
--
-- This table is the source of truth. Email is a notification channel: it can
-- be filtered, deleted or missed, and it cannot answer "did that enquiry
-- arrive?" three weeks later. This can.

CREATE TABLE IF NOT EXISTS enquiries (
  id              TEXT PRIMARY KEY,
  form_id         TEXT NOT NULL,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT NOT NULL DEFAULT '',
  category        TEXT NOT NULL DEFAULT '',
  message         TEXT NOT NULL,
  source          TEXT NOT NULL DEFAULT '',
  -- 'website' or 'assistant'.
  origin          TEXT NOT NULL,
  created_at      TEXT NOT NULL,
  -- Whether OMNIEL was actually told. A row with admin_notified = 0 is an
  -- enquiry nobody has seen, and is the query to run when something looks off.
  admin_notified  INTEGER NOT NULL DEFAULT 0,
  acknowledged    INTEGER NOT NULL DEFAULT 0,
  delivery_error  TEXT
);

-- Newest first, which is how these are always read.
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries (created_at DESC);

-- Supports the duplicate check, which filters on email, form and recency.
CREATE INDEX IF NOT EXISTS idx_enquiries_dedupe ON enquiries (email, form_id, created_at DESC);

-- Finds enquiries that were stored but never delivered, so they can be replayed.
CREATE INDEX IF NOT EXISTS idx_enquiries_undelivered ON enquiries (admin_notified, created_at DESC);
