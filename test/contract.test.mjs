// Runtime contract tests for @operator/types — the wire-level guard the
// system-testing-inventory (2026-05-27) flagged as highest-leverage: this
// package defines the event-type catalog + capture envelope that the entire
// capture→task→PEL loop serializes through, and it had ZERO tests, so a silent
// rename broke every consumer (mesh Go, sidecar, console-ui) with nothing to catch it.
//
// Runs against the COMPILED dist/ (no TS runner needed): `npm test` builds first.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  OPERATOR_EVENT_PAGE_CAPTURED,
  OPERATOR_EVENT_TASK_CREATED_FROM_CAPTURE,
  OPERATOR_EVENT_TASK_COMPLETED_FROM_CAPTURE,
  OPERATOR_EVENT_ATTENTION_WINDOW_OPENED,
  OPERATOR_EVENT_ATTENTION_WINDOW_CLOSED,
  OPERATOR_EVENT_UTTERANCE,
  OPERATOR_EVENT_PAGE_CONTEXT,
  OPERATOR_EVENT_SCREEN_SEGMENT,
  KNOWN_OPERATOR_EVENT_TYPES,
} from '../dist/event-types.js';
import { OPERATOR_CONTROLLED_PROJECTS } from '../dist/operator-event-taxonomy.js';

// These exact strings are hardcoded on the mesh Go side
// (task_completion_capture_observation.go, server_observation_events_by_window.go,
// attention_window_reaper_keeper.go). Renaming one here silently desyncs the loop.
test('capture event-type literals are frozen (the TS↔Go wire contract)', () => {
  assert.equal(OPERATOR_EVENT_PAGE_CAPTURED, 'operator.page.captured');
  assert.equal(OPERATOR_EVENT_TASK_CREATED_FROM_CAPTURE, 'operator.task.created_from_capture');
  assert.equal(OPERATOR_EVENT_TASK_COMPLETED_FROM_CAPTURE, 'operator.task.completed_from_capture');
  assert.equal(OPERATOR_EVENT_ATTENTION_WINDOW_OPENED, 'attention_window.opened');
  assert.equal(OPERATOR_EVENT_ATTENTION_WINDOW_CLOSED, 'attention_window.closed');
  assert.equal(OPERATOR_EVENT_UTTERANCE, 'utterance');
  assert.equal(OPERATOR_EVENT_PAGE_CONTEXT, 'page_context');
  assert.equal(OPERATOR_EVENT_SCREEN_SEGMENT, 'segment');
});

test('KNOWN_OPERATOR_EVENT_TYPES enumerates the full capture lifecycle', () => {
  for (const t of [
    OPERATOR_EVENT_PAGE_CAPTURED,
    OPERATOR_EVENT_TASK_COMPLETED_FROM_CAPTURE,
    OPERATOR_EVENT_ATTENTION_WINDOW_OPENED,
    OPERATOR_EVENT_ATTENTION_WINDOW_CLOSED,
  ]) {
    assert.ok(KNOWN_OPERATOR_EVENT_TYPES.includes(t), `catalog missing ${t}`);
  }
});

// The project routing map capture project_hint resolution / host-affinity depends on.
test('controlled-project map pins project_key → repo/host', () => {
  const byKey = Object.fromEntries(OPERATOR_CONTROLLED_PROJECTS.map((p) => [p.project_key, p]));
  assert.ok(byKey.hockeypedia, 'hockeypedia project missing');
  assert.deepEqual(byKey.hockeypedia.repo_names, ['nhl']);
  assert.ok(byKey.sitelayer, 'sitelayer project missing');
  for (const p of OPERATOR_CONTROLLED_PROJECTS) {
    assert.ok(
      p.project_key && Array.isArray(p.repo_names) && Array.isArray(p.production_hosts),
      `project entry ${p.project_key} is missing routing fields`,
    );
  }
});
