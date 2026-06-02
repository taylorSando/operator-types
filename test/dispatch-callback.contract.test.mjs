// Runtime contract tests for the work-OUT envelopes added in WS0:
//   DispatchRequestV1  (schemas/dispatch-request.schema.json + src/dispatch-request.ts)
//   CallbackClaimV1    (schemas/callback-claim.schema.json  + src/callback-claim.ts)
//
// Mirrors the guarantees the capture-envelope contract test already enforces:
//   1. the schema pins schema_version, required[], additionalProperties:false;
//   2. the hand-written TS interface stays field-for-field in sync with the schema
//      (a field added to one but not the other is a build failure);
//   3. the STRIP-LIST is structurally absent — a mesh-internal routing primitive,
//      a concrete model name, or a monorepo/roster literal must NOT be a typed
//      schema property (the genericity guard).
//
// Runs against the COMPILED dist/ for the TS side (npm test builds first) and the
// raw JSON for the schema side. No TS runner needed.
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
// the same brace-walk the capture-envelope test (and the producer guards) use.
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

const DISPATCH = loadSchema('dispatch-request.schema.json');
const CALLBACK = loadSchema('callback-claim.schema.json');

// --- dispatch-request.v1 ----------------------------------------------------

test('dispatch-request schema pins version, required keys, and closed shape', () => {
  assert.equal(DISPATCH.properties.schema_version.const, '1');
  assert.equal(DISPATCH.additionalProperties, false, 'unknown fields must fail structurally');
  assert.deepEqual(DISPATCH.required, ['schema_version', 'project_key', 'intent']);
});

test('dispatch-request schema and TS interface are field-for-field in sync', () => {
  const schemaFields = new Set(Object.keys(DISPATCH.properties));
  const tsFields = tsInterfaceFields('dispatch-request.d.ts', 'DispatchRequestV1');
  const inSchemaOnly = [...schemaFields].filter((f) => !tsFields.has(f)).sort();
  const inTsOnly = [...tsFields].filter((f) => !schemaFields.has(f)).sort();
  assert.deepEqual(
    { inSchemaOnly, inTsOnly },
    { inSchemaOnly: [], inTsOnly: [] },
    'dispatch-request.schema.json and src/dispatch-request.ts have drifted — add the field to BOTH.',
  );
});

// The genericity guard: these mesh-internal routing primitives, concrete-model
// names, and monorepo/roster literals MUST NOT be typed schema properties. A
// customer puts none of them on the wire; the authority resolves routing itself.
test('dispatch-request strips mesh-internal routing + monorepo/roster shapes', () => {
  const banned = [
    'counsel_class',
    'steerer_workflow_id',
    'dispatch_mode',
    'claim_mode',
    'requested_model',
    'affected_packages',
    'workspaces',
    'project_hint',
    'source_system',
    'callback_url', // callback lives in callback-claim.v1, never here
    'webhook_url',
  ];
  const present = banned.filter((k) => k in DISPATCH.properties);
  assert.deepEqual(present, [], `strip-list fields leaked into dispatch-request schema: ${present.join(', ')}`);
});

// project_key is an OPAQUE string the authority resolves — never an enum/const
// roster, and never a 'sitelayer' literal baked into the contract.
test('dispatch-request project_key is an opaque string, not a closed roster', () => {
  const pk = DISPATCH.properties.project_key;
  assert.equal(pk.type, 'string');
  assert.ok(!('enum' in pk), 'project_key must not be a closed enum roster');
  assert.ok(!('const' in pk), 'project_key must not be a const literal');
});

// requested_capability is a capability, never a concrete model/provider name.
test('dispatch-request asks for a capability, not a model', () => {
  assert.ok('requested_capability' in DISPATCH.properties, 'requested_capability missing');
  assert.ok(!('requested_model' in DISPATCH.properties), 'requested_model must not be a field');
});

// --- callback-claim.v1 ------------------------------------------------------

test('callback-claim schema pins version, required keys, and closed shape', () => {
  assert.equal(CALLBACK.properties.schema_version.const, '1');
  assert.equal(CALLBACK.additionalProperties, false, 'unknown fields must fail structurally');
  assert.deepEqual(CALLBACK.required, ['schema_version', 'callback_url', 'auth_scheme']);
});

test('callback-claim schema and TS interface are field-for-field in sync', () => {
  const schemaFields = new Set(Object.keys(CALLBACK.properties));
  const tsFields = tsInterfaceFields('callback-claim.d.ts', 'CallbackClaimV1');
  const inSchemaOnly = [...schemaFields].filter((f) => !tsFields.has(f)).sort();
  const inTsOnly = [...tsFields].filter((f) => !schemaFields.has(f)).sort();
  assert.deepEqual(
    { inSchemaOnly, inTsOnly },
    { inSchemaOnly: [], inTsOnly: [] },
    'callback-claim.schema.json and src/callback-claim.ts have drifted — add the field to BOTH.',
  );
});

// auth_scheme unifies the two divergent legacy shapes into one enum; the token
// is a mesh-minted REFERENCE, never a literal env-var name or secret value.
test('callback-claim unifies auth into one enum and defaults to scoped_bearer', () => {
  const auth = CALLBACK.properties.auth_scheme;
  assert.deepEqual(auth.enum, ['scoped_bearer', 'hmac', 'none']);
  assert.equal(auth.default, 'scoped_bearer');
  assert.ok('token_ref' in CALLBACK.properties, 'token_ref (mesh-minted reference) missing');
  // No literal env-var-name field — the credential is referenced, not named.
  assert.ok(!('token_env' in CALLBACK.properties), 'token must be a ref, not a literal env-var name');
});
