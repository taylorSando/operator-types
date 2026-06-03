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

// v2.0.0: the `controlled-project map pins project_key → repo/host` test was
// removed with the OPERATOR_CONTROLLED_PROJECTS roster. The per-customer
// project_key → repo/host mapping no longer lives in this contract package;
// the authority resolves projects data-driven from projects.url_patterns
// (mig 295). OperatorProjectKey is now an open string, not a frozen union.

// ---------------------------------------------------------------------------
// THE single source of truth for the capture envelope is
// schemas/capture-envelope.schema.json. The hand-written TS interface in
// src/capture-envelope.ts (which keeps rich cross-module types the schema can't
// express) MUST stay field-for-field in sync with the schema, so a field added
// to one but not the other is a build failure. Producers (capture Python,
// sidecar JS) validate their OUTPUT against the same schema at test time.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA = JSON.parse(
  fs.readFileSync(path.join(__dir, '..', 'schemas', 'capture-envelope.schema.json'), 'utf8'),
);

// Parse the top-level field names of the CaptureEnvelope interface from the
// built declarations (same brace-walk the producer guards use).
function tsInterfaceFields() {
  const text = fs.readFileSync(
    path.join(__dir, '..', 'dist', 'capture-envelope.d.ts'),
    'utf8',
  );
  const m = /interface\s+CaptureEnvelope\s*\{/.exec(text);
  assert.ok(m, 'CaptureEnvelope interface not found');
  let depth = 0, start = m.index + m[0].length - 1, end = start;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) { end = i; break; }
  }
  const body = text.slice(start + 1, end);
  const fields = new Set();
  depth = 0;
  for (const line of body.split('\n')) {
    const fm = /^([A-Za-z_][A-Za-z0-9_]*)\??\s*:/.exec(line.trim());
    if (depth === 0 && fm) fields.add(fm[1]);
    depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
  }
  return fields;
}

test('capture-envelope schema and TS interface are field-for-field in sync', () => {
  const schemaFields = new Set(Object.keys(SCHEMA.properties));
  const tsFields = tsInterfaceFields();
  const inSchemaOnly = [...schemaFields].filter((f) => !tsFields.has(f)).sort();
  const inTsOnly = [...tsFields].filter((f) => !schemaFields.has(f)).sort();
  assert.deepEqual(
    { inSchemaOnly, inTsOnly },
    { inSchemaOnly: [], inTsOnly: [] },
    'capture-envelope.schema.json and src/capture-envelope.ts have drifted — ' +
      'add the field to BOTH (the schema is the source of truth).',
  );
});

test('capture-envelope schema pins the single declared schema_version', () => {
  assert.equal(SCHEMA.properties.schema_version.const, '1.0');
  assert.equal(SCHEMA.additionalProperties, false, 'unknown fields must fail structurally');
  assert.deepEqual(SCHEMA.required, ['schema_version', 'url']);
});
