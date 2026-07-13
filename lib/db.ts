import { Client } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "@/db/schema";

/**
 * One code path, everywhere (constitution Principle VI, Environment
 * Parity): local dev, CI, and production all resolve the database
 * connection the same way — through the Cloudflare Hyperdrive binding via
 * `getCloudflareContext().env.HYPERDRIVE`. There is no Node-only fallback.
 * Locally/in CI, this only works when running the real Workers runtime
 * (`npm run preview:workers`, Miniflare via Wrangler), where the binding's
 * `localConnectionString` in `wrangler.jsonc` points at the local Supabase
 * CLI stack; in production it points at the real Hyperdrive config.
 *
 * Bindings are NOT available on `globalThis` — only on the `env` object
 * `getCloudflareContext()` returns, and only inside real Workers request
 * handling. Calling it from anywhere else (plain `next dev`, Vitest) throws;
 * that's treated as a hard configuration error, not silently worked around.
 */
export function resolveConnectionString(): string {
  const { env } = getCloudflareContext();
  const connectionString = (env as { HYPERDRIVE?: { connectionString: string } }).HYPERDRIVE
    ?.connectionString;

  if (!connectionString) {
    throw new Error(
      "No HYPERDRIVE binding found on the Cloudflare context. This code must run " +
      "under the real Workers runtime (`npm run preview:workers`, not `next dev`) " +
      "with `hyperdrive` configured in wrangler.jsonc.",
    );
  }

  return connectionString;
}

/**
 * Per-request connection, matching Cloudflare's documented Drizzle +
 * Hyperdrive pattern: Hyperdrive pools connections at Cloudflare's edge, so
 * the Worker itself doesn't need to hold a long-lived pool across requests
 * (which also wouldn't survive a Workers isolate's request-scoped lifetime
 * — constitution Principle VI). Always closes the client, even on error.
 */
export async function withDb<T>(fn: (db: NodePgDatabase<typeof schema>) => Promise<T>): Promise<T> {
  const client = new Client({
    connectionString: resolveConnectionString(),
    // A production incident showed a query can hang far longer than is
    // useful (10+ minutes, per Hyperdrive's own "Timed out while waiting
    // for a message from the origin database" error) when the origin is
    // stuck — e.g. a prior request's connection was killed mid-transaction
    // (Worker isolate torn down before its `finally` ran) and left an
    // idle-in-transaction session holding a lock. These bound every
    // connection so a stuck origin fails fast and cleanly instead of
    // hanging until some outer platform timeout returns an opaque 502, and
    // so a killed Worker can't leave a lock held indefinitely.
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
