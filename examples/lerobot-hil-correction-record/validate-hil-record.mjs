#!/usr/bin/env node
import { readFileSync } from "node:fs";

const MODES = new Set(["corrections_only", "continuous"]);
const STATUSES = new Set(["not_run", "blocked", "aborted", "completed"]);
const OUTCOMES = new Set(["paused", "aborted", "completed", "blocked"]);
const REVIEW = new Set(["exclude_pending_review", "approved_for_review", "excluded"]);
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const SECRET = /(gh[pousr]_[A-Za-z0-9_]+|github_pat_|hf_[A-Za-z0-9_-]{12,}|Bearer\s+\S+)/i;

export function validate(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) return ["record must be an object"];
  const errors = [];
  const required = ["attempt_id", "status", "recording_mode", "release_or_commit", "policy", "hardware", "segments", "evidence"];
  for (const key of required) if (!(key in record)) errors.push(`missing ${key}`);
  if (!STATUSES.has(record.status)) errors.push("invalid status");
  if (!MODES.has(record.recording_mode)) errors.push("invalid recording_mode");
  if (!Array.isArray(record.segments) || record.segments.length === 0) errors.push("segments must be a non-empty array");
  if (!Array.isArray(record.evidence) || record.evidence.length === 0) errors.push("evidence must be a non-empty array");
  if (JSON.stringify(record).match(SECRET)) errors.push("token-like text is not allowed");
  let previousEnd = null;
  let policySeen = false;
  for (const [index, segment] of (record.segments || []).entries()) {
    const at = `segments[${index}]`;
    if (!segment || typeof segment !== "object") { errors.push(`${at} must be an object`); continue; }
    if (!/^s\d+$/.test(segment.segment_id || "")) errors.push(`${at}.segment_id must use sNN form`);
    if (!["policy", "human"].includes(segment.controller)) errors.push(`${at}.controller invalid`);
    if (!ISO.test(segment.started_at || "") || !ISO.test(segment.ended_at || "")) errors.push(`${at} requires UTC second timestamps`);
    else {
      if (segment.started_at >= segment.ended_at) errors.push(`${at} start must precede end`);
      if (previousEnd && segment.started_at !== previousEnd) errors.push(`${at} must start at prior segment end`);
      previousEnd = segment.ended_at;
    }
    if (!OUTCOMES.has(segment.outcome)) errors.push(`${at}.outcome invalid`);
    if (segment.controller === "policy") policySeen = true;
    if (segment.controller === "human") {
      if (!policySeen) errors.push(`${at} human correction needs a preceding policy segment`);
      if (typeof segment.correction_intent !== "string" || !segment.correction_intent.trim()) errors.push(`${at}.correction_intent required`);
      if (!REVIEW.has(segment.review_state)) errors.push(`${at}.review_state invalid`);
    }
    if (segment.controller === "policy" && segment.outcome === "paused" && !segment.trigger) errors.push(`${at}.trigger required when paused`);
  }
  if (record.status === "completed" && (record.segments || []).at(-1)?.outcome !== "completed") errors.push("completed attempt needs a completed final segment");
  if (record.status === "not_run" && (record.segments || []).length) errors.push("not_run attempt cannot contain segments");
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) { console.error("Usage: node validate-hil-record.mjs <record.json>"); process.exit(64); }
  let record;
  try { record = JSON.parse(readFileSync(path, "utf8")); } catch (error) { console.error(`INVALID JSON: ${error.message}`); process.exit(65); }
  const errors = validate(record);
  if (errors.length) { console.error(`INVALID ${path}\n- ${errors.join("\n- ")}`); process.exit(1); }
  console.log(`VALID ${path} ${record.status} / ${record.recording_mode}`);
}
