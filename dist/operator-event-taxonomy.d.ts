/**
 * Event taxonomy for dev/debug operator traces.
 *
 * This module names the cross-project vocabulary used inside
 * `OperatorTraceEvent.payload`. It intentionally does not replace each
 * project's domain-specific `event_type` strings. Existing events such as
 * `winwar.turn.accepted` and `sandolab.aquarium.tick` can keep their names
 * while carrying the common fields below.
 */
export type OperatorProjectKey = 'sitelayer' | 'hockeypedia' | 'sandolab' | 'winwar' | 'chess' | 'learn' | 'browser-bridge' | 'voice-tools' | 'screen-capture';
export type OperatorEventDomain = 'operator' | 'browser' | 'controlled_app' | 'voice' | 'screen' | 'attention' | 'mesh';
export type OperatorEventClass = 'lifecycle' | 'state_snapshot' | 'navigation' | 'workflow_state' | 'workflow_event' | 'user_action' | 'entity_view' | 'entity_change' | 'network_request' | 'runtime_error' | 'media_segment' | 'attention_window' | 'capture' | 'diagnostic';
export type OperatorEventOutcome = 'requested' | 'started' | 'succeeded' | 'failed' | 'blocked' | 'conflict' | 'stale' | 'retrying' | 'healthy' | 'degraded' | 'unavailable' | 'abandoned' | 'completed' | 'partial_failure' | 'cancelled' | 'accepted' | 'rejected' | 'skipped' | 'unknown';
export type OperatorEventRedactionStatus = 'raw' | 'redacted' | 'summary_only' | 'pointer_only';
export interface OperatorTraceEntityRef {
    kind: string;
    id?: string | number | null;
    name?: string | null;
}
export type OperatorUserStateCanonicality = 'server_authoritative' | 'durable_log' | 'statechart' | 'url_derived' | 'client_local' | 'operator_probe_only';
export interface OperatorUserStateSnapshot {
    kind?: string;
    mode?: string;
    surface?: string;
    intent?: string | null;
    auth_state?: string;
    session_state?: string;
    workflow_state?: string;
    entity_kind?: string;
    entity_id?: string | number | null;
    blocking_status?: 'none' | 'blocked' | 'degraded' | 'unknown';
    blocking_reason?: string | null;
    pending_count?: number;
    error_count?: number;
    last_success_at?: string | null;
    last_error_at?: string | null;
    staleness_seconds?: number;
    confidence?: number;
    canonicality?: OperatorUserStateCanonicality;
    [key: string]: unknown;
}
export interface OperatorTraceStandardPayload {
    /**
     * Taxonomy version for payload-level normalization. The enclosing
     * OperatorTraceEvent keeps its own wire schema_version.
     */
    event_schema_version?: 'operator_event_taxonomy.v1';
    project_key?: OperatorProjectKey;
    environment?: string;
    build_sha?: string;
    source_surface?: string;
    event_domain?: OperatorEventDomain;
    event_class?: OperatorEventClass;
    route_path?: string;
    route_name?: string;
    entity?: OperatorTraceEntityRef;
    entity_kind?: string;
    entity_id?: string | number | null;
    workflow_id?: string | number | null;
    workflow_state_before?: string;
    workflow_state_after?: string;
    state_version?: string | number | null;
    session_id?: string;
    actor_kind?: string;
    operator_id?: string;
    principal_id?: string | number | null;
    acting_as?: string | number | null;
    action?: string;
    outcome?: OperatorEventOutcome;
    state_before?: string;
    state_after?: string;
    user_state?: OperatorUserStateSnapshot;
    reason?: string;
    duration_ms?: number;
    count?: number;
    error_code?: string;
    error_message?: string;
    summary?: string;
    attention_window_id?: string;
    attention_window_generation?: number | string | null;
    operator_trace_id?: string;
    operator_trace_session_id?: string;
    capture_event_ref?: string;
    task_id?: string | number;
    redaction_status?: OperatorEventRedactionStatus;
    retention_class?: string;
    [key: string]: unknown;
}
export interface OperatorProjectEventSurface {
    project_key: OperatorProjectKey;
    display_name: string;
    production_hosts: readonly string[];
    repo_names: readonly string[];
}
export interface OperatorTraceEventClassification {
    event_domain: OperatorEventDomain;
    event_class: OperatorEventClass;
    default_outcome?: OperatorEventOutcome;
}
export declare const OPERATOR_CONTROLLED_PROJECTS: readonly [{
    readonly project_key: "sitelayer";
    readonly display_name: "Sitelayer";
    readonly production_hosts: readonly ["sitelayer.com", "www.sitelayer.com"];
    readonly repo_names: readonly ["sitelayer"];
}, {
    readonly project_key: "hockeypedia";
    readonly display_name: "Hockeypedia";
    readonly production_hosts: readonly ["hockeypedia.org", "www.hockeypedia.org"];
    readonly repo_names: readonly ["nhl"];
}, {
    readonly project_key: "sandolab";
    readonly display_name: "Sando Lab";
    readonly production_hosts: readonly ["sandolab.xyz", "www.sandolab.xyz"];
    readonly repo_names: readonly ["sandolab"];
}, {
    readonly project_key: "winwar";
    readonly display_name: "WinWar";
    readonly production_hosts: readonly ["winwar.sandolab.xyz"];
    readonly repo_names: readonly ["winwar"];
}, {
    readonly project_key: "chess";
    readonly display_name: "Chess";
    readonly production_hosts: readonly ["chess.sandolab.xyz"];
    readonly repo_names: readonly ["chess"];
}, {
    readonly project_key: "learn";
    readonly display_name: "Learn";
    readonly production_hosts: readonly ["learn.sandolab.xyz"];
    readonly repo_names: readonly ["learn"];
}, {
    readonly project_key: "browser-bridge";
    readonly display_name: "Browser Bridge";
    readonly production_hosts: readonly [];
    readonly repo_names: readonly ["control-plane/browser-bridge", "browser-bridge-sidecar"];
}, {
    readonly project_key: "voice-tools";
    readonly display_name: "Voice Tools";
    readonly production_hosts: readonly [];
    readonly repo_names: readonly ["voice-tools"];
}, {
    readonly project_key: "screen-capture";
    readonly display_name: "Screen Capture";
    readonly production_hosts: readonly [];
    readonly repo_names: readonly ["screen-capture"];
}];
export declare const OPERATOR_TRACE_BUILTIN_EVENT_TYPES: readonly ["probe.snapshot", "route.changed", "console.error", "console.warn", "api.request", "api.request_error"];
export type OperatorTraceBuiltinEventType = (typeof OPERATOR_TRACE_BUILTIN_EVENT_TYPES)[number];
export declare const OPERATOR_TRACE_BUILTIN_EVENT_CLASS: {
    readonly 'probe.snapshot': {
        readonly event_domain: "browser";
        readonly event_class: "state_snapshot";
    };
    readonly 'route.changed': {
        readonly event_domain: "browser";
        readonly event_class: "navigation";
    };
    readonly 'console.error': {
        readonly event_domain: "browser";
        readonly event_class: "runtime_error";
        readonly default_outcome: "failed";
    };
    readonly 'console.warn': {
        readonly event_domain: "browser";
        readonly event_class: "runtime_error";
    };
    readonly 'api.request': {
        readonly event_domain: "browser";
        readonly event_class: "network_request";
    };
    readonly 'api.request_error': {
        readonly event_domain: "browser";
        readonly event_class: "network_request";
        readonly default_outcome: "failed";
    };
};
export declare const OPERATOR_APP_EVENT_SUFFIXES: readonly ["probe.state", "workflow.state", "workflow.event", "ui.action", "entity.viewed", "entity.changed", "runtime.error", "debug.snapshot"];
export type OperatorAppEventSuffix = (typeof OPERATOR_APP_EVENT_SUFFIXES)[number];
export type OperatorAppEventType = `${OperatorProjectKey}.${OperatorAppEventSuffix}`;
export declare const OPERATOR_APP_EVENT_SUFFIX_CLASS: {
    readonly 'probe.state': {
        readonly event_domain: "controlled_app";
        readonly event_class: "state_snapshot";
    };
    readonly 'workflow.state': {
        readonly event_domain: "controlled_app";
        readonly event_class: "workflow_state";
    };
    readonly 'workflow.event': {
        readonly event_domain: "controlled_app";
        readonly event_class: "workflow_event";
    };
    readonly 'ui.action': {
        readonly event_domain: "controlled_app";
        readonly event_class: "user_action";
    };
    readonly 'entity.viewed': {
        readonly event_domain: "controlled_app";
        readonly event_class: "entity_view";
    };
    readonly 'entity.changed': {
        readonly event_domain: "controlled_app";
        readonly event_class: "entity_change";
    };
    readonly 'runtime.error': {
        readonly event_domain: "controlled_app";
        readonly event_class: "runtime_error";
        readonly default_outcome: "failed";
    };
    readonly 'debug.snapshot': {
        readonly event_domain: "controlled_app";
        readonly event_class: "diagnostic";
    };
};
export declare const OPERATOR_TRACE_REQUIRED_EVENT_FIELDS: readonly ["schema_version", "trace_id", "seq", "event_type", "source_kind", "occurred_at", "payload"];
export declare const OPERATOR_TRACE_RECOMMENDED_PAYLOAD_FIELDS: readonly ["event_schema_version", "project_key", "environment", "build_sha", "source_surface", "event_domain", "event_class", "route_path", "entity_kind", "entity_id", "workflow_id", "action", "outcome", "session_id", "actor_kind", "duration_ms", "redaction_status"];
export declare const OPERATOR_TRACE_FORBIDDEN_PAYLOAD_KEYS: readonly ["authorization", "cookie", "password", "access_token", "refresh_token", "id_token", "auth_token", "secret", "api_key", "private_key", "request_body", "response_body", "raw_dom", "raw_audio", "raw_video", "full_transcript"];
export declare const OPERATOR_TRACE_PRESET_POLICY: {
    readonly off: {
        readonly purpose: "No trace session.";
        readonly streams: readonly [];
        readonly default_session_retention_days: 0;
        readonly default_event_retention_days: 0;
    };
    readonly snapshot: {
        readonly purpose: "One current app/browser state snapshot.";
        readonly streams: readonly ["probe_snapshot"];
        readonly default_session_retention_days: 30;
        readonly default_event_retention_days: 7;
    };
    readonly 'prod-safe': {
        readonly purpose: "Low-volume production debugging for the operator only.";
        readonly streams: readonly ["probe_snapshot", "route_changes", "console_errors"];
        readonly default_session_retention_days: 30;
        readonly default_event_retention_days: 7;
    };
    readonly 'debug-light': {
        readonly purpose: "Default controlled-site debugging.";
        readonly streams: readonly ["probe_snapshot", "route_changes", "app_events", "console_errors"];
        readonly default_session_retention_days: 30;
        readonly default_event_retention_days: 7;
    };
    readonly 'debug-deep': {
        readonly purpose: "Detailed debugging with summarized workflow/API/network/DOM streams.";
        readonly streams: readonly ["probe_snapshot", "route_changes", "xstate_transitions", "app_events", "api_requests", "console_errors", "network_summary", "dom_snapshots"];
        readonly default_session_retention_days: 30;
        readonly default_event_retention_days: 3;
    };
    readonly 'local-dev': {
        readonly purpose: "Local development with browser, app, screen, and voice lanes.";
        readonly streams: readonly ["probe_snapshot", "route_changes", "xstate_transitions", "app_events", "api_requests", "console_errors", "network_summary", "screen_segments", "voice_utterances", "dom_snapshots"];
        readonly default_session_retention_days: 30;
        readonly default_event_retention_days: 3;
    };
};
//# sourceMappingURL=operator-event-taxonomy.d.ts.map