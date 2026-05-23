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
/**
 * The three headers an outbound mesh API call must set together to
 * authenticate via HMAC. Missing any one of the three is a 401 — mesh
 * rejects partial trios deliberately so a misconfigured caller fails
 * loud instead of slipping through with a bearer-only fallback.
 */
export interface HMACRequestHeaders {
    /** Caller identity, must match a row in `component_auth_secrets`. */
    'X-Mesh-Component': string;
    /** `sha256=<hex>` of HMAC-SHA256(secret_bytes, canonicalString). */
    'X-Mesh-Signature': string;
    /** Unix-seconds; replay-window cutoff is 5 minutes skew either side. */
    'X-Mesh-Timestamp': string;
}
/**
 * Input shape to a canonical-string assembler. Producers that need to
 * generate or verify a signature locally should hash this tuple in the
 * exact order documented above — any deviation (e.g. URL-encoding
 * `path`, including the query string twice) silently breaks
 * interoperability with the verifier.
 */
export interface HMACCanonicalInput {
    /** Unix-seconds as a STRING (preserve sender's exact encoding). */
    timestamp: string;
    /** Uppercased HTTP method (`GET`, `POST`, ...). */
    method: string;
    /** URL pathname only — no query, no fragment, no host. */
    path: string;
    /** Request body bytes as a string; empty body MUST be `""` not `null`. */
    body: string;
}
/**
 * The verified-component lookup result stamped into the mesh request
 * context after HMAC middleware succeeds. Downstream handlers read this
 * via `HMACAuthedComponent(r.Context())` and persist it as
 * `observation_events.source_kind`.
 */
export interface HMACVerifiedComponent {
    /** Component name (e.g. `browser-bridge-sidecar-taylor-pc-ubuntu`). */
    component: string;
    /** Optional key-id when multi-key rotation is in flight. */
    key_id?: string;
}
//# sourceMappingURL=envelope-hmac.d.ts.map