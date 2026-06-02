// Compile-time contract assertions for the WS0 read-surface DTOs — type-checked
// by `tsc --noEmit -p tsconfig.test.json` (the existing `npm test` gate already
// globs test/**/*.ts), never executed. These DTOs are the stable wire shapes
// mesh emits to console-ui, DISTINCT from mesh's internal DB-row structs. If a
// contract-owned field is renamed/removed, this file fails to compile.
//
// PURE-ADDITIVE: this guard adds NO dependency on src/index.ts — it imports the
// DTO modules directly, so the barrel-release commit (WS0+WS8+WS4) stays the
// sole owner of index.ts.
import type { GoalDTO, GoalDTODetail } from '../src/read-surface-goal.js';
import type {
  TaskDTO,
  TaskRoutingDTO,
  TaskExecutionDTO,
  TaskResultDTO,
} from '../src/read-surface-task.js';
import type {
  DbHealthSummary,
  DbHealthPool,
} from '../src/read-surface-db-health.js';
import type {
  RunnerSnapshot,
  RunnerStateEntry,
} from '../src/read-surface-runner.js';

// --- GoalDTO -------------------------------------------------------------
// Minimal base goal: the flywheel aggregates (proposals/workflow_attention)
// are NOT part of the base shape (ledger fix), so a base DTO needs none of
// them.
const _goal: GoalDTO = {
  goal_id: 'G04',
  title: 'Ship the read surface',
  status: 'active',
  progress_pct: 42,
  updated_at: '2026-06-02T00:00:00Z',
};
void _goal;

// time_horizon is optional + open string | null.
const _gh1: GoalDTO['time_horizon'] = 'evergreen';
const _gh2: GoalDTO['time_horizon'] = null;
const _gh3: GoalDTO['time_horizon'] = undefined;
void _gh1;
void _gh2;
void _gh3;

// The flywheel aggregates live ONLY on the optional detail extension.
const _goalDetail: GoalDTODetail = {
  ..._goal,
  proposal_count: 3,
  pending_proposals: 1,
  open_task_count: 5,
  active_task_count: 2,
};
void _goalDetail;

// A base GoalDTO must NOT carry a flywheel aggregate (excess-property check).
// @ts-expect-error proposal_count is detail-only, not on the base DTO.
const _goalLeak: GoalDTO = { ..._goal, proposal_count: 3 };
void _goalLeak;

// --- TaskDTO -------------------------------------------------------------
// Ledger fix: the raw *_json blob strings are NOT on the DTO; routing/
// execution/result are named, optional, parsed sub-objects.
const _task: TaskDTO = {
  task_id: 137121,
  project_key: 'nhl',
  subject: 'daily-sync',
  state: 'in_progress',
  priority: 'high',
  dispatch_mode: 'steerer',
  created_at: '2026-06-02T00:00:00Z',
  updated_at: '2026-06-02T01:00:00Z',
  routing: { lane: 'light', routing_hint: 'auto', execution_hint: null },
  execution: { runtime_class: 'cli', workspace_class: 'isolated', claim_mode: null },
  result: { summary: 'done', artifact_count: 2, worker: 'taylor-pc-ubuntu' },
};
void _task;

// Sub-objects are independently nameable + nullable.
const _routing: TaskRoutingDTO = { lane: 'deep' };
const _exec: TaskExecutionDTO = { runtime_class: 'browser' };
const _res: TaskResultDTO = { summary: null };
const _taskNoBlobs: TaskDTO = {
  task_id: 1,
  project_key: 'chess',
  subject: 'puzzle-gen',
  state: 'pending',
  priority: 'low',
  dispatch_mode: 'auto',
  created_at: '2026-06-02T00:00:00Z',
  updated_at: '2026-06-02T00:00:00Z',
  routing: null,
  execution: null,
  result: null,
};
void _routing;
void _exec;
void _res;
void _taskNoBlobs;

// The raw blob string must NOT be assignable onto the DTO.
// @ts-expect-error routing_json is the raw blob — it is intentionally absent.
const _taskBlobLeak: TaskDTO = { ..._task, routing_json: '{"lane":"x"}' };
void _taskBlobLeak;

// --- DbHealthSummary -----------------------------------------------------
// Ledger fix: ONE canonical typed `pools` array (no postgres_pools twin).
const _pool: DbHealthPool = {
  pool_name: 'fleet',
  tier: 'fleet',
  status: 'healthy',
  in_use: 3,
  idle: 17,
  configured: true,
  shared_with_fleet: false,
  ping_ms: 4,
  database: 'mesh',
  db_size_bytes: 14_000_000,
  error: null,
};
const _dbHealth: DbHealthSummary = {
  status: 'ok',
  summary: 'fleet postgres healthy',
  pools: [_pool],
  issue_types: [],
};
void _pool;
void _dbHealth;

// The duplicate `postgres_pools` key the OR-fallback keyed on is GONE — it
// must not be assignable.
// @ts-expect-error postgres_pools is the killed duplicate key.
const _dbHealthDupe: DbHealthSummary = { ..._dbHealth, postgres_pools: [_pool] };
void _dbHealthDupe;

// --- RunnerSnapshot ------------------------------------------------------
// Ledger fix: run-state + counts + last-tick only; NO priority_profiles /
// lane_environment_pools / homeostasis.
const _runner: RunnerSnapshot = {
  run_state: 'running',
  tick_running: false,
  active_count: 2,
  total_dispatched: 4096,
  last_tick_dispatches: 1,
  last_tick_decisions: 3,
  last_tick_started_at: '2026-06-02T00:00:00Z',
  last_tick_finished_at: '2026-06-02T00:00:01Z',
  last_tick_age_ms: 1200,
  last_tick_stalled: false,
  runners: [{ runner_id: 'r1', tool: 'claude', enabled: true, run_state: 'idle' }],
};
void _runner;

const _runnerEntry: RunnerStateEntry = { runner_id: 'r2', run_state: 'busy' };
void _runnerEntry;

// Scheduler internals must NOT be smuggled onto the snapshot.
// @ts-expect-error homeostasis is a scheduler internal, excluded from the DTO.
const _runnerLeak: RunnerSnapshot = { ..._runner, homeostasis: {} };
void _runnerLeak;
