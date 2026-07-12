import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Local/CI/dev: a direct Postgres connection string (Supabase CLI or any
 * local Postgres). Production (Cloudflare Workers): the Hyperdrive binding's
 * pooled connection string. Never the other way around — see the guard
 * below (FR-005, FR-014).
 */
export function resolveConnectionString(): string {
  const isWorkersRuntime = typeof (globalThis as { HYPERDRIVE?: unknown }).HYPERDRIVE !== "undefined";

  if (isWorkersRuntime) {
    const hyperdrive = (globalThis as { HYPERDRIVE?: { connectionString: string } }).HYPERDRIVE;
    if (!hyperdrive) {
      throw new Error(
        "Running in the Workers runtime but no HYPERDRIVE binding was found. " +
          "Configure it in wrangler.jsonc (see research.md §1).",
      );
    }
    return hyperdrive.connectionString;
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.local.example to .env.local and " +
        "point it at the local Supabase CLI Postgres instance.",
    );
  }

  // Guard (FR-005, FR-014): outside the real Workers production runtime,
  // refuse to connect to anything that isn't an obviously-local database.
  // This stops a mistaken production connection string from ever being used
  // from local dev or CI.
  const isLocalConnection = /^postgres(ql)?:\/\/[^/]*(localhost|127\.0\.0\.1|::1)/i.test(url);
  if (!isLocalConnection) {
    throw new Error(
      "Refusing to connect: DATABASE_URL does not look like a local database, " +
        "but this is not the Workers production runtime. Local dev and CI must " +
        "only ever talk to the local Supabase CLI stack.",
    );
  }

  return url;
}

declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: resolveConnectionString() });
  return new PrismaClient({ adapter });
}

// Lazy on purpose: resolving the connection string (and its guard) only
// happens on first real use, not at module-import time. That keeps a bare
// `import { resolveConnectionString } from "lib/prisma"` (e.g. in tests, or
// during Next.js build-time module evaluation) side-effect free.
function getPrismaClient(): PrismaClient {
  if (!globalThis.__prisma) {
    globalThis.__prisma = createPrismaClient();
  }
  return globalThis.__prisma;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getPrismaClient() as object, prop, receiver);
  },
});
