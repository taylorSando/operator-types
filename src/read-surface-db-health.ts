/**
 * `DbHealthSummary` — the stable wire shape mesh emits to console-ui for the
 * Postgres/storage health panel. DISTINCT from mesh's internal db-health
 * rollup (`summarizeDBHealth` returns a `map[string]any` in
 * `mesh/core/db_health.go`), which serializes the per-pool entries as
 * loosely-typed maps under BOTH a `pools` key AND a duplicate
 * `postgres_pools` key.
 *
 * ## The OR-fallback seam this closes (ledger fix)
 *
 * Because mesh emits the pool map under two keys, console-ui defends with
 * `summary.postgres_pools || summary.pools` (`HealthMeshStoragePanel.tsx`).
 * That OR-fallback is exactly the kind of consumer-side compensation a typed
 * contract exists to kill. This DTO CANONICALIZES the read shape onto a
 * single `pools: DbHealthPool[]` array (the genericity-ledger fix: "kill
 * `postgres_pools || pools`"). mesh's `toDTO()` boundary flattens the
 * internal `map[string]any` keyed by tier into a TYPED array, so console-ui
 * reads `summary.pools` unconditionally and the duplicate-key ambiguity is
 * gone at the source.
 *
 * The per-pool entry is a fixed, named struct (not a `map[string]any`): the
 * fields the storage panel renders — connection-pool counts (`in_use`,
 * `idle`), liveness, and size — are typed, while `tier` and `status` stay
 * OPEN strings the authority owns.
 *
 * ## Wire format
 *
 *   GET /api/db/health → DbHealthSummary   (the projected, single-keyed shape)
 */

/**
 * One typed Postgres pool entry on the health read surface. Replaces the
 * internal `map[string]any` pool entry. `pool_name` is the canonical
 * identifier (the internal rollup keys pools by tier, e.g. "fleet"/"local");
 * `toDTO()` lifts that key onto this named field.
 */
export interface DbHealthPool {
  /** Canonical pool identifier (e.g. "fleet", "local"). OPEN string. */
  pool_name: string;
  /**
   * Authority-resolved pool tier this entry belongs to (e.g. "fleet",
   * "local"). OPEN string — usually equal to `pool_name` but kept distinct
   * so an alias never forces an OR-fallback again.
   */
  tier: string;
  /** Authority-resolved pool status (e.g. "healthy", "degraded"). OPEN string. */
  status: string;
  /** Open database connections currently checked out (sql.DBStats.InUse). */
  in_use: number;
  /** Open database connections currently idle in the pool (sql.DBStats.Idle). */
  idle: number;
  /** Whether the pool is configured at all (vs. an unconfigured placeholder). */
  configured?: boolean;
  /** Whether this pool shares its database with the fleet primary. */
  shared_with_fleet?: boolean;
  /** Round-trip ping latency in milliseconds, when measured. */
  ping_ms?: number | null;
  /** Logical database name the pool connects to, when known. */
  database?: string | null;
  /** Database on-disk size in bytes, when measured. */
  db_size_bytes?: number | null;
  /** Error text when the pool is unreachable; empty/absent when healthy. */
  error?: string | null;
}

export interface DbHealthSummary {
  /**
   * Authority-resolved overall health status (e.g. "ok", "warning",
   * "unconfigured"). OPEN string.
   */
  status: string;
  /** Authority-resolved one-line human summary of pool health. */
  summary?: string | null;
  /**
   * The CANONICAL typed pool array. Single source — kills the
   * `postgres_pools || pools` OR-fallback by emitting exactly one key.
   */
  pools: DbHealthPool[];
  /** Issue type tags the rollup raised (e.g. "db_fleet_pool_unreachable"). */
  issue_types?: string[];
}
