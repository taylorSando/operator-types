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
export {};
//# sourceMappingURL=browser-bridge-ws.js.map