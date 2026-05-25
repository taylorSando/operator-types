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
 * - `command_detected` — voice command detector matched an utterance
 * - `attention_window.opened` / `attention_window.closed` — bounded focus
 *   windows used to join voice, browser, capture, and screen context
 * - `segment` / `segment_caption` — screen segment pointers and captions
 */

// Capture-side ----------------------------------------------------------

export const OPERATOR_EVENT_PAGE_CAPTURED = 'operator.page.captured' as const;
export const OPERATOR_EVENT_TASK_CREATED_FROM_CAPTURE = 'operator.task.created_from_capture' as const;
export const OPERATOR_EVENT_TASK_COMPLETED_FROM_CAPTURE = 'operator.task.completed_from_capture' as const;
export const OPERATOR_EVENT_BUDGET_DAILY_CAPTURE_SUMMARY = 'operator.budget.daily_capture_summary' as const;

// Voice-side (forward-compat) -------------------------------------------

export const OPERATOR_EVENT_UTTERANCE = 'utterance' as const;
export const OPERATOR_EVENT_PAGE_CONTEXT = 'page_context' as const;
export const OPERATOR_EVENT_COMMAND_DETECTED = 'command_detected' as const;
export const OPERATOR_EVENT_ATTENTION_WINDOW_OPENED = 'attention_window.opened' as const;
export const OPERATOR_EVENT_ATTENTION_WINDOW_CLOSED = 'attention_window.closed' as const;
export const OPERATOR_EVENT_SCREEN_SEGMENT = 'segment' as const;
export const OPERATOR_EVENT_SCREEN_SEGMENT_CAPTION = 'segment_caption' as const;

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
  OPERATOR_EVENT_COMMAND_DETECTED,
  OPERATOR_EVENT_ATTENTION_WINDOW_OPENED,
  OPERATOR_EVENT_ATTENTION_WINDOW_CLOSED,
  OPERATOR_EVENT_SCREEN_SEGMENT,
  OPERATOR_EVENT_SCREEN_SEGMENT_CAPTION,
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
