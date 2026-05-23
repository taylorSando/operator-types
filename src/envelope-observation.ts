/**
 * `ObservationEvent` — the cross-component envelope for the mesh
 * `observation_events` table. Single source of truth shared across
 * console-ui (reader), sidecar (producer), and mesh (Go authority).
 *
 * ## Authority
 *
 * Mesh owns the durable row. `event_ref` is the stable UNIQUE key —
 * derived deterministically by the producer or by mesh as
 * `<source>:<event_type>:<subject.type>:<subject.id>:<occurred_at>` so
 * repeated emits for the same subject at the same instant collapse to
 * one row.
 *
 * ## Drift trap (what this type prevents)
 *
 * - Sidecar's local-debug `event_id` (random UUID) is observability-only
 *   and MUST NOT be POSTed to mesh. See `BrowserBridgeResearchEvent` in
 *   `envelope-browser-bridge.ts` for the sidecar-local shape. Mesh
 *   strips any incoming `event_id` field as a defense; producers should
 *   strip it at the wire boundary too. See
 *   `browser-bridge-sidecar/src/plugin.js:stripEventIdForMeshIngest`.
 * - `source_kind` is the HMAC-verified component identity stamped by
 *   the mesh handler (overrides whatever the producer put in the body's
 *   `source` field).
 * - `payload` is a Postgres `jsonb` column round-tripped as a raw JSON
 *   string from the query endpoint; consumers parse on read.
 *
 * ## Mirror
 *
 * `mesh/core/shared_envelope_types.go::ObservationEvent` is the Go
 * mirror. `scripts/check-shared-types-consistency.sh` (control-plane)
 * fails CI if a TS field is renamed without the Go side matching.
 *
 * ## Wire format
 *
 *   GET /api/runtime/observation-events?... → { events: ObservationEvent[], ... }
 *   POST /api/observations/ingest (HMAC-signed) → 202 { event_ref }
 */
export interface ObservationEvent {
  /** Mesh row id (read path only; absent on ingest). */
  id?: number;
  /**
   * Stable UNIQUE key — deterministic hash of (source, event_type,
   * subject.type, subject.id, occurred_at). Mesh derives this on
   * ingest; consumers see it on read.
   */
  event_ref: string;
  /** e.g. `measurement_breach`, `work_item_obstructed`, `utterance`. */
  event_type: string;
  /**
   * HMAC-verified component identity (stamped server-side). NOT the
   * producer's self-reported source; mesh overrides on ingest.
   */
  source_kind: string;
  /** Producer-supplied path / pointer (free-form, NOT the same as `source_kind`). */
  source_ref: string;
  /** `info | warning | normal | critical | ...` — producer-supplied. */
  severity: string;
  /** Optional numeric value (measurement_breach et al.); null on non-numeric events. */
  value?: number | null;
  /** Unit for `value` if present; empty string otherwise. */
  unit?: string;
  /**
   * Raw JSON string of the jsonb `payload` column. Consumers parse on
   * read. POST ingest accepts a JSON object — mesh re-serializes for
   * storage.
   */
  payload: string;
  /** ISO-8601 timestamp the event occurred (producer wall clock). */
  occurred_at: string;
  /** ISO-8601 timestamp mesh wrote the row (read path only). */
  created_at?: string;
}

/**
 * `ObservationIngestRequest` — the POST body shape the
 * `/api/observations/ingest` endpoint accepts from HMAC-signed
 * producers (sitelayer, voice-tools, attention-tools, browser-bridge
 * sidecar, screen-capture).
 *
 * Note: `source` in the body is advisory — mesh overrides it with the
 * HMAC-verified component identity before computing `event_ref`. Do
 * NOT include a local-debug `event_id` field; mesh's
 * `stripEventIdForMeshIngest` (sidecar) wash + ADR-0003 ingest contract
 * both reject it.
 */
export interface ObservationIngestRequest {
  source: string;
  event_type: string;
  subject: ObservationSubject;
  status?: string;
  reason?: string;
  severity?: string;
  occurred_at: string;
  metadata?: Record<string, unknown>;
  /** Optional jsonb payload (alternative to flat top-level fields). */
  payload?: Record<string, unknown>;
}

export interface ObservationSubject {
  type: string;
  id: string;
}
