/**
 * @operator/types — shared TypeScript types for the operator-owned
 * browser-bridge capture surface. Consumed by chess, nhl, winwar,
 * sitelayer, learn, qedviz, sandolab, console-ui.
 *
 * Re-exports everything from the per-domain modules. Consumers can
 * either `import { ControlPlaneCapture } from '@operator/types'` for
 * the convenience surface, or import directly from the submodule
 * (e.g. `@operator/types/dist/event-types.js`) when they want to
 * narrow the bundle. Pure types — no runtime side effects.
 */
export type {
  ControlPlaneCapture,
  ControlPlaneProbeGlobal,
  ControlPlaneProbeMethod,
} from './control-plane-capture.js';

export type {
  OperatorContextActivity,
  OperatorContextOriginContext,
  OperatorContextActiveProject,
  OperatorContextPacket,
  OperatorContextError,
} from './operator-context.js';

export {
  OPERATOR_CONTEXT_READY_EVENT,
  OPERATOR_CONTEXT_REFRESH_EVENT,
} from './operator-context.js';

export type {
  CaptureEnvelope,
  CaptureEnvelopePickedElement,
  CaptureEnvelopeNetworkCapture,
  CaptureEnvelopeSensitivity,
  CaptureEnvelopeProperties,
} from './capture-envelope.js';

export type {
  OperatorTracePreset,
  OperatorTraceStream,
  OperatorTraceSourceKind,
  OperatorTraceSession,
  OperatorTraceEvent,
  OperatorTraceCapabilities,
  OperatorTraceGlobal,
} from './operator-trace.js';

export type {
  OperatorProjectKey,
  OperatorEventDomain,
  OperatorEventClass,
  OperatorEventOutcome,
  OperatorEventRedactionStatus,
  OperatorUserStateCanonicality,
  OperatorUserStateSnapshot,
  OperatorTraceEntityRef,
  OperatorTraceStandardPayload,
  OperatorProjectEventSurface,
  OperatorTraceEventClassification,
  OperatorTraceBuiltinEventType,
  OperatorAppEventSuffix,
  OperatorAppEventType,
} from './operator-event-taxonomy.js';

export {
  OPERATOR_CONTROLLED_PROJECTS,
  OPERATOR_TRACE_BUILTIN_EVENT_TYPES,
  OPERATOR_TRACE_BUILTIN_EVENT_CLASS,
  OPERATOR_APP_EVENT_SUFFIXES,
  OPERATOR_APP_EVENT_SUFFIX_CLASS,
  OPERATOR_TRACE_REQUIRED_EVENT_FIELDS,
  OPERATOR_TRACE_RECOMMENDED_PAYLOAD_FIELDS,
  OPERATOR_TRACE_FORBIDDEN_PAYLOAD_KEYS,
  OPERATOR_TRACE_PRESET_POLICY,
} from './operator-event-taxonomy.js';

export {
  OPERATOR_EVENT_PAGE_CAPTURED,
  OPERATOR_EVENT_TASK_CREATED_FROM_CAPTURE,
  OPERATOR_EVENT_TASK_COMPLETED_FROM_CAPTURE,
  OPERATOR_EVENT_BUDGET_DAILY_CAPTURE_SUMMARY,
  OPERATOR_EVENT_UTTERANCE,
  OPERATOR_EVENT_PAGE_CONTEXT,
  OPERATOR_EVENT_COMMAND_DETECTED,
  OPERATOR_EVENT_ATTENTION_WINDOW_OPENED,
  OPERATOR_EVENT_ATTENTION_WINDOW_CLOSED,
  OPERATOR_EVENT_SCREEN_SEGMENT,
  OPERATOR_EVENT_SCREEN_SEGMENT_CAPTION,
  KNOWN_OPERATOR_EVENT_TYPES,
} from './event-types.js';

export type { KnownOperatorEventType } from './event-types.js';

export type {
  ProbePublishRegistrySnapshot,
  ReadProbePublishRegistryFn,
  UseControlPlaneProbePublishFn,
  GetProbePublishMetadataFn,
  ProbePublishRegistry,
} from './probe-publish.js';

// Cross-component envelope contracts (v1.1.0) — single source of truth
// for the mesh / sidecar / gateway / console-ui boundary types. See
// each module for the drift trap it prevents. The control-plane CI
// script scripts/check-shared-types-consistency.sh keeps the Go mirror
// at mesh/core/shared_envelope_types.go aligned with these definitions.

export type {
  ObservationEvent,
  ObservationIngestRequest,
  ObservationSubject,
} from './envelope-observation.js';

export type { BrowserBridgeResearchEvent } from './envelope-browser-bridge.js';

export type {
  HMACRequestHeaders,
  HMACCanonicalInput,
  HMACVerifiedComponent,
} from './envelope-hmac.js';

// Typed-ontology concept registry (v1.2.0) — the L0–L2 (general) type layer
// of the typed-ontology backbone. L3 instances live in mesh, not here.
// Go mirror: mesh/core/shared_ontology_types.go, kept aligned by the
// control-plane CI script scripts/check-shared-types-consistency.sh.
export type {
  ConceptLevel,
  ConceptAlias,
  ConceptRealizedBy,
  ConceptNode,
  ConceptEdge,
  ConceptNodeRegistry,
} from './ontology-concept-types.js';

export {
  BUILTIN_ONTOLOGY_REGISTRY,
  getConceptNode,
  conceptsByLevel,
} from './ontology-concept-types.js';
