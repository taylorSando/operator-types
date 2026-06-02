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

// Browser-bridge bidirectional WS protocol (v1.9.0) — the SHARED type
// contract for the extension⇄gateway/sidecar WebSocket messages. Mirrors
// control-plane/browser-bridge/src/protocol.ts so the sidecar (which
// hand-parses the same wire shapes) can pin types instead of re-deriving
// them. ADDITIVE: new exports only; consumers adopt in a later version bump.
export type {
  Action,
  HelloMessage,
  HeartbeatMessage,
  ResultMessage,
  CancelAckMessage,
  ResearchCompleteMessage,
  ResearchProgressMessage,
  ExtensionMessage,
  CancelMessage,
  TabsListCommand,
  TabsCreateCommand,
  TabsCloseCommand,
  WindowBoundsCommand,
  ScreenshotCommand,
  ScreenshotEmulatedCommand,
  QuerySelectorCommand,
  EvaluateCommand,
  ResearchDispatchCommand,
  ResearchSnapshotCommand,
  SocialPlatform,
  SocialActionType,
  SocialDispatchCommand,
  SocialResultMessage,
  ClickCommand,
  TypeCommand,
  ScrollCommand,
  FindInteractiveCommand,
  PageContentCommand,
  PageInfoCommand,
  NetworkCaptureCommand,
  NetworkSnapshotCommand,
  ConsoleCaptureCommand,
  PerformanceMetricsCommand,
  FullPageScreenshotCommand,
  CookiesGetAllCommand,
  PickerActivateCommand,
  OperatorTraceStartCommand,
  OperatorTraceStopCommand,
  OperatorTraceStatusCommand,
  Command,
  TabInfo,
  ScreenshotResult,
  WindowBoundsResult,
  QuerySelectorResult,
  EvaluateResult,
} from './browser-bridge-ws.js';

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

// WS0 work-OUT envelopes — the outbound dispatch contract a customer/sibling
// posts to the mesh authority + the typed result-callback claim mesh stores
// and executes itself. Outbound counterparts to the inbound CaptureEnvelope.
// Schema authority: schemas/{dispatch-request,callback-claim}.schema.json
// (additionalProperties:false; a contract test keeps schema↔TS in sync).
export type {
  DispatchCapability,
  DispatchPriority,
  DispatchSubject,
  DispatchPayload,
  DispatchRequestV1,
} from './dispatch-request.js';

export type {
  CallbackAuthScheme,
  CallbackMethod,
  CallbackClaimV1,
} from './callback-claim.js';

// WS0-B project_binding.v1 — the typed data shape a project/sibling presents
// so the authority loads its integration as DATA instead of a compiled
// ProjectRegistryEntry literal. goal_anchor is optional so goal-less projects
// (qedviz, external siblings) still validate.
export type {
  ProjectBindingSchemaVersion,
  ProjectBindingV1,
  ProjectBindingDocumentV1,
} from './project-binding.js';

// WS0 read-surface DTOs — the stable wire shapes mesh emits to console-ui,
// DISTINCT from mesh's internal DB-row structs. The toDTO() boundary projects
// the rows onto these contract-owned field names so a column rename never
// ripples into a consumer. Schema authority: schemas/read-surface-*.schema.json.
export type { GoalDTO, GoalDTODetail } from './read-surface-goal.js';

export type {
  TaskRoutingDTO,
  TaskExecutionDTO,
  TaskResultDTO,
  TaskDTO,
} from './read-surface-task.js';

export type { DbHealthPool, DbHealthSummary } from './read-surface-db-health.js';

export type { RunnerStateEntry, RunnerSnapshot } from './read-surface-runner.js';
