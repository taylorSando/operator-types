/**
 * HMAC request-signing contract shared by every mesh API caller.
 *
 * Cross-implementation contract (§5.1 of repo-split-architecture):
 *
 *   canonical = `${timestamp}.${METHOD}.${PATH}.${sha256-hex(body)}`
 *   signature = "sha256=" + hex(HMAC-SHA256(secret_bytes, canonical))
 *
 * Both the Node side (`browser-bridge-sidecar/lib/mesh-hmac.js`) and
 * the Go side (`mesh/core/hmac_auth_middleware.go`) pin this canonical
 * string format. Tests on both sides lock in a known-good fixture so
 * the wire bytes stay bit-identical across implementations.
 *
 * ## Transport
 *
 * The three values travel as HTTP request headers, not body fields:
 *
 *   X-Mesh-Component  : <name>            caller identity
 *   X-Mesh-Signature  : sha256=<hex>      signature
 *   X-Mesh-Timestamp  : <unix-seconds>    replay anchor (5min skew tolerated)
 *
 * Mesh's verifier strips them off the request after auth, stamps the
 * verified component identity onto the request context, and the
 * downstream handler reads it via `HMACAuthedComponent(r.Context())`.
 * The observation_events `source_kind` column is filled from this
 * stamped value — never from any field the caller put in the body.
 *
 * ## Why we don't put HMAC fields IN the body
 *
 * Earlier drafts (see brief at task creation) sketched a
 * body-resident `{ body, hmac_component, hmac_timestamp, hmac_signature }`
 * shape. That sketch is NOT the implemented contract — it would force
 * the verifier to parse the body before authenticating it, defeating
 * the point of HMAC. This type documents the actual header-based
 * contract.
 */
export {};
//# sourceMappingURL=envelope-hmac.js.map