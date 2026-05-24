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
  vocab: string; // e.g. "ours", "ecosystem-2026q3", "legacy"
  valid_from?: string; // ISO date
}

/** A non-destructive pointer at existing storage (never a copy/rename). */
export interface ConceptRealizedBy {
  store: string; // e.g. "config/topology.json", "mesh.beliefs", "claims_unified"
  selector?: string; // e.g. "runner=...", "kind IN (...)"
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
  aspect?: string; // for substitutes_for: the respect in which they're interchangeable
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
export const BUILTIN_ONTOLOGY_REGISTRY: ConceptNodeRegistry = {
  slice: "ai-inference",
  schema_version: 0,
  facets_defined: {
    billing_model: ["subscription", "metered", "free", "credits"],
    auth_mode: ["oauth-keyring", "oauth", "api-key", "iam"],
    provider: ["anthropic", "openai", "google", "aws"],
    ownership: ["subject", "operator", "market", "trust"],
  },
  nodes: [
    {
      id: "ai-inference",
      level: "principle",
      label: "AI inference",
      stack_layer: "computation",
      facets: { computation_role: "stochastic" },
      note: "Producing model outputs from inputs. The general thing people name.",
    },
    {
      id: "subscription-metered-cli-agent",
      level: "pattern",
      label: "Subscription-metered CLI agent",
      specializes: "ai-inference",
      stack_layer: "agent",
      facets: {
        computation_role: "stochastic",
        interface: "cli",
        billing_model: "subscription",
        locality: "local-process",
        agent_disruption: "agent-native",
      },
      aliases: [
        { term: "subscription-metered CLI agent", vocab: "ours" },
        { term: "agentic CLI", vocab: "ecosystem-2026q2" },
        { term: "coding agent", vocab: "ecosystem-2026q2" },
        { term: "terminal agent", vocab: "ecosystem-2026q2" },
      ],
    },
    {
      id: "metered-api-inference",
      level: "pattern",
      label: "Metered API inference",
      specializes: "ai-inference",
      stack_layer: "computation",
      facets: { interface: "api", billing_model: "metered", locality: "cloud" },
    },
    {
      id: "claude-code-cli",
      level: "variant",
      label: "Claude Code CLI",
      specializes: "subscription-metered-cli-agent",
      facets: { provider: "anthropic", product: "claude-code" },
    },
    {
      id: "codex-cli",
      level: "variant",
      label: "Codex CLI",
      specializes: "subscription-metered-cli-agent",
      facets: { provider: "openai", product: "codex" },
    },
    {
      id: "gemini-cli",
      level: "variant",
      label: "Gemini CLI",
      specializes: "subscription-metered-cli-agent",
      facets: { provider: "google", product: "gemini-cli" },
    },
    {
      id: "bedrock",
      level: "variant",
      label: "AWS Bedrock",
      specializes: "metered-api-inference",
      facets: { provider: "aws" },
    },
  ],
  edges: [
    { kind: "substitutes_for", aspect: "coding-agent-fanout", a: "claude-code-cli", b: "codex-cli" },
    { kind: "substitutes_for", aspect: "coding-agent-fanout", a: "codex-cli", b: "gemini-cli" },
    { kind: "evolved_from", a: "subscription-metered-cli-agent", note: "Industry label unsettled; track-2 research keeps aliases current." },
  ],
};

/** Look up one concept node by id in a registry (default: built-in). */
export function getConceptNode(
  id: string,
  registry: ConceptNodeRegistry = BUILTIN_ONTOLOGY_REGISTRY,
): ConceptNode | undefined {
  return registry.nodes.find((n) => n.id === id);
}

/** All concept nodes at a given level. */
export function conceptsByLevel(
  level: ConceptLevel,
  registry: ConceptNodeRegistry = BUILTIN_ONTOLOGY_REGISTRY,
): ConceptNode[] {
  return registry.nodes.filter((n) => n.level === level);
}
