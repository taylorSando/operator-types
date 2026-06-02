// Runtime contract test for project_binding.v1 (WS0-B) —
//   schemas/project-binding.schema.json + src/project-binding.ts
//
// The WS0-B source branch shipped the type + schema but NO test and NO export;
// the release gate adds both. This test mirrors the guarantees the
// capture-envelope contract test already enforces:
//   1. the schema pins required[], additionalProperties:false, and the single
//      declared schema_version (carried on the wrapping document);
//   2. the hand-written TS interface stays field-for-field in sync with the
//      schema (a field added to one but not the other is a build failure);
//   3. the strip-list / rejection cases hold against a minimal structural
//      validator: a missing project_key is rejected, a smuggled monorepo-shape
//      field (affected_packages) is rejected by additionalProperties:false, and
//      goal_anchor is OPTIONAL so a qedviz-style no-goal binding validates.
//
// Runs against the COMPILED dist/ for the TS side (npm test builds first) and
// the raw JSON for the schema side. No TS runner and no ajv dependency needed —
// the validator below enforces exactly the two JSON-Schema constraints the
// rejection cases exercise (required + additionalProperties:false), matching the
// package's "no runtime deps" discipline.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = path.dirname(fileURLToPath(import.meta.url));

function loadSchema(name) {
  return JSON.parse(fs.readFileSync(path.join(__dir, '..', 'schemas', name), 'utf8'));
}

// Top-level field names of a `interface <Name> {…}` block in a built .d.ts —
// the same brace-walk the capture-envelope + dispatch-callback tests use.
function tsInterfaceFields(dtsFile, interfaceName) {
  const text = fs.readFileSync(path.join(__dir, '..', 'dist', dtsFile), 'utf8');
  const m = new RegExp(`interface\\s+${interfaceName}\\s*\\{`).exec(text);
  assert.ok(m, `${interfaceName} interface not found in ${dtsFile}`);
  let depth = 0;
  const start = m.index + m[0].length - 1;
  let end = start;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) {
      end = i;
      break;
    }
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

// Minimal structural validator for the two constraints the rejection cases
// exercise: `required` presence and `additionalProperties:false`. Returns the
// list of violations (empty => valid). Deliberately tiny + dependency-free.
function validateAgainst(schema, obj) {
  const errors = [];
  for (const key of schema.required || []) {
    if (!(key in obj)) errors.push(`missing required '${key}'`);
  }
  if (schema.additionalProperties === false) {
    const allowed = new Set(Object.keys(schema.properties || {}));
    for (const key of Object.keys(obj)) {
      if (!allowed.has(key)) errors.push(`additional property '${key}' not allowed`);
    }
  }
  return errors;
}

const BINDING = loadSchema('project-binding.schema.json');

// --- schema invariants ------------------------------------------------------

test('project-binding schema pins required, closed shape, and ONLY project_key required', () => {
  assert.equal(BINDING.additionalProperties, false, 'unknown fields must fail structurally');
  assert.deepEqual(BINDING.required, ['project_key'], 'only project_key is required');
  // goal_anchor must NOT be required (the load-bearing genericity fix) and must
  // be optional + opaque (string | null), never a closed enum of known goal ids.
  assert.ok(!BINDING.required.includes('goal_anchor'), 'goal_anchor must not be required');
  assert.ok(!('enum' in BINDING.properties.goal_anchor), 'goal_anchor must not be a closed enum roster');
});

// The wrapping document carries the single declared schema_version, mirroring
// CaptureEnvelopeProperties. The TS ProjectBindingSchemaVersion pins it to '1.0'.
test('project-binding declares a single schema_version on the wrapping document', () => {
  const dts = fs.readFileSync(path.join(__dir, '..', 'dist', 'project-binding.d.ts'), 'utf8');
  assert.match(dts, /ProjectBindingSchemaVersion\s*=\s*['"]1\.0['"]/, 'schema_version must be pinned to 1.0');
});

// --- schema ↔ TS field parity ----------------------------------------------

test('project-binding schema and TS interface are field-for-field in sync', () => {
  const schemaFields = new Set(Object.keys(BINDING.properties));
  const tsFields = tsInterfaceFields('project-binding.d.ts', 'ProjectBindingV1');
  const inSchemaOnly = [...schemaFields].filter((f) => !tsFields.has(f)).sort();
  const inTsOnly = [...tsFields].filter((f) => !schemaFields.has(f)).sort();
  assert.deepEqual(
    { inSchemaOnly, inTsOnly },
    { inSchemaOnly: [], inTsOnly: [] },
    'project-binding.schema.json and src/project-binding.ts have drifted — add the field to BOTH.',
  );
});

// --- strip-list / rejection cases -------------------------------------------

// A minimal valid binding needs ONLY project_key (goal_anchor optional).
test('project-binding accepts a minimal project_key-only binding', () => {
  assert.deepEqual(validateAgainst(BINDING, { project_key: 'nhl' }), []);
});

// goal_anchor is optional: a qedviz-style project with NO mesh goal validates.
test('project-binding validates a goal-less (qedviz-style) binding', () => {
  const qedviz = {
    project_key: 'qedviz',
    display_name: 'Qedviz',
    git_remote_url: 'git@github.com:taylorSando/qedviz.git',
    git_default_branch: 'main',
    url_patterns: ['qedviz.sandolab.xyz'],
    // NB: no goal_anchor — qedviz has no GoalID.
  };
  assert.deepEqual(validateAgainst(BINDING, qedviz), [], 'a no-goal binding must validate');
});

// A goal-anchored binding (nhl=G04) also validates — the opaque string carries it.
test('project-binding validates a goal-anchored binding (opaque goal_anchor)', () => {
  const nhl = { project_key: 'nhl', goal_anchor: 'G04', repo_names: ['nhl'] };
  assert.deepEqual(validateAgainst(BINDING, nhl), []);
});

// Missing project_key is rejected — it is the single required routing field.
test('project-binding rejects a binding with no project_key', () => {
  const errors = validateAgainst(BINDING, { display_name: 'No Key' });
  assert.ok(
    errors.some((e) => e.includes("missing required 'project_key'")),
    `expected a missing-project_key error, got: ${errors.join('; ')}`,
  );
});

// A smuggled monorepo-shape field (affected_packages) is rejected by
// additionalProperties:false — it must never be a typed top-level binding field.
test('project-binding rejects a smuggled affected_packages (monorepo shape)', () => {
  assert.ok(
    !('affected_packages' in BINDING.properties),
    'affected_packages must not be a typed schema property',
  );
  const errors = validateAgainst(BINDING, {
    project_key: 'sitelayer',
    affected_packages: ['@sitelayer/domain'],
  });
  assert.ok(
    errors.some((e) => e.includes("additional property 'affected_packages' not allowed")),
    `expected affected_packages to be rejected, got: ${errors.join('; ')}`,
  );
});
