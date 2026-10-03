import { Pool, type QueryResultRow } from "pg";
import { env } from "../config/env.js";
import { SCHEMA_SQL } from "./schema.js";

if (!env.databaseUrl) {
  // eslint-disable-next-line no-console
  console.warn(
    "[db] DATABASE_URL is not set — the app will fail on the first query. Set it to a Postgres connection string."
  );
}

export const pool = new Pool({
  connectionString: env.databaseUrl,
  // Hosted Postgres (Vercel Postgres/Neon/Supabase) requires TLS; their
  // certs aren't in Node's default trust store, so this is the standard
  // "connect, don't verify the chain" setting recommended by all three.
  ssl: env.databaseUrl.includes("localhost") ? false : { rejectUnauthorized: false },
  // Every Vercel serverless invocation can spin up its own instance of this
  // module (and therefore its own Pool) — pg's default max of 10 per pool
  // multiplies with concurrent traffic and can blow through a pooled
  // provider's total connection budget fast (hit in production: Supabase's
  // session-mode pooler caps at 15 total and a handful of concurrent
  // requests exhausted it). Each invocation only ever runs one query at a
  // time here, so there's no real concurrency to serve within a single
  // instance — keep the per-instance pool small regardless of provider.
  max: 3
});

/** Rewrites node:sqlite-style "?" positional placeholders into Postgres's "$1, $2, ...". */
function toPgSql(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  if (!env.databaseUrl) return [];
  try {
    const result = await pool.query<T>(toPgSql(sql), params);
    return result.rows;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (!env.isProd && (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND")) {
      return [];
    }
    throw err;
  }
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<T | undefined> {
  if (!env.databaseUrl) return undefined;
  const rows = await query<T>(sql, params);
  return rows[0];
}

/** Runs a write query and returns the affected row count. */
export async function run(sql: string, params: unknown[] = []): Promise<{ rowCount: number }> {
  if (!env.databaseUrl) return { rowCount: 0 };
  try {
    const result = await pool.query(toPgSql(sql), params);
    return { rowCount: result.rowCount ?? 0 };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (!env.isProd && (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND")) {
      return { rowCount: 0 };
    }
    throw err;
  }
}

let schemaReady: Promise<void> | null = null;

/** Idempotent — safe to call on every cold start of a serverless function. */
export function initSchema(): Promise<void> {
  if (!schemaReady) {
    if (!env.databaseUrl) {
      schemaReady = Promise.resolve();
    } else {
      schemaReady = pool
        .query(SCHEMA_SQL)
        .then(() => undefined)
        .catch((err: unknown) => {
          if (!env.isProd) {
            const error = err as { message?: string };
            console.warn("[db] initSchema skipped in development:", error.message || err);
            return;
          }
          throw err;
        });
    }
  }
  return schemaReady;
}
