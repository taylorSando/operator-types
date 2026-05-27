// Compile-time contract assertions — type-checked by `tsc --noEmit -p
// tsconfig.test.json`, never executed. If a capture-envelope field this loop
// depends on is renamed/removed, this file fails to compile (the guard).
import type { CaptureEnvelope } from '../src/capture-envelope.js';

// A minimal valid envelope MUST accept v1.5.0's project_hint plus every field
// the capture→task pipeline serializes. Missing/renamed required field => compile error.
const _envelope: CaptureEnvelope = {
  schema_version: '1.0',
  url: 'https://chess.sandolab.xyz/play',
  page_title: 'Chess',
  captured_at: '2026-05-27T00:00:00Z',
  host_id: 'taylor-pc-ubuntu',
  project_hint: 'chess', // <- the field v1.5.0 added; the whole reason for the release
  source_surface: 'browser',
  screenshot_ref: 'path://x',
  dom_excerpt: '',
  selected_text: '',
  picked_element: null,
  probe_data: null,
  operator_context_inbound: null,
  network_captures: [],
  library_hints: [],
  operator_intent: 'file_issue',
  sensitivity: 'internal',
  attention_window_id: null,
};
void _envelope;

// project_hint is optional string | null — all three assignments must type-check.
const _ph1: CaptureEnvelope['project_hint'] = 'chess';
const _ph2: CaptureEnvelope['project_hint'] = null;
const _ph3: CaptureEnvelope['project_hint'] = undefined;
void _ph1;
void _ph2;
void _ph3;

// sensitivity is a closed union; a bogus value must be rejected.
// @ts-expect-error 'public' is not a CaptureEnvelopeSensitivity
const _badSensitivity: CaptureEnvelope['sensitivity'] = 'public';
void _badSensitivity;
