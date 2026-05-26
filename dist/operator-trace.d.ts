/**
 * Operator trace contracts — dev/debug-only trace sessions spanning a
 * controlled browser tab, app probe events, optional voice utterances, and
 * optional screen segments.
 *
 * Product analytics stay separate. These records are for the operator's local
 * debugging/observability substrate and are gated by controlled origins,
 * explicit toggles, and short retention.
 */
import type { OperatorTraceStandardPayload } from './operator-event-taxonomy.js';
export type OperatorTracePreset = 'off' | 'snapshot' | 'debug-light' | 'debug-deep' | 'prod-safe' | 'local-dev';
export type OperatorTraceStream = 'probe_snapshot' | 'route_changes' | 'xstate_transitions' | 'app_events' | 'api_requests' | 'console_errors' | 'network_summary' | 'screen_segments' | 'voice_utterances' | 'dom_snapshots';
export type OperatorTraceSourceKind = 'browser-bridge' | 'controlled_app' | 'voice' | 'screen-capture' | 'mesh';
export interface OperatorTraceSession {
    schema_version: 'operator_trace_session.v1';
    trace_id: string;
    site_origin: string;
    url: string;
    host_id: string;
    project_id?: number | null;
    project_hint?: string | null;
    profile_email?: string | null;
    tab_id?: number | null;
    attention_window_id?: string | null;
    attention_window_generation?: number | null;
    started_at: string;
    ended_at?: string | null;
    preset: OperatorTracePreset;
    enabled_streams: OperatorTraceStream[];
    sensitivity?: 'internal' | 'private';
    debug_only: true;
}
export interface OperatorTraceEvent {
    schema_version: 'operator_trace_event.v1';
    trace_id: string;
    seq: number;
    event_type: string;
    source_kind: OperatorTraceSourceKind;
    source_ref?: string | null;
    span_id?: string | null;
    parent_span_id?: string | null;
    occurred_at: string;
    severity?: 'debug' | 'info' | 'warn' | 'error';
    payload: OperatorTraceStandardPayload;
    redaction?: {
        status?: 'raw' | 'redacted' | 'summary_only' | 'pointer_only';
        reason?: string;
    };
}
export interface OperatorTraceCapabilities {
    schema_version: 'operator_trace_capabilities.v1';
    app: string;
    version: string;
    streams: OperatorTraceStream[];
    presets?: Partial<Record<OperatorTracePreset, OperatorTraceStream[]>>;
}
export interface OperatorTraceGlobal {
    capabilities?: () => OperatorTraceCapabilities;
    start?: (session: OperatorTraceSession) => unknown;
    stop?: (traceId: string) => unknown;
    emit?: (event: Omit<OperatorTraceEvent, 'schema_version'>) => unknown;
}
//# sourceMappingURL=operator-trace.d.ts.map