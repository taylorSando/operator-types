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
/**
 * Narrow projection of the parsed `routing_json` blob — routing/lane hints
 * the read surface renders. Optional: tasks created outside the dispatch
 * path have no routing blob.
 */
export interface TaskRoutingDTO {
    /** Dispatch lane the routing hint selected (e.g. "light", "deep"). */
    lane?: string | null;
    /** Routing hint string the dispatcher resolved. */
    routing_hint?: string | null;
    /** Execution hint string carried alongside the routing hint. */
    execution_hint?: string | null;
}
/**
 * Narrow projection of the parsed `execution_json` blob — runtime/claim
 * facts the read surface renders. Optional: never the raw blob.
 */
export interface TaskExecutionDTO {
    /** Resolved runtime class (e.g. "cli", "browser", "service"). */
    runtime_class?: string | null;
    /** Workspace isolation class the execution resolved to. */
    workspace_class?: string | null;
    /** Claim mode recorded when the task was claimed. */
    claim_mode?: string | null;
}
/**
 * Narrow projection of the parsed `result_json` blob — outcome summary the
 * read surface renders. Optional: present only on finished tasks.
 */
export interface TaskResultDTO {
    /** Short human-readable result summary. */
    summary?: string | null;
    /** Count of artifacts the run produced. */
    artifact_count?: number | null;
    /** Worker/runner identity that produced the result. */
    worker?: string | null;
}
export interface TaskDTO {
    /** Numeric task identifier. Contract-owned key. */
    task_id: number;
    /**
     * Authority-resolved project slug the task belongs to (e.g. "sitelayer",
     * "nhl", "chess"). OPEN string — mesh resolves data-driven, not a roster
     * union.
     */
    project_key: string;
    /** Task subject / one-line title. */
    subject: string;
    /**
     * Authority-resolved lifecycle state (e.g. "pending", "in_progress",
     * "done"). OPEN string — the scheduler owns the vocabulary.
     */
    state: string;
    /** Authority-resolved priority (e.g. "low", "medium", "high"). OPEN string. */
    priority: string;
    /**
     * Authority-resolved dispatch mode (e.g. "steerer", "auto"). OPEN string;
     * rule-14 routing primitive resolved server-side, surfaced read-only.
     */
    dispatch_mode: string;
    /** ISO-8601 timestamp the task was created. */
    created_at: string;
    /** ISO-8601 timestamp the task was last updated. */
    updated_at: string;
    /**
     * Parsed projection of `routing_json`. OPTIONAL named sub-object — the raw
     * blob string is NOT passed through to the wire.
     */
    routing?: TaskRoutingDTO | null;
    /**
     * Parsed projection of `execution_json`. OPTIONAL named sub-object — the
     * raw blob string is NOT passed through to the wire.
     */
    execution?: TaskExecutionDTO | null;
    /**
     * Parsed projection of `result_json`. OPTIONAL named sub-object — the raw
     * blob string is NOT passed through to the wire.
     */
    result?: TaskResultDTO | null;
}
//# sourceMappingURL=read-surface-task.d.ts.map