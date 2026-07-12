import { afterEach, describe, expect, it } from "vitest";
import { resolveConnectionString } from "@/lib/prisma";

const ORIGINAL_DATABASE_URL = process.env.DATABASE_URL;

afterEach(() => {
  if (ORIGINAL_DATABASE_URL === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = ORIGINAL_DATABASE_URL;
  }
});

describe("resolveConnectionString", () => {
  it("accepts a localhost DATABASE_URL outside the Workers runtime", () => {
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:54322/postgres";
    expect(resolveConnectionString()).toBe(process.env.DATABASE_URL);
  });

  it("throws when DATABASE_URL is missing", () => {
    delete process.env.DATABASE_URL;
    expect(() => resolveConnectionString()).toThrow(/DATABASE_URL is not set/);
  });

  it("refuses a non-local DATABASE_URL outside the Workers runtime (FR-005, FR-014)", () => {
    process.env.DATABASE_URL = "postgresql://user:pass@db.supabase.co:5432/postgres";
    expect(() => resolveConnectionString()).toThrow(/Refusing to connect/);
  });
});
