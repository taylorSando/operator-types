/**
 * `RunnerSnapshot` — the stable wire shape mesh emits to console-ui for the
 * scheduler/runner read surface. DELIBERATELY NARROW: run-state + counts +
 * last-tick only. DISTINCT from mesh's internal `SchedulerStatus`
 * (`mesh/core/scheduler_status.go`), which additionally exposes scheduler
 * INTERNALS the read surface must NOT depend on:
 *   - `priority_profiles` (dispatch ordering policy)
 *   - `lane_environment_pools` (worktree/lane allocation config)
 *   - `homeostasis` (the self-regulation observation)
 *
 * Per the genericity-ledger fix for the runner read DTO: keep those internals
 * OUT. A runner snapshot is "is the scheduler ticking, how many are running,
 * when was the last tick" — the facts an ops dashboard renders — not the
 * authority's internal regulation state. mesh's `toDTO()` boundary projects
 * the status onto these fields so a console panel (or an NHL ops view) never
 * couples to scheduler policy internals.
 *
 * ## Authority resolution
 *
 * `run_state` and each runner's `status` are OPEN, authority-resolved strings
 * (the runner supervisor owns the vocabulary). Counts are plain integers.
 * Timestamps are ISO-8601.
 *
 * ## Wire format
 *
 *   GET /api/scheduler/status → RunnerSnapshot   (the narrowed projection)
 */

/**
 * One runner's run-state on the read surface. A narrow projection of the
 * internal advertised-runner shape (`RunnerOverview`) — identity + tool +
 * advertised status only, no priority/lane/homeostasis internals.
 */
export interface RunnerStateEntry {
  /** Runner identifier. Contract-owned key. */
  runner_id: string;
  /** Tool/family the runner executes (e.g. "claude", "codex", "gemini"). */
  tool?: string | null;
  /** Whether the runner definition is enabled. */
  enabled?: boolean;
  /**
   * Authority-resolved advertised run-state (e.g. "idle", "busy",
   * "offline"). OPEN string — the supervisor owns the vocabulary.
   */
  run_state: string;
}

export interface RunnerSnapshot {
  /**
   * Authority-resolved overall scheduler run-state (e.g. "running",
   * "stalled", "idle"). OPEN string.
   */
  run_state: string;
  /** Whether a scheduler tick is currently in flight. */
  tick_running: boolean;
  // --- counts (the headline ops numbers) ---------------------------------
  /** Number of currently-active (running) agents/runners. */
  active_count: number;
  /** Total dispatches the scheduler has performed since start. */
  total_dispatched: number;
  /** Dispatches performed in the most recent tick. */
  last_tick_dispatches?: number;
  /** Decisions evaluated in the most recent tick. */
  last_tick_decisions?: number;
  // --- last-tick liveness -------------------------------------------------
  /** ISO-8601 timestamp the most recent tick started. */
  last_tick_started_at?: string | null;
  /** ISO-8601 timestamp the most recent tick finished. */
  last_tick_finished_at?: string | null;
  /** Age of the last tick in milliseconds (staleness signal). */
  last_tick_age_ms?: number | null;
  /** Whether the last tick is considered stalled. */
  last_tick_stalled?: boolean;
  /**
   * Per-runner run-states (narrow projection). OPTIONAL — a snapshot that
   * only reports scheduler-level liveness may omit the per-runner array.
   */
  runners?: RunnerStateEntry[];
}
