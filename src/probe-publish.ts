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

/**
 * Snapshot of every key currently in the registry. The implementation
 * returns a plain object keyed by the publish key.
 */
export type ProbePublishRegistrySnapshot = Record<string, unknown>;

/**
 * Signature of the registry-reader helper consumers re-export from
 * their per-repo pub/sub module. The probe calls this at capture time.
 */
export type ReadProbePublishRegistryFn = () => ProbePublishRegistrySnapshot;

/**
 * Signature of the React hook consumers re-export. Calling components
 * publish `snapshot` under `key` for the lifetime of the component;
 * the cleanup removes the key on unmount.
 *
 * Type-only declaration — the implementation is per-repo because it
 * imports React. This signature lets shared docs / lints / mock
 * fixtures depend on the contract without importing React themselves.
 */
export type UseControlPlaneProbePublishFn = (key: string, snapshot: unknown) => void;

/**
 * Optional metadata diagnostic the registry can expose. Mirrors
 * sitelayer's `getProbePublishMetadata` helper.
 */
export type GetProbePublishMetadataFn = (
  key: string,
) => { publishedAt: number; ageMs: number } | null;

/**
 * Bundle the three signatures above into a single handle so a callsite
 * can type-check the full pub/sub module without enumerating each
 * function. Per-repo modules may add `__resetProbePublish` for tests;
 * that's intentionally not in the shared contract.
 */
export interface ProbePublishRegistry {
  readProbePublishRegistry: ReadProbePublishRegistryFn;
  useControlPlaneProbePublish: UseControlPlaneProbePublishFn;
  getProbePublishMetadata?: GetProbePublishMetadataFn;
}
