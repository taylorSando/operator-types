import type { ControlPlaneCapture } from './control-plane-capture.js';
import type { OperatorProjectKey, OperatorUserStateSnapshot } from './operator-event-taxonomy.js';
import type { OperatorContextPacket } from './operator-context.js';

/**
 * `CaptureEnvelope` — the persisted shape that the capture-modal stores
 * under `properties_json.capture_envelope` on every operator capture
 * task. Schema authority:
 *   ~/projects/digital-ontology/tab-to-task-current-state-2026-05-22.md §12.5
 */
export interface CaptureEnvelopePickedElement {
  selector: string;
  /** Serialized HTML of the picked element. */
  outerHTML: string;
}

export interface CaptureEnvelopeNetworkCapture {
  method: string;
  url: string;
  status: number;
  content_type: string;
}

export type CaptureEnvelopeSensitivity = 'internal' | 'private';

export interface CaptureEnvelope {
  /** Schema version of the envelope. Bumped only with breaking changes. */
  schema_version: string;
  /** Fully qualified URL the tab was on at capture time. */
  url: string;
  /** Document title at capture time. */
  page_title: string;
  /** ISO-8601 timestamp the capture was finalized. */
  captured_at: string;
  /** Browser-bridge host identifier. */
  host_id: string;
  /** Controlled project resolved from the current URL, when known. */
  project_id?: number | null;
  /** Stable shared project key, when known. */
  project_key?: OperatorProjectKey | string | null;
  /**
   * Resolved project slug the capture should attribute + dispatch to (e.g.
   * "chess", "nhl"). Stamped by the recording analyzer (vt-session-to-tasks)
   * from the focused window, and by the browser path from the probe. The
   * `capture_action_executor` steerer brief inherits this onto the artifact
   * it spawns so the task reaches the right repo/host. Distinct from
   * `project_id`/`project_key`: this is the dispatch routing key.
   */
  project_hint?: string | null;
  /** Producer surface that created the envelope. */
  source_surface?: string | null;
  /** Observation event_ref for the capture/source event that created this envelope. */
  source_observation_ref?: string | null;
  /** Stable capture observation ref, when different from source_observation_ref. */
  capture_event_ref?: string | null;
  /** Either a `data:image/...;base64,...` literal or a `path://...` reference. */
  screenshot_ref: string;
  /** DOM excerpt (truncated). */
  dom_excerpt: string;
  /** User-selected text at capture time. */
  selected_text: string;
  /** Picked element if the operator targeted one; otherwise null. */
  picked_element: CaptureEnvelopePickedElement | null;
  /** The probe's `ControlPlaneCapture` output, if the probe was mounted. */
  probe_data: ControlPlaneCapture | null;
  /** Inbound operator-context packet from the gateway handshake. */
  operator_context_inbound: OperatorContextPacket | null;
  /** Network requests observed during capture window. */
  network_captures: CaptureEnvelopeNetworkCapture[];
  /** Library hints the page advertised (e.g. `["d3", "recharts"]`). */
  library_hints: string[];
  /** Free-form operator-supplied intent string. */
  operator_intent: string;
  /** Sensitivity tag set by the operator at capture time. */
  sensitivity: CaptureEnvelopeSensitivity;
  /** Active attention window stamped by the operator host, when one exists. */
  attention_window_id?: string | null;
  /** Generation paired with attention_window_id to disambiguate close/open races. */
  attention_window_generation?: number | null;
  /** Active operator trace session stamped by the browser bridge, when one exists. */
  operator_trace_id?: string | null;
  /** Active operator trace session identifier, for producers that keep both names. */
  operator_trace_session_id?: string | null;
  /** Canonical current-user/workflow state snapshot, if the producer knows it. */
  user_state?: OperatorUserStateSnapshot | null;
  /** End-user/app principal in the controlled app, distinct from the operator. */
  principal_id?: string | number | null;
  /** Delegated/impersonated actor if the operator is acting as another user/entity. */
  acting_as?: string | number | null;
  /** Deployed app build SHA/version observed at capture time. */
  build_sha?: string | null;
  /** Feature flags or experiment keys active on the captured surface. */
  feature_flags?: string[];
}

/**
 * The wrapping `properties_json` shape — the envelope keyed under a
 * stable `capture_envelope` field so downstream consumers can address
 * it predictably.
 */
export interface CaptureEnvelopeProperties {
  capture_envelope: CaptureEnvelope;
}
