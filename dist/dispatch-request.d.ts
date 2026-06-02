/**
 * `DispatchRequestV1` — the versioned work-OUT envelope a customer/sibling
 * project posts to the mesh authority to request that mesh dispatch a unit of
 * work (analysis, codegen, a sync run, a render batch, …) on the operator's
 * fleet. This is the OUTBOUND counterpart to the INBOUND `CaptureEnvelope`:
 * `CaptureEnvelope` is "data into mesh"; `DispatchRequestV1` is "work out of a
 * customer, into mesh."
 *
 * ## Why this exists (the contract it replaces)
 *
 * Today dispatch is 100% one producer (sitelayer) talking to the single wide
 * `/api/orchestrate/tasks` CRUD struct, smuggling routing intent through an
 * untyped `execution_context` bag and naming mesh-internal routing primitives
 * directly. That bakes a single monorepo's shape into the authority's intake.
 * This envelope is designed AGAINST the hardest cases (an NHL daily-sync with
 * topology host resolution, a chess puzzle-gen, a qedviz render-batch) and
 * VALIDATED against the easiest (sitelayer) — never the reverse.
 *
 * ## The one-way arrow + authority-side resolution
 *
 * The customer declares *what work it wants* in project-relative, capability
 * terms. The authority alone resolves *how* to route it (which class/tier,
 * which steerer workflow, which claim/dispatch mode, which concrete model,
 * which host). A customer must never name a mesh-internal routing primitive —
 * see the STRIP-LIST below; those are deliberately absent from this contract.
 *
 * ## Authority
 *
 *   Schema: ~/projects/operator-types/schemas/dispatch-request.schema.json
 *   (draft-07, additionalProperties:false). The schema is the source of truth;
 *   this interface mirrors it field-for-field (a contract test enforces sync).
 *
 * ## Wire format
 *
 *   POST /api/dispatch-requests  (HMAC-signed)  → 202 { request_id, ... }
 *
 * ## STRIP-LIST (deliberately NOT typed/required fields)
 *
 * These are mesh-internal routing primitives or single-monorepo shapes. They
 * MUST NOT appear as typed fields on this envelope; the authority resolves or
 * rejects them:
 *
 *   - `counsel_class`, `steerer_workflow_id` — mesh-internal routing. The
 *     authority resolves class → tier → steerer workflow itself. (`counsel_class`
 *     is, today, an advisory string the customer computes and routing ignores.)
 *   - `dispatch_mode`, `claim_mode` — execution_context smuggle. The authority
 *     decides auto vs steerer and the claim semantics.
 *   - `affected_packages` / `workspaces` — a monorepo workspace shape. If a
 *     producer genuinely needs to scope work to sub-packages, it goes as an
 *     OPAQUE key inside `payload`, never as a typed top-level field.
 *   - `project_hint:'sitelayer'` / `source_system:'sitelayer'` literals — these
 *     collapse into the OPAQUE `project_key` string the authority resolves
 *     (data-driven via `projects.url_patterns`), never a closed roster literal.
 *   - `requested_model:'claude'` — a concrete model name. The customer states a
 *     `requested_capability` (e.g. 'reasoning'); the authority picks the model.
 *   - any callback / webhook field — the work-result callback is its own typed
 *     contract, `CallbackClaimV1` (see `callback-claim.ts`), which mesh stores
 *     and executes itself rather than the customer describing it in prose.
 */
/**
 * The capability a unit of work needs — what the work *requires*, NOT which
 * concrete model/provider runs it. The authority maps capability → tier →
 * concrete model internally (so a customer never says `requested_model:'claude'`,
 * which would bake provider choice into the contract). OPEN-ended by design:
 * a sibling can request a capability the authority later learns to route; an
 * unrecognized capability is an authority-side resolution decision, not a
 * client-side contract break.
 *
 * - `reasoning`   — multi-step analysis / planning / decision (e.g. NHL
 *                   daily-sync reconciliation, sitelayer obstruction triage).
 * - `codegen`     — produce/modify code or structured artifacts (e.g. chess
 *                   puzzle-gen, a sitelayer feature change).
 * - `extraction`  — pull structured data out of unstructured input.
 * - `summarization` — condense a corpus into a digest.
 * - `transform`   — deterministic/templated data transform (e.g. a qedviz
 *                   render-batch, a daily-sync ETL step).
 * - `research`    — open-ended web/source gathering + synthesis.
 * - `classification` — label/route an item into a taxonomy.
 */
export type DispatchCapability = 'reasoning' | 'codegen' | 'extraction' | 'summarization' | 'transform' | 'research' | 'classification' | (string & {});
/**
 * Customer-declared urgency. Advisory: the authority maps this onto its own
 * tier/queue, it does NOT name a mesh queue. OPEN union so a producer can add a
 * band without a contract break; the authority clamps unknowns.
 */
export type DispatchPriority = 'low' | 'normal' | 'high' | 'urgent' | (string & {});
/**
 * The subject the work is *about* — a stable, project-relative pointer (an
 * issue id, a record id, a date partition for a daily-sync, a puzzle-set id, a
 * render-batch id). Project-relative on purpose: mesh does not need to
 * understand the customer's internal id space, only echo it back on the
 * callback so the customer can correlate the result.
 */
export interface DispatchSubject {
    /** Customer-relative kind of the subject (e.g. 'issue', 'record', 'date_partition', 'puzzle_set', 'render_batch'). */
    type: string;
    /** Customer-relative identifier within `type`. Opaque to mesh. */
    id: string;
    /** Optional human-readable label for the subject (logs / dashboards). */
    label?: string | null;
}
/**
 * Typed-OPEN payload object — the structured, project-specific work inputs.
 * This REPLACES the untyped `execution_context` smuggle bag: instead of mesh's
 * intake copying named routing keys out of an any-bag, the customer puts only
 * its own domain data here and mesh treats it as an opaque pass-through that is
 * handed to the resolved worker. Anything monorepo-shaped (e.g. `workspaces`,
 * `affected_packages`) lives HERE as an opaque key if needed — never as a typed
 * top-level field. Mesh does not route on `payload` contents.
 */
export type DispatchPayload = Record<string, unknown>;
export interface DispatchRequestV1 {
    /** Envelope schema version. Const '1' for this contract; bumped only on a breaking change. */
    schema_version: '1';
    /**
     * Producer-supplied idempotent request id (a UUID/ULID the customer mints).
     * Echoed on the callback so the producer can correlate result → request.
     * Distinct from `idempotency_key`, which de-dupes server-side acceptance.
     */
    request_id?: string;
    /**
     * OPAQUE stable project key the authority resolves to a registered
     * integration (repo/host/goal binding) data-driven from `projects.url_patterns`.
     * NOT a closed-roster literal and NOT a 'sitelayer' literal — any registered
     * sibling ('nhl', 'chess', 'qedviz', …) or a future one supplies its own
     * string. The single required routing field.
     */
    project_key: string;
    /**
     * What the customer wants done, in its own domain vocabulary (e.g.
     * 'daily_sync', 'generate_puzzles', 'render_batch', 'triage_obstruction').
     * Free-form: the authority maps (project_key, intent) → its routing, it does
     * not constrain the customer's task taxonomy. Required — an envelope with no
     * intent has nothing to dispatch.
     */
    intent: string;
    /**
     * Optional finer-grained task kind within `intent`, when a producer wants to
     * distinguish variants (e.g. intent='render_batch', task_kind='thumbnails').
     * Advisory; the authority may route on it but never requires it.
     */
    task_kind?: string | null;
    /** What the work is about — a project-relative pointer mesh echoes back. */
    subject?: DispatchSubject | null;
    /** Free-form human-readable body / instructions for the work. */
    body?: string | null;
    /** Advisory urgency band; the authority maps it onto its own tiers. */
    priority?: DispatchPriority;
    /**
     * The CAPABILITY the work needs (e.g. 'reasoning', 'codegen') — NOT a concrete
     * model. The authority resolves capability → tier → model. Optional: if
     * omitted the authority infers from (project_key, intent).
     */
    requested_capability?: DispatchCapability | null;
    /**
     * Typed-OPEN, opaque structured work inputs. Replaces the execution_context
     * smuggle bag. Mesh passes it through to the resolved worker; it does not
     * route on its contents. Monorepo-shaped data (workspaces / affected packages)
     * goes here as opaque keys if at all.
     */
    payload?: DispatchPayload | null;
    /**
     * Who/what on the customer side authored the request (a user id, a service
     * name, a cron identity). Advisory provenance for audit; not a routing key.
     */
    created_by?: string | null;
    /**
     * Server-side de-dupe key. Two requests with the same `idempotency_key` for
     * the same `project_key` MUST collapse to one accepted dispatch. Distinct from
     * `request_id` (which is the producer's correlation handle, not a de-dupe key).
     */
    idempotency_key?: string | null;
}
//# sourceMappingURL=dispatch-request.d.ts.map