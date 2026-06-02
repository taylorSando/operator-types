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
export {};
//# sourceMappingURL=read-surface-runner.js.map