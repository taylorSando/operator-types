/**
 * `CallbackClaimV1` — the typed contract for "where + how mesh delivers the
 * RESULT of a dispatched unit of work back to the requesting customer." Paired
 * with `DispatchRequestV1`: the request says what work to do; the callback
 * claim says how to return it.
 *
 * ## Why this exists (the prose it replaces)
 *
 * Today the result delivery is described in English inside an LLM prompt — e.g.
 * "POST your answer to {webhookUrl} with header Authorization: Bearer
 * $SITELAYER_CHAT_WEBHOOK_TOKEN" — and executed by the model runner on trust.
 * A load-bearing instruction in prompt prose can't be held stable while either
 * side refactors, leaks a literal env-var name into the transcript, and means
 * the LLM, not mesh, performs the HTTP call. This contract moves the callback
 * OUT of prose: mesh STORES the claim and EXECUTES the callback itself,
 * deterministically, with a mesh-minted scoped token.
 *
 * It also UNIFIES the two divergent auth shapes that exist today (a literal
 * bearer env-var name on one path, a `scoped_bearer` on another) into one
 * `auth_scheme` enum with `scoped_bearer` as the default.
 *
 * ## The token is a REFERENCE, not a secret
 *
 * `token_ref` is a mesh-minted handle (e.g. a key id in mesh's secret store),
 * NOT a literal env-var name and NOT the secret value. Mesh resolves the ref to
 * the actual credential at call time. No secret material crosses this contract.
 *
 * ## Authority
 *
 *   Schema: ~/projects/operator-types/schemas/callback-claim.schema.json
 *   (draft-07, additionalProperties:false). The schema is the source of truth;
 *   this interface mirrors it field-for-field (a contract test enforces sync).
 *
 * ## Wire format
 *
 *   Stored alongside a DispatchRequestV1 (or registered per project_key) and
 *   executed by mesh:
 *     <method> <callback_url>  (auth per auth_scheme + token_ref)  → expected_status[]
 */

/**
 * How mesh authenticates the outbound callback. Unifies the previously
 * divergent shapes (a literal bearer env-var vs a scoped bearer) onto one enum.
 *
 * - `scoped_bearer` — DEFAULT. Mesh mints a short-lived, scope-limited bearer
 *   token (resolved from `token_ref`) and sends it as `Authorization: Bearer …`.
 * - `hmac`          — Mesh signs the request with an HMAC scheme keyed by
 *   `token_ref` (e.g. the same HMAC ingress siblings already use for inbound).
 * - `none`          — No auth (e.g. a callback into a private tailnet service
 *   already network-fenced). Explicit so "no auth" is a deliberate choice.
 */
export type CallbackAuthScheme = 'scoped_bearer' | 'hmac' | 'none';

/**
 * HTTP method mesh uses for the callback. OPEN string with 'POST' as the
 * default; a sibling that needs PUT/PATCH can declare it without a contract break.
 */
export type CallbackMethod = 'POST' | 'PUT' | 'PATCH' | (string & {});

export interface CallbackClaimV1 {
  /** Claim schema version. Const '1' for this contract; bumped only on a breaking change. */
  schema_version: '1';
  /**
   * Absolute URL mesh delivers the work result to (e.g. a customer's
   * result/ingest webhook). Required — there is nothing to execute without it.
   */
  callback_url: string;
  /**
   * How mesh authenticates the callback. Unifies the two legacy auth shapes;
   * defaults to 'scoped_bearer'. Required so auth is never implicit.
   */
  auth_scheme: CallbackAuthScheme;
  /**
   * Mesh-minted REFERENCE to the credential (a key id / secret-store handle),
   * NOT a literal env-var name and NOT the secret value. Mesh resolves it at
   * call time. Omitted/null when auth_scheme is 'none'.
   */
  token_ref?: string | null;
  /** HTTP method for the callback. Defaults to 'POST'. */
  method?: CallbackMethod;
  /**
   * HTTP status codes mesh treats as a successful delivery (e.g. [200, 202]).
   * Anything outside this set is a failed attempt subject to retry up to
   * `max_attempts`. Defaults to [200, 201, 202, 204] when omitted.
   */
  expected_status?: number[];
  /**
   * Optional reference (a $id / registry key) to the JSON schema describing the
   * response body mesh expects back, so a delivery can be validated, not just
   * status-checked. A reference — the schema itself lives in the consumer's or
   * mesh's schema registry, not inline here.
   */
  response_body_schema_ref?: string | null;
  /**
   * Maximum delivery attempts (initial try + retries) before mesh marks the
   * callback failed. Defaults to a mesh-side policy when omitted.
   */
  max_attempts?: number | null;
}
