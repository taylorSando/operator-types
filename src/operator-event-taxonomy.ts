/**
 * Event taxonomy for dev/debug operator traces.
 *
 * This module names the cross-project vocabulary used inside
 * `OperatorTraceEvent.payload`. It intentionally does not replace each
 * project's domain-specific `event_type` strings. Existing events such as
 * `winwar.turn.accepted` and `sandolab.aquarium.tick` can keep their names
 * while carrying the common fields below.
 */

export type OperatorProjectKey =
  | 'sitelayer'
  | 'hockeypedia'
  | 'sandolab'
  | 'winwar'
  | 'chess'
  | 'learn'
  | 'browser-bridge'
  | 'voice-tools'
  | 'screen-capture';

export type OperatorEventDomain =
  | 'operator'
  | 'browser'
  | 'controlled_app'
  | 'voice'
  | 'screen'
  | 'attention'
  | 'mesh';

export type OperatorEventClass =
  | 'lifecycle'
  | 'state_snapshot'
  | 'navigation'
  | 'workflow_state'
  | 'workflow_event'
  | 'user_action'
  | 'entity_view'
  | 'entity_change'
  | 'network_request'
  | 'runtime_error'
  | 'media_segment'
  | 'attention_window'
  | 'capture'
  | 'diagnostic';

export type OperatorEventOutcome =
  | 'started'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'accepted'
  | 'rejected'
  | 'skipped'
  | 'unknown';

export type OperatorEventRedactionStatus = 'raw' | 'redacted' | 'summary_only' | 'pointer_only';

export interface OperatorTraceEntityRef {
  kind: string;
  id?: string | number | null;
  name?: string | null;
}

export interface OperatorTraceStandardPayload {
  /**
   * Taxonomy version for payload-level normalization. The enclosing
   * OperatorTraceEvent keeps its own wire schema_version.
   */
  event_schema_version?: 'operator_event_taxonomy.v1';
  project_key?: OperatorProjectKey;
  event_domain?: OperatorEventDomain;
  event_class?: OperatorEventClass;
  route_path?: string;
  route_name?: string;
  entity?: OperatorTraceEntityRef;
  entity_kind?: string;
  entity_id?: string | number | null;
  action?: string;
  outcome?: OperatorEventOutcome;
  state_before?: string;
  state_after?: string;
  reason?: string;
  duration_ms?: number;
  count?: number;
  error_code?: string;
  error_message?: string;
  summary?: string;
  attention_window_id?: string;
  capture_event_ref?: string;
  task_id?: string | number;
  redaction_status?: OperatorEventRedactionStatus;
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

export const OPERATOR_CONTROLLED_PROJECTS = [
  {
    project_key: 'sitelayer',
    display_name: 'Sitelayer',
    production_hosts: ['sitelayer.com', 'www.sitelayer.com'],
    repo_names: ['sitelayer'],
  },
  {
    project_key: 'hockeypedia',
    display_name: 'Hockeypedia',
    production_hosts: ['hockeypedia.org', 'www.hockeypedia.org'],
    repo_names: ['nhl'],
  },
  {
    project_key: 'sandolab',
    display_name: 'Sando Lab',
    production_hosts: ['sandolab.xyz', 'www.sandolab.xyz'],
    repo_names: ['sandolab'],
  },
  {
    project_key: 'winwar',
    display_name: 'WinWar',
    production_hosts: ['winwar.sandolab.xyz'],
    repo_names: ['winwar'],
  },
  {
    project_key: 'chess',
    display_name: 'Chess',
    production_hosts: ['chess.sandolab.xyz'],
    repo_names: ['chess'],
  },
  {
    project_key: 'learn',
    display_name: 'Learn',
    production_hosts: ['learn.sandolab.xyz'],
    repo_names: ['learn'],
  },
  {
    project_key: 'browser-bridge',
    display_name: 'Browser Bridge',
    production_hosts: [],
    repo_names: ['control-plane/browser-bridge', 'browser-bridge-sidecar'],
  },
  {
    project_key: 'voice-tools',
    display_name: 'Voice Tools',
    production_hosts: [],
    repo_names: ['voice-tools'],
  },
  {
    project_key: 'screen-capture',
    display_name: 'Screen Capture',
    production_hosts: [],
    repo_names: ['screen-capture'],
  },
] as const satisfies readonly OperatorProjectEventSurface[];

export const OPERATOR_TRACE_BUILTIN_EVENT_TYPES = [
  'probe.snapshot',
  'route.changed',
  'console.error',
  'console.warn',
  'api.request',
  'api.request_error',
] as const;

export type OperatorTraceBuiltinEventType = (typeof OPERATOR_TRACE_BUILTIN_EVENT_TYPES)[number];

export const OPERATOR_TRACE_BUILTIN_EVENT_CLASS = {
  'probe.snapshot': { event_domain: 'browser', event_class: 'state_snapshot' },
  'route.changed': { event_domain: 'browser', event_class: 'navigation' },
  'console.error': { event_domain: 'browser', event_class: 'runtime_error', default_outcome: 'failed' },
  'console.warn': { event_domain: 'browser', event_class: 'runtime_error' },
  'api.request': { event_domain: 'browser', event_class: 'network_request' },
  'api.request_error': { event_domain: 'browser', event_class: 'network_request', default_outcome: 'failed' },
} as const satisfies Record<OperatorTraceBuiltinEventType, OperatorTraceEventClassification>;

export const OPERATOR_APP_EVENT_SUFFIXES = [
  'probe.state',
  'workflow.state',
  'workflow.event',
  'ui.action',
  'entity.viewed',
  'entity.changed',
  'runtime.error',
  'debug.snapshot',
] as const;

export type OperatorAppEventSuffix = (typeof OPERATOR_APP_EVENT_SUFFIXES)[number];
export type OperatorAppEventType = `${OperatorProjectKey}.${OperatorAppEventSuffix}`;

export const OPERATOR_APP_EVENT_SUFFIX_CLASS = {
  'probe.state': { event_domain: 'controlled_app', event_class: 'state_snapshot' },
  'workflow.state': { event_domain: 'controlled_app', event_class: 'workflow_state' },
  'workflow.event': { event_domain: 'controlled_app', event_class: 'workflow_event' },
  'ui.action': { event_domain: 'controlled_app', event_class: 'user_action' },
  'entity.viewed': { event_domain: 'controlled_app', event_class: 'entity_view' },
  'entity.changed': { event_domain: 'controlled_app', event_class: 'entity_change' },
  'runtime.error': { event_domain: 'controlled_app', event_class: 'runtime_error', default_outcome: 'failed' },
  'debug.snapshot': { event_domain: 'controlled_app', event_class: 'diagnostic' },
} as const satisfies Record<OperatorAppEventSuffix, OperatorTraceEventClassification>;

export const OPERATOR_TRACE_REQUIRED_EVENT_FIELDS = [
  'schema_version',
  'trace_id',
  'seq',
  'event_type',
  'source_kind',
  'occurred_at',
  'payload',
] as const;

export const OPERATOR_TRACE_RECOMMENDED_PAYLOAD_FIELDS = [
  'event_schema_version',
  'project_key',
  'event_domain',
  'event_class',
  'route_path',
  'entity_kind',
  'entity_id',
  'action',
  'outcome',
  'duration_ms',
  'redaction_status',
] as const;

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
] as const;

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
} as const;
