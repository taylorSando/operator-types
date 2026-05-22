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
export declare const OPERATOR_EVENT_PAGE_CAPTURED: "operator.page.captured";
export declare const OPERATOR_EVENT_TASK_CREATED_FROM_CAPTURE: "operator.task.created_from_capture";
export declare const OPERATOR_EVENT_TASK_COMPLETED_FROM_CAPTURE: "operator.task.completed_from_capture";
export declare const OPERATOR_EVENT_BUDGET_DAILY_CAPTURE_SUMMARY: "operator.budget.daily_capture_summary";
export declare const OPERATOR_EVENT_UTTERANCE: "utterance";
export declare const OPERATOR_EVENT_PAGE_CONTEXT: "page_context";
/**
 * The list of known event-type literals. Exported so consumers can
 * narrow on it (e.g. `eventType: KnownOperatorEventType` in handler
 * signatures). Voice-attention extensions should add to this list when
 * adding new constants above.
 */
export declare const KNOWN_OPERATOR_EVENT_TYPES: readonly ["operator.page.captured", "operator.task.created_from_capture", "operator.task.completed_from_capture", "operator.budget.daily_capture_summary", "utterance", "page_context"];
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
//# sourceMappingURL=event-types.d.ts.map