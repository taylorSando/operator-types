/**
 * Types for the `useControlPlaneProbePublish()` pub/sub registry.
 * The implementation stays per-repo (it imports React, and several
 * consumers ship slightly different cleanup-tokening strategies); only
 * the type-side handles are shared here.
 *
 * Reference implementation:
 *   ~/projects/sitelayer/apps/web/src/lib/control-plane-probe-pub.ts
 *
 * Pattern: route screens publish their xstate snapshots into a
 * module-scope `Map`; the `ControlPlaneProbe` reads the map at
 * `capture()` time and folds it into `page_state`.
 */
export {};
//# sourceMappingURL=probe-publish.js.map