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
export {};
//# sourceMappingURL=dispatch-request.js.map