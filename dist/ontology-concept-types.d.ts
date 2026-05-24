/**
 * Typed-ontology concept registry — the L0–L2 (general) layer of the
 * typed-ontology backbone (digital-ontology/ontology-typed-backbone-v0.md).
 *
 * Scope: this module holds the *type* layer only — Principle (L0),
 * Pattern (L1), Variant (L2). The Instance layer (L3 — your/our actual
 * deployed infra) lives in mesh (`ontology_nodes`), NOT here, because
 * instances are per-deployment terms, not shared types.
 *
 * Additive + non-destructive: adding/renaming terms is done by appending
 * `aliases`, never by mutating storage. Consumers opt in at their own pace.
 *
 * The Go mirror is `mesh/core/shared_ontology_types.go`; the control-plane
 * CI script `scripts/check-shared-types-consistency.sh` keeps them aligned
 * (same pattern as shared_envelope_types.go).
 */
export type ConceptLevel = "principle" | "pattern" | "variant";
/** A term-vocabulary entry: the same concept named differently across
 *  naming systems. Layering on a new term = appending one of these. */
export interface ConceptAlias {
    term: string;
    vocab: string;
    valid_from?: string;
}
/** A non-destructive pointer at existing storage (never a copy/rename). */
export interface ConceptRealizedBy {
    store: string;
    selector?: string;
}
/** A concept node at the type layer (L0–L2). */
export interface ConceptNode {
    id: string;
    level: ConceptLevel;
    label?: string;
    /** which thesis §1 stack layer (computation, agent, identity, ...) */
    stack_layer?: string;
    /** thesis §2 tag-dimension values; keys declared in facets_defined are closed */
    facets?: Record<string, string | string[]>;
    /** one rung more general (Variant->Pattern->Principle) */
    specializes?: string;
    aliases?: ConceptAlias[];
    realized_by?: ConceptRealizedBy[];
    note?: string;
}
/** Typed morphism between concepts beyond `specializes`. */
export interface ConceptEdge {
    kind: "substitutes_for" | "evolved_from" | "taps_into";
    a: string;
    b?: string;
    aspect?: string;
    note?: string;
}
/** One vertical slice of the ontology (a column drilled general->specific). */
export interface ConceptNodeRegistry {
    slice: string;
    schema_version: number;
    nodes: ConceptNode[];
    edges?: ConceptEdge[];
    facets_defined?: Record<string, string[]>;
}
/**
 * Built-in registry, seeded with the worked AI-inference column (L0–L2 only;
 * the L3 instances in digital-ontology/slices/ai-inference.slice.yaml are
 * deliberately omitted — they belong in mesh). Kept in lockstep with that
 * slice file via the slice validator.
 */
export declare const BUILTIN_ONTOLOGY_REGISTRY: ConceptNodeRegistry;
/** Look up one concept node by id in a registry (default: built-in). */
export declare function getConceptNode(id: string, registry?: ConceptNodeRegistry): ConceptNode | undefined;
/** All concept nodes at a given level. */
export declare function conceptsByLevel(level: ConceptLevel, registry?: ConceptNodeRegistry): ConceptNode[];
//# sourceMappingURL=ontology-concept-types.d.ts.map