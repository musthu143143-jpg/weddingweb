import "server-only";
import { sql } from "drizzle-orm";
import { activeConnection, connectionHost, db, isSupabaseDatabase } from "@/db";

export interface TableInfo {
  name: string;
  rows: number | null;
  present: boolean;
}

export interface DbDiagnostics {
  source: "supabase" | "local";
  host: string;
  reachable: boolean;
  error: string | null;
  serverVersion: string | null;
  database: string | null;
  tables: TableInfo[];
  supabaseUrlConfigured: boolean;
  supabaseDbUrlConfigured: boolean;
}

const EXPECTED = ["profiles", "templates", "orders", "invitations", "rsvps", "coupons", "unlock_keys"];

export async function getDbDiagnostics(): Promise<DbDiagnostics> {
  const base = {
    source: activeConnection.source,
    host: connectionHost(),
    supabaseUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseDbUrlConfigured: Boolean(process.env.SUPABASE_DB_URL),
  };

  try {
    const meta = await db.execute(
      sql`select current_database() as db, current_setting('server_version') as version`,
    );
    const row = (meta.rows?.[0] ?? {}) as { db?: string; version?: string };

    const existing = await db.execute(
      sql`select tablename from pg_tables where schemaname = 'public'`,
    );
    const names = new Set((existing.rows as { tablename: string }[]).map((r) => r.tablename));

    const tables: TableInfo[] = [];
    for (const name of EXPECTED) {
      if (!names.has(name)) {
        tables.push({ name, rows: null, present: false });
        continue;
      }
      try {
        const count = await db.execute(
          sql`select count(*)::int as c from ${sql.identifier(name)}`,
        );
        tables.push({ name, rows: Number((count.rows?.[0] as { c: number })?.c ?? 0), present: true });
      } catch {
        tables.push({ name, rows: null, present: true });
      }
    }

    return {
      ...base,
      reachable: true,
      error: null,
      serverVersion: row.version ?? null,
      database: row.db ?? null,
      tables,
    };
  } catch (caught) {
    return {
      ...base,
      reachable: false,
      error: (caught as { message?: string }).message ?? "Unknown connection error",
      serverVersion: null,
      database: null,
      tables: EXPECTED.map((name) => ({ name, rows: null, present: false })),
    };
  }
}

export { isSupabaseDatabase };
