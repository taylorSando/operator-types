# @operator/types

Shared TypeScript types for the operator-owned browser-bridge capture
surface. Consumed by chess, nhl, winwar, sitelayer, learn, qedviz,
sandolab, and console-ui.

## What lives here

Pure types — no runtime code beyond a handful of `event_type` string
constants.

### Browser-bridge capture surface

- `ControlPlaneCapture` — the snapshot every operator app publishes onto
  `window.__controlPlaneProbe.capture()`.
- `OperatorContextPacket` — the operator-context handshake packet the
  browser-bridge content script sets on `window.__operatorContext`.
- `CaptureEnvelope` — the persisted shape under
  `properties_json.capture_envelope` for every operator capture task.
- `event_type` constants — the catalog of `operator.*` and `utterance` /
  `page_context` event types that flow through observation_events.
  Reserved slot for `attention_window.opened` / `attention_window.closed`
  (voice-attention thread will add these here, not per-repo).
- `ProbePublishRegistry` — type-only handles for the
  `useControlPlaneProbePublish()` pub/sub registry. The implementation
  stays per-repo because it imports React.
- `OperatorTraceStandardPayload` and event taxonomy constants — the
  cross-project vocabulary for trace payloads (`project_key`, `event_class`,
  `route_path`, `entity_kind`, `outcome`, redaction status, preset policy).
  Project-specific event strings can remain domain-specific while sharing
  these fields.

### Cross-component envelope contracts (v1.1.0+)

Added to prevent the contract-drift class of bugs across the
mesh / sidecar / gateway / console-ui boundary. Each module documents
the specific drift trap it closes.

- `ObservationEvent` (`envelope-observation.ts`) — mesh-owned durable
  shape for `observation_events` rows. `event_ref` is the stable
  UNIQUE key. Read by console-ui hooks, produced by every HMAC-signed
  component (sitelayer, voice-tools, attention-tools, sidecar,
  screen-capture).
- `BrowserBridgeResearchEvent` (`envelope-browser-bridge.ts`) — sidecar
  LOCAL-only shape. Has `event_id` (random UUID) which MUST NOT cross
  into mesh; sidecar's `stripEventIdForMeshIngest` washes the field
  out at the wire boundary.
- `HMACRequestHeaders` (`envelope-hmac.ts`) — the three HTTP headers
  (`X-Mesh-Component` / `X-Mesh-Signature` / `X-Mesh-Timestamp`) every
  signed mesh API call must set together. Headers, not body fields —
  earlier task drafts sketched a body-resident shape that would have
  defeated HMAC's authenticate-before-parse property.

The Go mirror in `control-plane/mesh/core/shared_envelope_types.go`
pins these field names; control-plane CI
(`scripts/check-shared-types-consistency.sh`) fails if the two drift.

## Install

This package is distributed as a public GitHub repo. Consumers add it
as a git-URL dependency:

```jsonc
{
  "dependencies": {
    "@operator/types": "github:taylorSando/operator-types#v1.4.0"
  }
}
```

Then `npm install` will fetch and build the package. The `prepare`
lifecycle is intentionally not used; consumers either build from the
shipped `dist/` (if published with `npm pack` to a tarball) or use the
`src/index.ts` entry directly via TypeScript bundler resolution.

For consumers that want zero-build resolution, point at the source
directly:

```jsonc
"@operator/types": "github:taylorSando/operator-types#v1.4.0"
```

TypeScript projects with `moduleResolution: 'Bundler'` (vite, next,
modern setups) will pick up `src/index.ts` via the `./src` export.

## Cross-thread coordination

Voice, attention-window, and screen-caption event constants live in
`src/event-types.ts`. Extend that file in place when adding stable
observation event types; do not create per-repo parallel catalogs.

## Versioning

Semver. The `event_type` literal values are wire-stable; once an event
type has shipped to mesh storage, the literal string must not change.
Add a new constant instead.

## Where this came from

The duplicated types lived in 9 repos before this extraction. See
`~/projects/digital-ontology/tab-to-task-implementation-plan-2026-05-22.md`
§2.3 + §17.2 for the extraction rationale.
