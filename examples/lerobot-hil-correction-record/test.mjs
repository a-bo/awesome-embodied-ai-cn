import { validate } from "./validate-hil-record.mjs";
import fixture from "./hil-correction.synthetic.json" with { type: "json" };

let passed = 0;
function expect(name, mutate, wanted) {
  const value = structuredClone(fixture); mutate(value);
  const errors = validate(value);
  if (wanted ? !errors.some((error) => error.includes(wanted)) : errors.length) throw new Error(`${name}: ${errors.join(", ")}`);
  passed++;
}
expect("fixture is valid", () => {}, null);
expect("rejects unknown status", (r) => { r.status = "success"; }, "invalid status");
expect("requires mode", (r) => { delete r.recording_mode; }, "missing recording_mode");
expect("requires evidence", (r) => { r.evidence = []; }, "evidence must");
expect("rejects token", (r) => { r.evidence.push("ghp_abcdefghijklmnopqrstuvwxyz123456"); }, "token-like");
expect("requires contiguous timeline", (r) => { r.segments[1].started_at = "2026-11-13T09:30:19Z"; }, "prior segment end");
expect("requires pause trigger", (r) => { delete r.segments[0].trigger; }, ".trigger required");
expect("requires prior policy", (r) => { r.segments[0].controller = "human"; r.segments[0].correction_intent = "x"; r.segments[0].review_state = "excluded"; }, "preceding policy");
expect("requires review state", (r) => { r.segments[1].review_state = "maybe"; }, ".review_state invalid");
expect("completed needs final completion", (r) => { r.status = "completed"; }, "completed final");
console.log(`${passed} acceptance tests passed`);
