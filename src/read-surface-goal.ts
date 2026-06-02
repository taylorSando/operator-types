/**
 * `GoalDTO` — the stable wire shape mesh emits to console-ui for a single
 * goal on the read surface. This is the OPERATOR-READ contract, deliberately
 * DISTINCT from mesh's internal DB-row struct (`GoalRow` in
 * `mesh/internal/types/types.go`, whose json tags ARE the Postgres column
 * names). A column rename on the row struct must NOT ripple into console-ui;
 * mesh's `toDTO()` boundary projects the row onto these contract-owned field
 * names so the read surface can be held stable while either side refactors.
 *
 * ## Why a separate DTO (the seam this closes)
 *
 * Today mesh serializes `GoalRow` verbatim and console-ui re-decodes the
 * column-named fields plus the flywheel aggregates (`proposals`,
 * `pending_proposals`, `workflow_attention`, `recent_workflows`). Those
 * aggregates are mesh-internal flywheel telemetry, not the base read shape —
 * a goals dashboard, an NHL ops panel, or a qedviz status tile only needs the
 * identity + headline progress. Per the genericity ledger (read-surface DTOs
 * row): keep the flywheel aggregates OUT of the base DTO; they are optional
 * detail only, so a consumer that does not render them never sees them and
 * never breaks when their internal shape churns.
 *
 * ## Authority resolution
 *
 * - `status` and `time_horizon` are OPEN strings resolved by the mesh
 *   authority (goal lifecycle + the goal-brake horizon classifier). Consumers
 *   must not enumerate a closed union — the authority owns the vocabulary.
 * - `progress_pct` is a canonical 0–100 percentage. The row struct carries a
 *   `progress` float (0–1 in some paths, 0–100 in others); the `toDTO()`
 *   boundary normalizes to a single percentage so console-ui never guesses
 *   the scale.
 *
 * ## Wire format
 *
 *   GET /api/goals → { goals: GoalDTO[] }   (read path; the projected shape)
 */
export interface GoalDTO {
  /** Stable goal identifier (e.g. "G04"). Contract-owned key. */
  goal_id: string;
  /** Human-readable goal title. */
  title: string;
  /**
   * Authority-resolved lifecycle status (e.g. "active", "done",
   * "proposed"). OPEN string — mesh owns the vocabulary; do not enumerate.
   */
  status: string;
  /** Canonical completion percentage in [0, 100]. Normalized at toDTO(). */
  progress_pct: number;
  /**
   * Authority-resolved planning horizon (e.g. "delivery", "evergreen",
   * "maintenance", "quarterly", "long"). OPEN string + OPTIONAL — siblings
   * with no horizon classification simply omit it.
   */
  time_horizon?: string | null;
  /** ISO-8601 timestamp the goal row was last updated. */
  updated_at: string;
}

/**
 * `GoalDTODetail` — OPTIONAL flywheel-detail extension. Stripped from the
 * base `GoalDTO` per the genericity ledger so the base read shape stays
 * project-agnostic; a consumer that renders the control-plane flywheel asks
 * for the detail surface explicitly. Every field is optional so an emitter
 * that has no flywheel context (an external sibling, a non-mesh goal) emits
 * the base shape with nothing extra.
 */
export interface GoalDTODetail extends GoalDTO {
  /** Number of open research/synthesis proposals anchored to this goal. */
  proposal_count?: number;
  /** Subset of `proposal_count` still pending operator/authority review. */
  pending_proposals?: number;
  /** Count of currently-open tasks anchored to the goal. */
  open_task_count?: number;
  /** Count of in-flight (active) tasks anchored to the goal. */
  active_task_count?: number;
}
