/**
 * Browser-bridge bidirectional WebSocket protocol — the SHARED type
 * contract for the messages that flow between the browser-bridge Chrome
 * extension and the console gateway / sidecar.
 *
 * ## Why this module exists
 *
 * Until now the WS protocol (the `Action` union plus the
 * Command / Result / Hello / ResearchComplete message shapes) lived ONLY
 * in `control-plane/browser-bridge/src/protocol.ts`. The sidecar
 * hand-parses the same wire shapes from raw JSON with no shared types, so
 * any rename or new action drifts silently between the two ends.
 *
 * This module mirrors `browser-bridge/src/protocol.ts` so the gateway,
 * sidecar, and any future consumer can pin the SAME types instead of
 * re-deriving them. It is a faithful copy of the extension-side source of
 * truth; when `protocol.ts` changes, mirror the change here.
 *
 * ## Boundary contract
 *
 *   extension  --hello / result / research_complete / ...-->  gateway
 *   gateway    --command (action + command_id + params)  -->  extension
 *
 * - Extension → Gateway: {@link ExtensionMessage} (the `type`-tagged union
 *   of {@link HelloMessage}, {@link HeartbeatMessage}, {@link ResultMessage},
 *   {@link CancelAckMessage}, {@link ResearchCompleteMessage},
 *   {@link ResearchProgressMessage}).
 * - Gateway → Extension: {@link Command} (the `action`-tagged union of the
 *   per-action command shapes) plus the out-of-band {@link CancelMessage}.
 *
 * ## ADDITIVE-ONLY
 *
 * 8+ consumers pin `@operator/types`; this module only ADDS exports. It does
 * not remove or tighten any existing export. Consumers adopt these types in a
 * later coordinated version bump.
 *
 * Source of truth: `control-plane/browser-bridge/src/protocol.ts`.
 */

// --- Actions ---

/**
 * Every action verb the gateway can send to the extension. The wire value
 * of each command's `action` field is one of these literals.
 */
export type Action =
  | "tabs.list"
  | "tabs.create"
  | "tabs.close"
  | "window.bounds"
  | "screenshot"
  | "dom.querySelector"
  | "evaluate"
  | "page.content"
  | "page.info"
  | "interact.click"
  | "interact.type"
  | "interact.scroll"
  | "interact.findInteractive"
  | "research.dispatch"
  | "research.snapshot"
  | "social.dispatch"
  | "network.capture"
  | "network.snapshot"
  | "console.capture"
  | "performance.metrics"
  | "screenshot.fullpage"
  | "screenshot.emulated"
  | "cookies.getAll"
  | "picker.activate"
  | "operatorTrace.start"
  | "operatorTrace.stop"
  | "operatorTrace.status"
  | "runtime.reload"
  | "runtime.version";

// --- Extension → Gateway messages ---

export interface HelloMessage {
  type: "hello";
  client: "browser-bridge";
  version: string;
  capabilities: Action[];
  client_id: string;
  profile_email?: string;
  profile_label?: string;
  browser_name?: string;
}

export interface HeartbeatMessage {
  type: "heartbeat";
  sent_at: number;
}

export interface ResultMessage {
  type: "result";
  command_id: string;
  status: "ok" | "error";
  data: unknown;
}

export interface CancelAckMessage {
  type: "cancel_ack";
  command_id: string;
  action?: string;
  run_id?: string;
  reason?: string;
  acknowledged_at: number;
}

export interface ResearchCompleteMessage {
  type: "research_complete";
  run_id: string;
  platform: string;
  snapshot: {
    title: string;
    url: string;
    body_tail: string;
    body_length: number;
    response_excerpt: string;
    response_count: number;
    busy: boolean;
    send_button_visible: boolean;
    stop_button_visible: boolean;
    observed_at: string;
    full_text?: string;
    frame_url?: string;
    frame_title?: string;
  };
  timed_out: boolean;
}

/**
 * In-progress delta envelope pushed from the extension content-script
 * watcher every poll cycle (every WATCH_POLL_MS). The gateway uses this
 * as a push-driven replacement for its own 8s `research.snapshot`
 * round-trip polling — see console/gateway/plugins/browser-bridge.js
 * `parsed.type === "research_progress"`.
 *
 * `body_delta` carries the new tail appended since the previous progress
 * envelope so large bodies do not have to be retransmitted on every tick.
 * When the watcher cannot compute a delta (first message, or body
 * shrank/replaced), `body_delta` is empty and `body_tail` carries the
 * full tail snapshot.
 */
export interface ResearchProgressMessage {
  type: "research_progress";
  run_id: string;
  platform: string;
  seq: number;
  snapshot: {
    title: string;
    url: string;
    body_tail: string;
    body_length: number;
    body_delta?: string;
    response_excerpt: string;
    response_count: number;
    busy: boolean;
    send_button_visible: boolean;
    stop_button_visible: boolean;
    observed_at: string;
  };
}

export type ExtensionMessage =
  | HelloMessage
  | HeartbeatMessage
  | ResultMessage
  | CancelAckMessage
  | ResearchCompleteMessage
  | ResearchProgressMessage;

// --- Gateway → Extension commands ---

export interface CancelMessage {
  type: "cancel";
  command_id: string;
  action?: Action | string;
  tab_id?: number | null;
  run_id?: string;
  reason?: string;
}

export interface TabsListCommand {
  command_id: string;
  action: "tabs.list";
}

export interface TabsCreateCommand {
  command_id: string;
  action: "tabs.create";
  params: {
    url: string;
    active?: boolean;
  };
}

export interface TabsCloseCommand {
  command_id: string;
  action: "tabs.close";
  tabId: number;
}

export interface ScreenshotCommand {
  command_id: string;
  action: "screenshot";
  tabId: number;
  params: {
    format?: "jpeg" | "png";
    quality?: number;
  };
}

// window.bounds: the on-screen geometry of a Chrome window (chrome.windows.get),
// independent of which tab is foreground — unlike window.outerWidth/screenX read
// via `evaluate`, which Chrome reports as 0 for a background/non-focused tab. Pass
// either `tabId` (the window is resolved from the tab) or `params.windowId`.
export interface WindowBoundsCommand {
  command_id: string;
  action: "window.bounds";
  tabId?: number;
  params?: {
    windowId?: number;
  };
}

export interface ScreenshotEmulatedCommand {
  command_id: string;
  action: "screenshot.emulated";
  tabId: number;
  params: {
    device: {
      width: number;
      height: number;
      deviceScaleFactor?: number;
      mobile?: boolean;
      userAgent?: string;
      touch?: boolean;
    };
    format?: "jpeg" | "png";
    quality?: number;
  };
}

export interface QuerySelectorCommand {
  command_id: string;
  action: "dom.querySelector";
  tabId: number;
  params: {
    selector: string;
  };
}

export interface EvaluateCommand {
  command_id: string;
  action: "evaluate";
  tabId: number;
  params: {
    expression: string;
    returnByValue?: boolean;
  };
}

export interface ResearchDispatchCommand {
  command_id: string;
  action: "research.dispatch";
  params: {
    platform: string;
    query: string;
    tabId?: number;
    submit?: boolean;
    prepareMode?: boolean;
    focus_mode?: string;
    perplexity_model?: string;
    chatgpt_model?: string;
    claude_model?: string;
    runId?: string;
    workflow_id?: string;
    goal_id?: string;
    topic_slug?: string;
    task_id?: number;
    mesh_run_id?: string;
    project_hint?: string;
  };
}

export interface ResearchSnapshotCommand {
  command_id: string;
  action: "research.snapshot";
  tabId: number;
  params: {
    platform: string;
    // Optional: when "deep-research", ChatGPT snapshot scans all frames
    // (the deep-research connector iframe holds the actual research).
    // When empty/missing, scan only the main frame to avoid the iframe
    // overshadowing the conversation response on light dispatches.
    focus_mode?: string;
  };
}

export type SocialPlatform = "x" | "youtube" | "reddit" | "linkedin";

export type SocialActionType =
  | "social.collectFollowers"
  | "social.collectFollowing"
  | "social.collectEngagers"
  | "social.collectPostContext"
  | "social.profileSnapshot";

export interface SocialDispatchCommand {
  command_id: string;
  action: "social.dispatch";
  run_id: string;
  params: {
    platform: SocialPlatform;
    socialAction: SocialActionType;
    payload: Record<string, unknown>;
  };
}

export interface SocialResultMessage {
  type: "social_result";
  run_id: string;
  platform: string;
  action: string;
  status: "completed" | "failed";
  items_collected: number;
  data: unknown;
  error?: string;
}

export interface ClickCommand {
  command_id: string;
  action: "interact.click";
  tabId: number;
  params: {
    x: number;
    y: number;
    doubleClick?: boolean;
  };
}

export interface TypeCommand {
  command_id: string;
  action: "interact.type";
  tabId: number;
  params: {
    text: string;
    clearFirst?: boolean;
    pressEnter?: boolean;
  };
}

export interface ScrollCommand {
  command_id: string;
  action: "interact.scroll";
  tabId: number;
  params: {
    direction: "up" | "down" | "left" | "right";
    amount?: number;
  };
}

export interface FindInteractiveCommand {
  command_id: string;
  action: "interact.findInteractive";
  tabId: number;
  params: Record<string, never>;
}

export interface PageContentCommand {
  command_id: string;
  action: "page.content";
  tabId: number;
  params: {
    selector?: string;
  };
}

export interface PageInfoCommand {
  command_id: string;
  action: "page.info";
  tabId: number;
  params: Record<string, never>;
}

export interface NetworkCaptureCommand {
  command_id: string;
  action: "network.capture";
  tabId: number;
  params: {
    durationMs?: number;
    urlFilter?: string;
    // Slice 4: opt-in fetch of response bodies via Network.getResponseBody
    // (capped at 100KB per body; JSON/text only). Default false.
    includeResponseBodies?: boolean;
  };
}

export interface NetworkSnapshotCommand {
  command_id: string;
  action: "network.snapshot";
  tabId: number;
  params: {
    urlFilter?: string;
  };
}

export interface ConsoleCaptureCommand {
  command_id: string;
  action: "console.capture";
  tabId: number;
  params: {
    durationMs?: number;
    levelFilter?: string;
  };
}

export interface PerformanceMetricsCommand {
  command_id: string;
  action: "performance.metrics";
  tabId: number;
  params: Record<string, never>;
}

export interface FullPageScreenshotCommand {
  command_id: string;
  action: "screenshot.fullpage";
  tabId: number;
  params: {
    format?: "jpeg" | "png";
    quality?: number;
  };
}

export interface CookiesGetAllCommand {
  command_id: string;
  action: "cookies.getAll";
  params: {
    url: string;
  };
}

export interface PickerActivateCommand {
  command_id: string;
  action: "picker.activate";
  tabId: number;
  params: {
    timeoutMs?: number;
  };
}

export interface OperatorTraceStartCommand {
  command_id: string;
  action: "operatorTrace.start";
  tabId: number;
  params: Record<string, unknown>;
}

export interface OperatorTraceStopCommand {
  command_id: string;
  action: "operatorTrace.stop";
  tabId: number;
  params: {
    trace_id?: string;
    reason?: string;
  };
}

export interface OperatorTraceStatusCommand {
  command_id: string;
  action: "operatorTrace.status";
  tabId: number;
  params?: Record<string, never>;
}

export type Command =
  | TabsListCommand
  | TabsCreateCommand
  | TabsCloseCommand
  | WindowBoundsCommand
  | ScreenshotCommand
  | QuerySelectorCommand
  | EvaluateCommand
  | ClickCommand
  | TypeCommand
  | ScrollCommand
  | FindInteractiveCommand
  | PageContentCommand
  | PageInfoCommand
  | ResearchDispatchCommand
  | ResearchSnapshotCommand
  | SocialDispatchCommand
  | NetworkCaptureCommand
  | NetworkSnapshotCommand
  | ConsoleCaptureCommand
  | PerformanceMetricsCommand
  | FullPageScreenshotCommand
  | ScreenshotEmulatedCommand
  | CookiesGetAllCommand
  | PickerActivateCommand
  | OperatorTraceStartCommand
  | OperatorTraceStopCommand
  | OperatorTraceStatusCommand;

// --- Tab info returned by tabs.list ---

export interface TabInfo {
  id: number;
  url: string;
  title: string;
  active: boolean;
  windowId: number;
}

// --- Screenshot result ---

export interface ScreenshotResult {
  data: string; // base64
  format: string;
}

// --- window.bounds result ---

export interface WindowBoundsResult {
  windowId: number;
  tabId: number | null;
  focused: boolean;
  state: string; // "normal" | "minimized" | "maximized" | "fullscreen" | ""
  type: string; // "normal" | "popup" | "panel" | "app" | "devtools" | ""
  // DIP screen coordinates from chrome.windows.get; null when the platform
  // does not report a value (e.g. a minimized window may omit left/top).
  left: number | null;
  top: number | null;
  width: number | null;
  height: number | null;
}

// --- querySelector result ---

export interface QuerySelectorResult {
  found: boolean;
  outerHTML: string | null;
}

// --- evaluate result ---

export interface EvaluateResult {
  value: unknown;
  type: string;
}
