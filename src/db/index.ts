import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Single database connection for the whole application.
 *
 * Preference order:
 *   1. SUPABASE_DB_URL  — the Supabase Postgres database (production target)
 *   2. DATABASE_URL     — local/sandbox Postgres (development fallback)
 *
 * Pointing SUPABASE_DB_URL at Supabase migrates templates, profiles, orders,
 * invitations, RSVPs and coupons onto Supabase without touching app code,
 * because every query already runs through this one Drizzle client.
 *
 * NOTE ON HOSTS: Supabase's direct host (db.<ref>.supabase.co) is IPv6-only
 * on newer projects. Use the Session Pooler connection string
 * (aws-0-<region>.pooler.supabase.com:5432, user `postgres.<ref>`) whenever
 * the runtime lacks an IPv6 route.
 */

const rawSupabaseUrl = process.env.SUPABASE_DB_URL?.trim();
const localUrl = process.env.DATABASE_URL?.trim();

function isUsable(url?: string) {
  if (!url) return false;
  if (!/^postgres(ql)?:\/\//.test(url)) return false;
  // Ignore untouched dashboard placeholders.
  if (/\[?YOUR[-_]?PASSWORD\]?/i.test(url)) return false;
  return true;
}

/**
 * Supabase publishes two Postgres hostnames:
 *   - direct:  db.<project-ref>.supabase.co   (IPv6-only on new projects)
 *   - pooler:  aws-0-<region>.pooler.supabase.com  (IPv4, user = postgres.<ref>)
 *
 * Runtimes without an IPv6 route cannot reach the direct host. If a
 * SUPABASE_POOLER_REGION is provided (or the region is already visible in a
 * previously-set pooler URL), automatically rewrite a direct connection
 * string to its pooler equivalent using the same password.
 */
function normalizeSupabaseUrl(url?: string): string | undefined {
  if (!url) return url;
  const direct = /^(postgres(?:ql)?):\/\/([^:]+):([^@]+)@db\.([a-z0-9]+)\.supabase\.co(:\d+)?\/([^?]+)(\?.*)?$/i.exec(url);
  if (!direct) return url;

  const [, scheme, user, password, projectRef, , database, tail] = direct;
  const region = process.env.SUPABASE_POOLER_REGION?.trim() || "ap-southeast-1";
  const poolerUser = user === "postgres" ? `postgres.${projectRef}` : user;
  const rewritten = `${scheme}://${poolerUser}:${password}@aws-0-${region}.pooler.supabase.com:5432/${database}${tail ?? ""}`;

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[db] Rewriting Supabase direct host to pooler (region ${region}). ` +
        "The direct host is IPv6-only. Set SUPABASE_POOLER_REGION if this region is wrong.",
    );
  }
  return rewritten;
}

const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);

export const activeConnection: { url: string; source: "supabase" | "local" } = isUsable(supabaseUrl)
  ? { url: supabaseUrl as string, source: "supabase" }
  : isUsable(localUrl)
    ? { url: localUrl as string, source: "local" }
    : (() => {
        throw new Error("No database configured. Set SUPABASE_DB_URL or DATABASE_URL.");
      })();

export const isSupabaseDatabase = activeConnection.source === "supabase";

function needsSsl(url: string) {
  if (/sslmode=disable/.test(url)) return false;
  if (/supabase\.(co|com)/.test(url)) return true;
  return /sslmode=require/.test(url);
}

/**
 * Strip `sslmode` from the connection string so Node.js pg's own `ssl`
 * config takes precedence. pg-connection-string treats `sslmode=require`
 * as `verify-full`, which rejects Supabase's certificate chain even when
 * we explicitly set `rejectUnauthorized: false`.
 */
function stripSslMode(url: string) {
  return url.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?$/, "");
}

const globalForDb = globalThis as typeof globalThis & {
  __celebratesPool?: Pool;
};

const cleanUrl = stripSslMode(activeConnection.url);

/**
 * Force Node's DNS resolver to prefer IPv4 answers. Supabase hostnames
 * sometimes return both A and AAAA records, and in environments without an
 * IPv6 route (like this sandbox) picking the AAAA answer produces
 * `ENETUNREACH`. This flag makes `getaddrinfo` return IPv4 first.
 */
if (isSupabaseDatabase) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dns = require("dns") as typeof import("dns");
    dns.setDefaultResultOrder?.("ipv4first");
  } catch {
    // Older Node without setDefaultResultOrder — nothing to do.
  }
}

export const pool =
  globalForDb.__celebratesPool ??
  new Pool({
    connectionString: cleanUrl,
    ssl: needsSsl(activeConnection.url) ? { rejectUnauthorized: false } : undefined,
    max: isSupabaseDatabase ? 5 : 10,
    connectionTimeoutMillis: 10_000,
    // Retry lookup: some resolvers return AAAA-only records for the
    // pooler on cache misses. Explicitly ask for IPv4 addresses.
    ...(isSupabaseDatabase
      ? {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          lookup: (hostname: string, _opts: unknown, cb: (err: NodeJS.ErrnoException | null, address: string, family: number) => void) => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const dns = require("dns") as typeof import("dns");
            dns.lookup(hostname, { family: 4 }, (err, address, family) => cb(err, address, family));
          },
        }
      : {}),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__celebratesPool = pool;
}

export const db = drizzle(pool);

/** Host shown in the admin diagnostics screen — never exposes credentials. */
export function connectionHost() {
  try {
    const withoutScheme = activeConnection.url.split("://")[1] ?? "";
    const hostPart = withoutScheme.split("@").pop() ?? "";
    return hostPart.split("/")[0] || "unknown";
  } catch {
    return "unknown";
  }
}
