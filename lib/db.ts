import { Client } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "@/db/schema";

/**
 * One code path, everywhere (constitution Principle VI, Environment
 * Parity): local dev, CI, and production all resolve the database
 * connection the same way — a direct `pg` TCP connection using
 * `getCloudflareContext().env.DATABASE_URL`. There is no Node-only
 * fallback. Locally/in CI this only works when running the real Workers
 * runtime (`npm run preview:workers`, Miniflare via Wrangler), where
 * `DATABASE_URL` comes from `.dev.vars` and points at the local Supabase
 * CLI stack; in production it's a `wrangler secret put DATABASE_URL` value
 * pointing at Supabase's transaction pooler.
 *
 * Amendment (2026-07-13): superseded going through Cloudflare Hyperdrive.
 * A production incident traced GET/POST hangs to Hyperdrive returning
 * "Timed out while waiting for a message from the origin database" for
 * minutes at a time; removing the extra hop in favor of a direct TCP
 * connection (Workers' `nodejs_compat` supports raw sockets, so `pg`
 * connects the same way it would from a normal Node server) eliminated
 * that failure mode. See `specs/001-foundational-infra/research.md`.
 *
 * Bindings are NOT available on `globalThis` — only on the `env` object
 * `getCloudflareContext()` returns, and only inside real Workers request
 * handling. Calling it from anywhere else (plain `next dev`, Vitest) throws;
 * that's treated as a hard configuration error, not silently worked around.
 */
export function resolveConnectionString(): string {
  const { env } = getCloudflareContext();
  const connectionString = (env as { DATABASE_URL?: string }).DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "No DATABASE_URL found on the Cloudflare context. This code must run " +
      "under the real Workers runtime (`npm run preview:workers`, not `next dev`) " +
      "with DATABASE_URL set (`.dev.vars` locally, `wrangler secret put DATABASE_URL` in production).",
    );
  }

  return connectionString;
}

/**
 * Per-request connection: Workers isolates are request-scoped (constitution
 * Principle VI), so there's no safe way to hold a long-lived pool across
 * requests — connect, query, and close every time. Supabase's transaction
 * pooler (Supavisor) is what makes this affordable at connection-per-request
 * volume; it's still the target even without Hyperdrive in front of it.
 */
export async function withDb<T>(fn: (db: NodePgDatabase<typeof schema>) => Promise<T>): Promise<T> {
  const connectionString = resolveConnectionString();
  const client = new Client({
    connectionString,
    // Supabase requires TLS; `rejectUnauthorized: false` matches Supabase's
    // documented Workers/edge setup (their cert chain isn't in the trust
    // store nodejs_compat provides). Skip entirely for local Supabase CLI,
    // which serves plain (non-TLS) Postgres.
    ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false },
    // A production incident showed a query can hang far longer than is
    // useful (10+ minutes) when the origin is stuck — e.g. a prior
    // request's connection was killed mid-transaction (Worker isolate torn
    // down before its `finally` ran) and left an idle-in-transaction
    // session holding a lock. These bound every connection so a stuck
    // origin fails fast and cleanly, and so a killed Worker can't leave a
    // lock held indefinitely.
    connectionTimeoutMillis: 8_000,
    query_timeout: 10_000,
    statement_timeout: 10_000,
    idle_in_transaction_session_timeout: 10_000,
  });
  await client.connect();
  try {
    return await fn(drizzle(client, { schema }));
  } finally {
    await client.end();
  }
}
