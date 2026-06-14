// ============================================================================
// Postgres-backed drop-in for the Supabase client.
//
// The app was originally written against `@supabase/supabase-js`. This module
// keeps the EXACT same call-site API (`getServiceClient().from(...).select(...)
// .eq(...)...`) but executes everything against a plain PostgreSQL database via
// `pg`. Nothing else in the codebase had to change.
//
// Supported surface (only what the app actually uses):
//   .from(table)
//   .select(cols, { count, head })   — incl. embeds: "alias:child_table(*)"
//   .eq / .neq / .ilike
//   .not(col, "in", "(a,b,c)")
//   .order(col, { ascending })
//   .limit(n)
//   .single()
//   .insert(values)[.select(cols)][.single()]
//   .update(values).eq(...)
//   .rpc(name, params)
//
// Every awaited builder resolves to `{ data, error, count }`, mirroring
// supabase-js — including the `PGRST116` error code for `.single()` with no row.
// ============================================================================

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool, types } from "pg";

// ── Type parsers ────────────────────────────────────────────────────────────
// Make pg return values shaped like PostgREST/supabase-js JSON so the app's
// numeric math and date rendering behave identically.
types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v))); // numeric
types.setTypeParser(20, (v) => (v === null ? null : parseInt(v, 10))); // int8/bigint
types.setTypeParser(1114, (v) => v); // timestamp   -> raw string
types.setTypeParser(1184, (v) => v); // timestamptz -> raw string
types.setTypeParser(1082, (v) => v); // date        -> raw string

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("Missing DATABASE_URL environment variable");
    }
    pool = new Pool({
      connectionString,
      max: Number(process.env.PG_POOL_MAX || 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return pool;
}

// ── Relationship registry ───────────────────────────────────────────────────
// Describes how embedded selects (`alias:child(*)`) join to their parent.
//   kind   "to-one"  → parent.localKey === child.foreignKey, attach object|null
//          "to-many" → child.foreignKey === parent.localKey, attach array
type Relation = {
  child: string;
  kind: "to-one" | "to-many";
  localKey: string; // column on the parent row
  foreignKey: string; // column on the child row
};

const RELATIONS: Record<string, Record<string, Relation>> = {
  products: {
    categories: { child: "categories", kind: "to-one", localKey: "category_id", foreignKey: "id" },
    product_images: { child: "product_images", kind: "to-many", localKey: "id", foreignKey: "product_id" },
    product_variants: { child: "product_variants", kind: "to-many", localKey: "id", foreignKey: "product_id" },
  },
  orders: {
    order_items: { child: "order_items", kind: "to-many", localKey: "id", foreignKey: "order_id" },
  },
  campaigns: {
    campaign_daily_stats: { child: "campaign_daily_stats", kind: "to-many", localKey: "id", foreignKey: "campaign_id" },
  },
};

// ── select-string parsing ───────────────────────────────────────────────────
type Embed = { alias: string; relation: Relation };
type ParsedSelect = { baseColumns: "*" | string[]; embeds: Embed[] };

// Split a select list on top-level commas, respecting parentheses.
function splitTopLevel(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of input) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
}

function parseSelect(table: string, select: string): ParsedSelect {
  const tokens = splitTopLevel(select);
  const baseColumns: string[] = [];
  const embeds: Embed[] = [];
  let star = false;

  for (const token of tokens) {
    const embedMatch = token.match(/^(\w+)\s*:\s*(\w+)\s*\(([\s\S]*)\)$/);
    if (embedMatch) {
      const alias = embedMatch[1];
      const childTable = embedMatch[2];
      const relation = RELATIONS[table]?.[childTable];
      if (!relation) {
        throw new Error(`No relation registered for ${table} -> ${childTable}`);
      }
      embeds.push({ alias, relation });
      continue;
    }
    if (token === "*") {
      star = true;
      continue;
    }
    baseColumns.push(token);
  }

  return { baseColumns: star ? "*" : baseColumns, embeds };
}

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

// ── Query builder ───────────────────────────────────────────────────────────
type Filter =
  | { kind: "eq" | "neq" | "ilike"; col: string; val: unknown }
  | { kind: "not-in"; col: string; vals: string[] };

type Order = { col: string; ascending: boolean };

type PgError = { message: string; code?: string };

// `data` is typed `any` on purpose: the original supabase-js calls were
// untyped (no generated DB types), so call sites freely access row fields.
type Result<T = any> = { data: T; error: PgError | null; count: number | null };

class QueryBuilder implements PromiseLike<Result> {
  private table: string;
  private op: "select" | "insert" | "update" = "select";
  private selectStr = "*";
  private returningStr: string | null = null;
  private filters: Filter[] = [];
  private orders: Order[] = [];
  private limitN: number | null = null;
  private singleRow = false;
  private countMode: "exact" | null = null;
  private headOnly = false;
  private values: Record<string, unknown> | Record<string, unknown>[] | null = null;

  constructor(table: string) {
    this.table = table;
  }

  // ----- SELECT -----
  select(columns = "*", opts?: { count?: "exact"; head?: boolean }): QueryBuilder {
    if (this.op === "insert" || this.op === "update") {
      this.returningStr = columns;
    } else {
      this.selectStr = columns || "*";
    }
    if (opts?.count) this.countMode = opts.count;
    if (opts?.head) this.headOnly = true;
    return this;
  }

  // ----- filters -----
  eq(col: string, val: unknown): QueryBuilder {
    this.filters.push({ kind: "eq", col, val });
    return this;
  }
  neq(col: string, val: unknown): QueryBuilder {
    this.filters.push({ kind: "neq", col, val });
    return this;
  }
  ilike(col: string, val: unknown): QueryBuilder {
    this.filters.push({ kind: "ilike", col, val });
    return this;
  }
  not(col: string, operator: string, val: string): QueryBuilder {
    if (operator !== "in") {
      throw new Error(`Unsupported .not() operator: ${operator}`);
    }
    const inner = val.trim().replace(/^\(/, "").replace(/\)$/, "");
    const vals = inner
      .split(",")
      .map((s) => s.trim().replace(/^"|"$/g, ""))
      .filter(Boolean);
    this.filters.push({ kind: "not-in", col, vals });
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }): QueryBuilder {
    this.orders.push({ col, ascending: opts?.ascending !== false });
    return this;
  }

  limit(n: number): QueryBuilder {
    this.limitN = n;
    return this;
  }

  single(): QueryBuilder {
    this.singleRow = true;
    return this;
  }

  maybeSingle(): QueryBuilder {
    this.singleRow = true;
    return this;
  }

  // ----- mutations -----
  insert(values: Record<string, unknown> | Record<string, unknown>[]): QueryBuilder {
    this.op = "insert";
    this.values = values;
    return this;
  }

  update(values: Record<string, unknown>): QueryBuilder {
    this.op = "update";
    this.values = values;
    return this;
  }

  // ----- WHERE builder shared by select/update -----
  private buildWhere(params: unknown[]): string {
    if (this.filters.length === 0) return "";
    const clauses = this.filters.map((f) => {
      if (f.kind === "not-in") {
        if (f.vals.length === 0) return "TRUE";
        params.push(f.vals);
        return `${quoteIdent(f.col)}::text <> ALL($${params.length})`;
      }
      if (f.kind === "eq" && f.val === null) {
        return `${quoteIdent(f.col)} IS NULL`;
      }
      params.push(f.val);
      const ph = `$${params.length}`;
      if (f.kind === "eq") return `${quoteIdent(f.col)} = ${ph}`;
      if (f.kind === "neq") return `${quoteIdent(f.col)} <> ${ph}`;
      return `${quoteIdent(f.col)} ILIKE ${ph}`;
    });
    return ` WHERE ${clauses.join(" AND ")}`;
  }

  // ----- execution -----
  private async run(): Promise<Result> {
    try {
      if (this.op === "insert") return await this.runInsert();
      if (this.op === "update") return await this.runUpdate();
      return await this.runSelect();
    } catch (err) {
      const e = err as { message?: string; code?: string };
      return {
        data: null,
        error: { message: e?.message || "Database error", code: e?.code },
        count: null,
      };
    }
  }

  private async runSelect(): Promise<Result> {
    const params: unknown[] = [];

    // COUNT / head request
    if (this.headOnly || this.countMode) {
      const where = this.buildWhere(params);
      const { rows } = await getPool().query(
        `SELECT count(*)::int AS count FROM ${quoteIdent(this.table)}${where}`,
        params
      );
      const count = rows[0]?.count ?? 0;
      return { data: this.headOnly ? null : [], error: null, count };
    }

    const parsed = parseSelect(this.table, this.selectStr);

    // Ensure embed local keys are present even on narrow selects.
    let cols = "*";
    if (parsed.baseColumns !== "*") {
      const set = new Set(parsed.baseColumns);
      for (const e of parsed.embeds) set.add(e.relation.localKey);
      cols = [...set].map(quoteIdent).join(", ");
    }

    const where = this.buildWhere(params);
    let sql = `SELECT ${cols} FROM ${quoteIdent(this.table)}${where}`;
    if (this.orders.length) {
      sql +=
        " ORDER BY " +
        this.orders
          .map((o) => `${quoteIdent(o.col)} ${o.ascending ? "ASC" : "DESC"}`)
          .join(", ");
    }
    if (this.singleRow) sql += " LIMIT 1";
    else if (this.limitN != null) sql += ` LIMIT ${this.limitN}`;

    const { rows } = await getPool().query(sql, params);

    // Resolve embeds with secondary queries.
    for (const embed of parsed.embeds) {
      await this.attachEmbed(rows, embed);
    }

    if (this.singleRow) {
      if (rows.length === 0) {
        return { data: null, error: { message: "No rows found", code: "PGRST116" }, count: null };
      }
      return { data: rows[0], error: null, count: null };
    }
    return { data: rows, error: null, count: null };
  }

  private async attachEmbed(
    parentRows: Record<string, unknown>[],
    embed: Embed
  ): Promise<void> {
    const { alias, relation } = embed;
    const keys = [
      ...new Set(
        parentRows
          .map((r) => r[relation.localKey])
          .filter((v) => v !== null && v !== undefined)
      ),
    ];

    if (keys.length === 0) {
      for (const r of parentRows) r[alias] = relation.kind === "to-many" ? [] : null;
      return;
    }

    const { rows: childRows } = await getPool().query(
      `SELECT * FROM ${quoteIdent(relation.child)} WHERE ${quoteIdent(
        relation.foreignKey
      )}::text = ANY($1)`,
      [keys.map((k) => String(k))]
    );

    for (const parent of parentRows) {
      const localVal = String(parent[relation.localKey]);
      const matches = childRows.filter(
        (c) => String(c[relation.foreignKey]) === localVal
      );
      parent[alias] = relation.kind === "to-many" ? matches : matches[0] ?? null;
    }
  }

  private async runInsert(): Promise<Result> {
    const rowsIn = Array.isArray(this.values) ? this.values : [this.values];
    if (rowsIn.length === 0 || !rowsIn[0]) {
      return { data: null, error: null, count: null };
    }
    const columns = Object.keys(rowsIn[0] as Record<string, unknown>);
    const params: unknown[] = [];
    const valueClauses = rowsIn.map((row) => {
      const placeholders = columns.map((c) => {
        params.push((row as Record<string, unknown>)[c]);
        return `$${params.length}`;
      });
      return `(${placeholders.join(", ")})`;
    });

    let sql = `INSERT INTO ${quoteIdent(this.table)} (${columns
      .map(quoteIdent)
      .join(", ")}) VALUES ${valueClauses.join(", ")}`;
    if (this.returningStr) {
      sql += ` RETURNING ${
        this.returningStr === "*"
          ? "*"
          : splitTopLevel(this.returningStr).map(quoteIdent).join(", ")
      }`;
    }

    const { rows } = await getPool().query(sql, params);
    if (this.returningStr) {
      if (this.singleRow) return { data: rows[0] ?? null, error: null, count: null };
      return { data: rows, error: null, count: null };
    }
    return { data: null, error: null, count: null };
  }

  private async runUpdate(): Promise<Result> {
    const row = (this.values || {}) as Record<string, unknown>;
    const columns = Object.keys(row);
    const params: unknown[] = [];
    const setClause = columns
      .map((c) => {
        params.push(row[c]);
        return `${quoteIdent(c)} = $${params.length}`;
      })
      .join(", ");

    const where = this.buildWhere(params);
    let sql = `UPDATE ${quoteIdent(this.table)} SET ${setClause}${where}`;
    if (this.returningStr) {
      sql += ` RETURNING ${
        this.returningStr === "*"
          ? "*"
          : splitTopLevel(this.returningStr).map(quoteIdent).join(", ")
      }`;
    }

    const { rows } = await getPool().query(sql, params);
    if (this.returningStr) {
      if (this.singleRow) return { data: rows[0] ?? null, error: null, count: null };
      return { data: rows, error: null, count: null };
    }
    return { data: null, error: null, count: null };
  }

  // Thenable: `await builder` resolves to { data, error, count }.
  then<TResult1 = Result, TResult2 = never>(
    onfulfilled?: ((value: Result) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.run().then(onfulfilled, onrejected);
  }
}

// ── Client surface ──────────────────────────────────────────────────────────
class PostgresClient {
  from(table: string): QueryBuilder {
    return new QueryBuilder(table);
  }

  async rpc(fn: string, params: Record<string, unknown> = {}): Promise<Result> {
    try {
      const keys = Object.keys(params);
      const args = keys.map((k, i) => `${k} => $${i + 1}`).join(", ");
      const sql = `SELECT ${quoteIdent(fn)}(${args}) AS result`;
      const { rows } = await getPool().query(
        sql,
        keys.map((k) => params[k])
      );
      return { data: rows[0]?.result ?? null, error: null, count: null };
    } catch (err) {
      const e = err as { message?: string; code?: string };
      return { data: null, error: { message: e?.message || "RPC error", code: e?.code }, count: null };
    }
  }
}

// Service-role client (full DB access). Access control is enforced in
// app middleware + server actions, not via Postgres RLS.
export function getServiceClient(): PostgresClient {
  return new PostgresClient();
}

// Kept for import compatibility with the old module.
export const supabase = new PostgresClient();
