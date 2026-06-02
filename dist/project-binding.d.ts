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
/** The single declared version of this contract. Bumped only on a breaking
 * change (expand/backfill/contract); additive fields do NOT bump it. */
export type ProjectBindingSchemaVersion = '1.0';
export interface ProjectBindingV1 {
    /**
     * Stable shared project key (e.g. "nhl", "winwar", "qedviz", "sitelayer").
     * The authority's primary identity for the project; resolves dispatch,
     * routing, and runtime-deps attribution. Maps to
     * `ProjectRegistryEntry.ProjectName` and `projects.name`. Open string — the
     * roster is data-driven, NOT a closed 9-member union (MAXIMAL-BREAKDOWN §5
     * ledger row 4: the old `OperatorProjectKey` union omitted half the
     * registered projects).
     */
    project_key: string;
    /**
     * OPTIONAL + OPAQUE mesh GoalID this project is anchored to, when one exists
     * (e.g. "G04" for nhl, "G13" for winwar). Maps to
     * `ProjectRegistryEntry.GoalID`.
     *
     * LOAD-BEARING: qedviz has no GoalID and any external sibling has no mesh
     * goal, so this MUST stay optional and an opaque free string — never
     * required, never a closed enum of known goal ids. The authority resolves
     * the anchor internally; the customer is not required to know mesh's goal
     * vocabulary.
     */
    goal_anchor?: string | null;
    /**
     * Human-facing label for the project (e.g. "Sitelayer", "Hockeypedia").
     * Maps to `OperatorProjectEventSurface.display_name`. When a project only
     * supplies the registry-entry `Description`, that prose may seed this field;
     * a richer one-line description can additionally ride in `description`.
     */
    display_name?: string | null;
    /**
     * Longer free-form description of what the project is / does. Maps to
     * `ProjectRegistryEntry.Description`. Distinct from `display_name`: this is
     * the sentence-length blurb, that is the short label.
     */
    description?: string | null;
    /**
     * Canonical git remote (e.g. "git@github.com:taylorSando/nhl.git",
     * "git@github.com:GitSteveLozano/sitelayer.git"). Maps to
     * `ProjectRegistryEntry.GitRemoteURL`. Optional — winwar registers without
     * one. Opaque to the authority (no monorepo/workspace shape assumed).
     */
    git_remote_url?: string | null;
    /**
     * Default branch of `git_remote_url`. FREE STRING — most projects use "main"
     * but chess uses "master", so this is never a closed union (MAXIMAL-BREAKDOWN
     * §5 ledger row 3: "git_default_branch free string (chess=master)"). Maps to
     * `ProjectRegistryEntry.GitDefaultBranch`.
     */
    git_default_branch?: string | null;
    /**
     * Repository names that belong to this project (a project may span several,
     * e.g. browser-bridge = ["control-plane/browser-bridge",
     * "browser-bridge-sidecar"]). Maps to
     * `OperatorProjectEventSurface.repo_names`. Opaque slugs — the authority
     * does NOT interpret monorepo/workspace structure from them.
     */
    repo_names?: string[];
    /**
     * Production hostnames the project serves (e.g. ["hockeypedia.org",
     * "www.hockeypedia.org"]). Maps to
     * `OperatorProjectEventSurface.production_hosts`. May be empty for projects
     * with no public surface (browser-bridge, voice-tools).
     */
    production_hosts?: string[];
    /**
     * URL patterns that auto-bind a captured/narrated page to this project,
     * matched by `project_url_resolver.go` ResolveProjectFromURL. Maps to
     * `projects.url_patterns` (mesh migration 294/295). Pattern grammar:
     * "exact.host.tld" | "*.domain.tld" | "host.tld/path-prefix" |
     * "*.domain.tld/path-prefix". Empty = no auto-binding.
     */
    url_patterns?: string[];
}
/**
 * The wrapping shape a project presents to the authority's binding loader: the
 * binding keyed under a stable `project_binding` field with its declared
 * `schema_version`, so the loader can address + version it predictably (mirror
 * of `CaptureEnvelopeProperties`).
 */
export interface ProjectBindingDocumentV1 {
    schema_version: ProjectBindingSchemaVersion;
    project_binding: ProjectBindingV1;
}
//# sourceMappingURL=project-binding.d.ts.map