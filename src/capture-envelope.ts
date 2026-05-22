import type { ControlPlaneCapture } from './control-plane-capture.js';
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
}

/**
 * The wrapping `properties_json` shape — the envelope keyed under a
 * stable `capture_envelope` field so downstream consumers can address
 * it predictably.
 */
export interface CaptureEnvelopeProperties {
  capture_envelope: CaptureEnvelope;
}
