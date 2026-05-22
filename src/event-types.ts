/**
 * Catalog of `event_type` string constants the operator surfaces emit
 * into the observation stream. Centralized here so the browser-bridge
 * capture-modal, the mesh observation handlers, the sidecar routers,
 * and the agent skills all key off the same vocabulary.
 *
 * The values are stable wire strings — once an event-type has shipped
 * to mesh storage, do NOT change the literal. Add a new constant
 * instead.
 *
 * ## Capture-side events (slice 1-2 of tab-to-task)
 *
 * - `operator.page.captured` — operator hit the capture-modal Save button
 * - `operator.task.created_from_capture` — sidecar created a downstream task
 * - `operator.task.completed_from_capture` — emitted by task-complete path
 * - `operator.budget.daily_capture_summary` — periodic roll-up
 *
 * ## Voice-side events (forward-compat for voice-attention thread)
 *
 * - `utterance` — operator spoke; the utterance was transcribed
 * - `page_context` — voice surface captured the operator's current page
 *
 * ## Reserved slot — `attention_window.*` (voice-attention thread)
 *
 * The voice-attention thread will add `attention_window.opened` and
 * `attention_window.closed` event types. They MUST be added to this
 * file (not redefined per-repo) and they MUST follow the same naming
 * convention as the existing capture-side events. See the TODO marker
 * below — extend in-place; do not branch this file.
 */

// Capture-side ----------------------------------------------------------

export const OPERATOR_EVENT_PAGE_CAPTURED = 'operator.page.captured' as const;
export const OPERATOR_EVENT_TASK_CREATED_FROM_CAPTURE = 'operator.task.created_from_capture' as const;
export const OPERATOR_EVENT_TASK_COMPLETED_FROM_CAPTURE = 'operator.task.completed_from_capture' as const;
export const OPERATOR_EVENT_BUDGET_DAILY_CAPTURE_SUMMARY = 'operator.budget.daily_capture_summary' as const;

// Voice-side (forward-compat) -------------------------------------------

export const OPERATOR_EVENT_UTTERANCE = 'utterance' as const;
export const OPERATOR_EVENT_PAGE_CONTEXT = 'page_context' as const;

// TODO(voice-attention): add `attention_window.opened` and
// `attention_window.closed` constants here when the voice-attention
// thread lands. Follow the `OPERATOR_EVENT_*` SCREAMING_SNAKE export
// pattern + `as const` literal so the union below picks them up
// automatically. Do not create a parallel constants file.
// Tracking: digital-ontology/tab-to-task-implementation-plan-2026-05-22.md
// §17 (voice-attention coordination note).
// e.g.
// export const OPERATOR_EVENT_ATTENTION_WINDOW_OPENED = 'attention_window.opened' as const;
// export const OPERATOR_EVENT_ATTENTION_WINDOW_CLOSED = 'attention_window.closed' as const;

// ----------------------------------------------------------------------

/**
 * The list of known event-type literals. Exported so consumers can
 * narrow on it (e.g. `eventType: KnownOperatorEventType` in handler
 * signatures). Voice-attention extensions should add to this list when
 * adding new constants above.
 */
export const KNOWN_OPERATOR_EVENT_TYPES = [
  OPERATOR_EVENT_PAGE_CAPTURED,
  OPERATOR_EVENT_TASK_CREATED_FROM_CAPTURE,
  OPERATOR_EVENT_TASK_COMPLETED_FROM_CAPTURE,
  OPERATOR_EVENT_BUDGET_DAILY_CAPTURE_SUMMARY,
  OPERATOR_EVENT_UTTERANCE,
  OPERATOR_EVENT_PAGE_CONTEXT,
] as const;

/**
 * Union of known event-type literals. Useful for switch-exhaustiveness
 * and for tightening handler signatures.
 *
 * Note: this is a closed union of values _known at this package
 * version_. Mesh storage may contain older or newer values; consumers
 * that need to be permissive should accept `string` and narrow on this
 * union only where they have a switch they want exhaustively typed.
 */
export type KnownOperatorEventType = (typeof KNOWN_OPERATOR_EVENT_TYPES)[number];
