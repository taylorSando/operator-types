/**
 * Event taxonomy for dev/debug operator traces.
 *
 * This module names the cross-project vocabulary used inside
 * `OperatorTraceEvent.payload`. It intentionally does not replace each
 * project's domain-specific `event_type` strings. Existing events such as
 * `winwar.turn.accepted` and `sandolab.aquarium.tick` can keep their names
 * while carrying the common fields below.
 */
// NOTE (v2.0.0): the `OPERATOR_CONTROLLED_PROJECTS` roster was removed here.
// It hardcoded the per-customer project_key → repo/host mapping inside this
// shared contract package. The authority resolves projects data-driven from
// `projects.url_patterns` (mig 295), so the roster was dead weight with zero
// external consumers. `OperatorProjectEventSurface` is retained for any
// consumer that wants to describe a project surface ad hoc.
export const OPERATOR_TRACE_BUILTIN_EVENT_TYPES = [
    'probe.snapshot',
    'route.changed',
    'console.error',
    'console.warn',
    'api.request',
    'api.request_error',
];
export const OPERATOR_TRACE_BUILTIN_EVENT_CLASS = {
    'probe.snapshot': { event_domain: 'browser', event_class: 'state_snapshot' },
    'route.changed': { event_domain: 'browser', event_class: 'navigation' },
    'console.error': { event_domain: 'browser', event_class: 'runtime_error', default_outcome: 'failed' },
    'console.warn': { event_domain: 'browser', event_class: 'runtime_error' },
    'api.request': { event_domain: 'browser', event_class: 'network_request' },
    'api.request_error': { event_domain: 'browser', event_class: 'network_request', default_outcome: 'failed' },
};
export const OPERATOR_APP_EVENT_SUFFIXES = [
    'probe.state',
    'workflow.state',
    'workflow.event',
    'ui.action',
    'entity.viewed',
    'entity.changed',
    'runtime.error',
    'debug.snapshot',
];
export const OPERATOR_APP_EVENT_SUFFIX_CLASS = {
    'probe.state': { event_domain: 'controlled_app', event_class: 'state_snapshot' },
    'workflow.state': { event_domain: 'controlled_app', event_class: 'workflow_state' },
    'workflow.event': { event_domain: 'controlled_app', event_class: 'workflow_event' },
    'ui.action': { event_domain: 'controlled_app', event_class: 'user_action' },
    'entity.viewed': { event_domain: 'controlled_app', event_class: 'entity_view' },
    'entity.changed': { event_domain: 'controlled_app', event_class: 'entity_change' },
    'runtime.error': { event_domain: 'controlled_app', event_class: 'runtime_error', default_outcome: 'failed' },
    'debug.snapshot': { event_domain: 'controlled_app', event_class: 'diagnostic' },
};
export const OPERATOR_TRACE_REQUIRED_EVENT_FIELDS = [
    'schema_version',
    'trace_id',
    'seq',
    'event_type',
    'source_kind',
    'occurred_at',
    'payload',
];
export const OPERATOR_TRACE_RECOMMENDED_PAYLOAD_FIELDS = [
    'event_schema_version',
    'project_key',
    'environment',
    'build_sha',
    'source_surface',
    'event_domain',
    'event_class',
    'route_path',
    'entity_kind',
    'entity_id',
    'workflow_id',
    'action',
    'outcome',
    'session_id',
    'actor_kind',
    'duration_ms',
    'redaction_status',
];
export const OPERATOR_TRACE_FORBIDDEN_PAYLOAD_KEYS = [
    'authorization',
    'cookie',
    'password',
    'access_token',
    'refresh_token',
    'id_token',
    'auth_token',
    'secret',
    'api_key',
    'private_key',
    'request_body',
    'response_body',
    'raw_dom',
    'raw_audio',
    'raw_video',
    'full_transcript',
];
export const OPERATOR_TRACE_PRESET_POLICY = {
    off: {
        purpose: 'No trace session.',
        streams: [],
        default_session_retention_days: 0,
        default_event_retention_days: 0,
    },
    snapshot: {
        purpose: 'One current app/browser state snapshot.',
        streams: ['probe_snapshot'],
        default_session_retention_days: 30,
        default_event_retention_days: 7,
    },
    'prod-safe': {
        purpose: 'Low-volume production debugging for the operator only.',
        streams: ['probe_snapshot', 'route_changes', 'console_errors'],
        default_session_retention_days: 30,
        default_event_retention_days: 7,
    },
    'debug-light': {
        purpose: 'Default controlled-site debugging.',
        streams: ['probe_snapshot', 'route_changes', 'app_events', 'console_errors'],
        default_session_retention_days: 30,
        default_event_retention_days: 7,
    },
    'debug-deep': {
        purpose: 'Detailed debugging with summarized workflow/API/network/DOM streams.',
        streams: [
            'probe_snapshot',
            'route_changes',
            'xstate_transitions',
            'app_events',
            'api_requests',
            'console_errors',
            'network_summary',
            'dom_snapshots',
        ],
        default_session_retention_days: 30,
        default_event_retention_days: 3,
    },
    'local-dev': {
        purpose: 'Local development with browser, app, screen, and voice lanes.',
        streams: [
            'probe_snapshot',
            'route_changes',
            'xstate_transitions',
            'app_events',
            'api_requests',
            'console_errors',
            'network_summary',
            'screen_segments',
            'voice_utterances',
            'dom_snapshots',
        ],
        default_session_retention_days: 30,
        default_event_retention_days: 3,
    },
};
//# sourceMappingURL=operator-event-taxonomy.js.map