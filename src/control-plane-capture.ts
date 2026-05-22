/**
 * `ControlPlaneCapture` — the snapshot every operator-owned app publishes
 * onto `window.__controlPlaneProbe.capture()` so the browser-bridge
 * capture-modal can consume any tab without per-app branching.
 *
 * Wire-shape origin: chess, nhl, winwar, sitelayer, learn, qedviz,
 * sandolab (8ball / otter), console-ui all ship a probe with this same
 * contract. This package consolidates that contract.
 *
 * `entity_id` allows `null` (matches chess/sitelayer/learn/qedviz/console-ui);
 * the older nhl/winwar shape that excluded null is a strict subset and
 * remains assignable.
 *
 * See:
 *   ~/projects/digital-ontology/tab-to-task-current-state-2026-05-22.md §1.6
 *   ~/projects/digital-ontology/tab-to-task-implementation-plan-2026-05-22.md §2.3
 */
export interface ControlPlaneCapture {
  /** Free-form per-route page state. Folded into the capture envelope. */
  page_state?: Record<string, unknown>;
  /** Route-shaped identifier — what entity is the operator looking at. */
  path: {
    entity_kind: string;
    entity_id: string | number | null;
    [k: string]: unknown;
  };
  /** Caller identity (user/principal). */
  principal?: Record<string, unknown>;
  /** Acting-as / impersonation marker. */
  acting_as?: string | null;
  /** Trace propagation hooks if the app participates in distributed tracing. */
  trace?: { trace_id?: string; span_id?: string } | null;
  /** Build-sha + tier marker so captures can be tied back to a known release. */
  deploy?: { build_sha?: string; env?: string } | null;
  /** Active feature flags (free-form). */
  feature_flags?: Record<string, unknown>;
  /** Ambient context (locale, theme, time zone — free-form). */
  ambient?: Record<string, unknown>;
}

/**
 * Global window-attached probe contract. Every operator app installs an
 * object of this shape under `window.__controlPlaneProbe` while mounted,
 * cleans up on unmount, and version-stamps so an HMR/A-B newer probe
 * doesn't clobber an older one's cleanup.
 */
export interface ControlPlaneProbeGlobal {
  capture: () => ControlPlaneCapture;
  version: string;
}

/**
 * Helper to widen `window` with the probe global. Each consumer also
 * declares this in their own probe file via `declare global`; importing
 * this type is optional but available for callers that want to read the
 * registry through a strongly-typed handle.
 */
export type ControlPlaneProbeMethod = ControlPlaneProbeGlobal['capture'];
