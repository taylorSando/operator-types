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
export {};
//# sourceMappingURL=callback-claim.js.map