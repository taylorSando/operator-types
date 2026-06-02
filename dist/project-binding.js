/**
 * `project_binding.v1` — the typed contract a project/sibling presents so the
 * mesh authority treats it as DATA, not as source compiled into the authority
 * binary (PLAN.md principle 1: "Authority defines the interface; the customer
 * is DATA").
 *
 * Today the authority registers each integration via a compiled
 * `ProjectRegistryEntry` literal returned from per-project Go files
 * (`mesh/core/project_integration_<name>.go`). This contract is the wire/data
 * shape that replaces that compiled literal: a project (or external sibling)
 * declares its binding once, and the authority loads it generically.
 *
 * GENERICITY GROUNDING — every field below was grep-verified against the
 * actual mesh shapes so this is NOT Sitelayer-coupled (MAXIMAL-BREAKDOWN §5):
 *
 *   - `mesh/core/project_integrations.go` `ProjectRegistryEntry`:
 *       ProjectName / GoalID / Description / GitRemoteURL / GitDefaultBranch.
 *     Verified identical across nhl(G04) / winwar(G13) / qedviz(NO goal) /
 *     sitelayer(NO goal). `GoalID` is empty for qedviz + sitelayer, present
 *     for nhl + winwar — so `goal_anchor` MUST be optional (see below).
 *   - `OperatorProjectEventSurface` (operator-event-taxonomy.ts):
 *       project_key / display_name / production_hosts[] / repo_names[].
 *   - `projects.url_patterns TEXT[]` (mesh migration 294/295), matched by
 *       `project_url_resolver.go` ResolveProjectFromURL — the data-driven
 *       URL→project binding that already replaced the hardcoded roster.
 *
 * THE LOAD-BEARING GENERICITY FIX (MAXIMAL-BREAKDOWN §5, ledger row 3):
 *   `goal_anchor` is OPTIONAL + an opaque string. It carries the mesh-internal
 *   GoalID (e.g. "G04" for nhl, "G13" for winwar) when the project happens to
 *   be anchored to a mesh goal — but qedviz has NO GoalID, and any external
 *   sibling has no mesh goal at all. Making it required (or a closed union of
 *   known GoalIDs) would re-bake a mesh-internal routing primitive into the
 *   customer contract and exclude every project without a goal. It is opaque
 *   (a free string the authority resolves) so the customer never has to know
 *   mesh's goal vocabulary.
 *
 * Additive-only, tag-pinned, no runtime side effects — same discipline as
 * `CaptureEnvelope`. A new field is added HERE and to the schema together;
 * `additionalProperties:false` in the schema makes drift a structural failure.
 */
export {};
//# sourceMappingURL=project-binding.js.map