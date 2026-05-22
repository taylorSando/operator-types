/**
 * `OperatorContextPacket` — the typed view of the operator-context
 * handshake. The control-plane browser-bridge content script sets
 * `window.__operatorContext` on operator-owned sites and dispatches the
 * `operator-context-ready` CustomEvent on every refresh. Each consumer
 * app reads this packet to render operator-aware UI.
 *
 * Wire-shape origin: sitelayer's `apps/web/src/lib/operator-context.ts`
 * (the current authoritative copy). Mirrors the gateway route at
 * `console/gateway/routes/operator-context.js`. If the gateway adds
 * fields, extend this interface here.
 *
 * Design doc: digital-ontology/operator-context-handshake-design.md.
 */
export interface OperatorContextActivity {
    ts: string | null;
    kind: string;
    summary: string;
    evidence_ref?: string;
}
export interface OperatorContextOriginContext {
    project: string;
    label: string;
    repo_branch?: string | null;
    repo_dirty?: boolean;
    recent_commits?: Array<{
        sha: string;
        ts: string;
        summary: string;
    }>;
}
export interface OperatorContextActiveProject {
    name: string;
    last_touched?: string | null;
    signal?: number;
}
export interface OperatorContextPacket {
    subject: string;
    generated_at: string;
    origin: string;
    current_focus: {
        label: string;
        confidence: number;
        started?: string | null;
        evidence_ref?: string | null;
    };
    recent_activity: OperatorContextActivity[];
    active_projects: OperatorContextActiveProject[];
    origin_context: OperatorContextOriginContext;
    attestations?: string[];
    meta: {
        /** Budget posture — `'tight' | 'normal' | 'deep'` plus future tokens. */
        budget: 'tight' | 'normal' | 'deep' | string;
        mesh_available: boolean;
        schema_version: number;
    };
}
/**
 * Error envelope set on `window.__operatorContext` when the handshake
 * fails (the content script writes either the packet or this).
 */
export interface OperatorContextError {
    error: string;
    generated_at: string;
    origin?: string;
}
/**
 * Stable CustomEvent name dispatched by the content script after a
 * successful refresh. Consumers can subscribe directly.
 */
export declare const OPERATOR_CONTEXT_READY_EVENT = "operator-context-ready";
/**
 * Tag this surface uses when broadcasting an explicit refresh request.
 * Pages can dispatch a `${EVENT}-refresh` event to force the content
 * script to re-fetch from the gateway.
 */
export declare const OPERATOR_CONTEXT_REFRESH_EVENT: "operator-context-ready-refresh";
//# sourceMappingURL=operator-context.d.ts.map