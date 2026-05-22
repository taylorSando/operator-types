# @operator/types

Shared TypeScript types for the operator-owned browser-bridge capture
surface. Consumed by chess, nhl, winwar, sitelayer, learn, qedviz,
sandolab, and console-ui.

## What lives here

Pure types — no runtime code beyond a handful of `event_type` string
constants.

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

## Install

This package is distributed as a public GitHub repo. Consumers add it
as a git-URL dependency:

```jsonc
{
  "dependencies": {
    "@operator/types": "github:taylorSando/operator-types#v1.0.0"
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
"@operator/types": "github:taylorSando/operator-types#v1.0.0"
```

TypeScript projects with `moduleResolution: 'Bundler'` (vite, next,
modern setups) will pick up `src/index.ts` via the `./src` export.

## Cross-thread coordination

The **voice-attention thread** will add `attention_window.opened` and
`attention_window.closed` event-type constants in
`src/event-types.ts`. A TODO marker in that file describes the
extension pattern. Do not branch this file — extend in place so both
threads stay coordinated.

## Versioning

Semver. The `event_type` literal values are wire-stable; once an event
type has shipped to mesh storage, the literal string must not change.
Add a new constant instead.

## Where this came from

The duplicated types lived in 9 repos before this extraction. See
`~/projects/digital-ontology/tab-to-task-implementation-plan-2026-05-22.md`
§2.3 + §17.2 for the extraction rationale.
