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
export {};
//# sourceMappingURL=read-surface-db-health.js.map