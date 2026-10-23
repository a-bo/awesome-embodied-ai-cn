#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const phases = new Set(['E0', 'E1', 'E2', 'E3', 'E4', 'E5']);
const modes = new Set(['headless', 'offscreen-video', 'interactive']);
const required = [
  'run_id', 'execution_phase', 'isaac_lab_ref_or_image_tag',
  'isaac_sim_version', 'gpu_model', 'nvidia_driver', 'visualization_mode',
  'task_id', 'command', 'started_at', 'outcome', 'evidence'
];

function validate(record) {
  const errors = [];
  for (const key of required) if (!record[key]) errors.push(`missing ${key}`);
  if (!phases.has(record.execution_phase)) errors.push('execution_phase must be E0–E5');
  if (!modes.has(record.visualization_mode)) errors.push('invalid visualization_mode');
  if (!['passed', 'blocked', 'failed'].includes(record.outcome)) errors.push('invalid outcome');
  if (!Array.isArray(record.evidence) || record.evidence.length === 0) errors.push('evidence must be a non-empty array');
  if (record.outcome === 'passed' && record.exit_code !== 0) errors.push('passed requires exit_code 0');
  if (record.outcome === 'passed' && !record.evidence?.some((item) => item.kind === 'log' && item.path)) {
    errors.push('passed requires a log evidence item with path');
  }
  return errors;
}

const file = process.argv[2];
if (!file) {
  console.error('usage: node validate-run-record.mjs <record.json>');
  process.exit(2);
}
let record;
try { record = JSON.parse(await readFile(file, 'utf8')); }
catch (error) { console.error(`cannot read JSON: ${error.message}`); process.exit(2); }

const errors = validate(record);
if (errors.length) {
  console.error(`INVALID (${errors.length})\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`VALID ${record.run_id}: ${record.execution_phase} / ${record.outcome}`);
