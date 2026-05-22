/**
 * Stable CustomEvent name dispatched by the content script after a
 * successful refresh. Consumers can subscribe directly.
 */
export const OPERATOR_CONTEXT_READY_EVENT = 'operator-context-ready';
/**
 * Tag this surface uses when broadcasting an explicit refresh request.
 * Pages can dispatch a `${EVENT}-refresh` event to force the content
 * script to re-fetch from the gateway.
 */
export const OPERATOR_CONTEXT_REFRESH_EVENT = `${OPERATOR_CONTEXT_READY_EVENT}-refresh`;
//# sourceMappingURL=operator-context.js.map