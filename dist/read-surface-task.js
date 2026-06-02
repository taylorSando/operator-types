/**
 * `TaskDTO` — the stable wire shape mesh emits to console-ui for a single
 * orchestrated task on the read surface. DISTINCT from mesh's internal
 * `Task` row struct (`mesh/internal/types/types.go`), whose json tags are the
 * Postgres column names and which carries ~40 orchestration columns plus
 * three raw JSON blob strings (`routing_json`, `execution_json`,
 * `result_json`).
 *
 * ## The blob-passthrough seam this closes (ledger fix)
 *
 * The row struct ships `RoutingJSON`/`ExecutionJSON`/`ResultJSON` as RAW
 * JSON STRINGS — opaque blobs the row never parses. The genericity-ledger
 * fix for the task DTO is: do NOT pass the raw `*_json` blobs through to the
 * wire. The `toDTO()` boundary PARSES each blob and projects the handful of
 * fields the read surface actually renders into NAMED, OPTIONAL sub-objects
 * (`TaskRoutingDTO` / `TaskExecutionDTO` / `TaskResultDTO`). A consumer reads
 * `task.routing?.lane` instead of `JSON.parse(task.routing_json).lane`, so a
 * blob-internal key rename is a typecheck failure in this shared package
 * consumed by BOTH sides' CI, not a silent `undefined` at runtime.
 *
 * The sub-objects are deliberately a NARROW projection (not the full blob) —
 * additive: a new blob key the read surface needs gets a new optional field
 * here, never a wholesale blob round-trip.
 *
 * ## Authority resolution
 *
 * `state`, `priority`, and `dispatch_mode` are OPEN, authority-resolved
 * strings (the scheduler owns the vocabulary). `project_key` is the
 * authority-resolved project slug (mesh resolves it data-driven from
 * `projects.url_patterns`), NOT a closed roster union — see WS8's removal of
 * `OperatorProjectKey`.
 *
 * ## Wire format
 *
 *   GET /api/orchestrate/tasks → { tasks: TaskDTO[] }   (the projected shape)
 */
export {};
//# sourceMappingURL=read-surface-task.js.map