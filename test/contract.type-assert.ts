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

// ---------------------------------------------------------------------------
// Browser-bridge WS protocol (browser-bridge-ws.ts) — compile-time guards that
// the SHARED contract stays faithful to control-plane/browser-bridge/src/
// protocol.ts. If a message/command shape drifts (renamed field, action not in
// the union, non-exhaustive union), this file fails to compile.
import type {
  Action,
  Command,
  ExtensionMessage,
  HelloMessage,
  ResultMessage,
  ResearchCompleteMessage,
  ResearchDispatchCommand,
} from '../src/browser-bridge-ws.js';

// Every Command's `action` literal is a member of the Action union. Assigning
// `Command['action']` to `Action` only type-checks if the per-command action
// literals are a subset of the union — i.e. no command names an action the
// union forgot. (BB-2 union-honesty: the union must cover every command.)
const _cmdAction: Action = ('tabs.list' as Command['action']);
void _cmdAction;

// A representative command type-checks structurally against protocol.ts shape.
const _dispatch: ResearchDispatchCommand = {
  command_id: 'cmd-1',
  action: 'research.dispatch',
  params: { platform: 'gemini', query: 'hello', submit: true },
};
void _dispatch;

// Discriminated-union narrowing on the inbound `type` tag works end-to-end.
function _narrow(msg: ExtensionMessage): string {
  switch (msg.type) {
    case 'hello': {
      const h: HelloMessage = msg;
      return h.client_id;
    }
    case 'result': {
      const r: ResultMessage = msg;
      return r.command_id;
    }
    case 'research_complete': {
      const rc: ResearchCompleteMessage = msg;
      return rc.snapshot.body_tail;
    }
    default:
      return msg.type;
  }
}
void _narrow;

// An action verb not in the source-of-truth union must be rejected.
// @ts-expect-error 'tabs.teleport' is not a valid Action
const _badAction: Action = 'tabs.teleport';
void _badAction;
