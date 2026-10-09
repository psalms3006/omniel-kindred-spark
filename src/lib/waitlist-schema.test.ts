import { describe, expect, it } from "vitest";
import { waitlistSchema } from "./waitlist-schema";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  intendedUse: "Writing and research",
};

describe("waitlistSchema", () => {
  it("accepts a valid signup", () => {
    const parsed = waitlistSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("defaults the optional intended use to an empty string", () => {
    const parsed = waitlistSchema.parse({ name: "Ada", email: "ada@example.com" });
    expect(parsed.intendedUse).toBe("");
  });

  it("trims surrounding whitespace", () => {
    const parsed = waitlistSchema.parse({ name: "  Ada  ", email: "  ada@example.com  " });
    expect(parsed.name).toBe("Ada");
    expect(parsed.email).toBe("ada@example.com");
  });

  it("rejects a missing name", () => {
    expect(waitlistSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(waitlistSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects an oversized name", () => {
    expect(waitlistSchema.safeParse({ ...valid, name: "x".repeat(121) }).success).toBe(false);
  });

  it("rejects an oversized intended use", () => {
    expect(waitlistSchema.safeParse({ ...valid, intendedUse: "x".repeat(501) }).success).toBe(
      false,
    );
  });
});
