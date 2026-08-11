import assert from "node:assert/strict";
import test from "node:test";

import { detect } from "../app/page";

test("rejects unknown short Latin input", () => {
  assert.deepEqual(detect("Mn"), {
    verdict: "gibberish",
    reason: "It is too short to validate and is not a recognised word or abbreviation.",
  });
  assert.equal(detect("xy").verdict, "gibberish");
  assert.equal(detect("zxq").verdict, "gibberish");
});

test("accepts recognised short words and abbreviations", () => {
  for (const value of ["a", "I", "cat", "go", "AI", "CV", "kg", "UK"]) {
    assert.equal(detect(value).verdict, "valid", value);
  }
});

test("retains longer and non-Latin detection", () => {
  assert.equal(detect("Bicycle").verdict, "valid");
  assert.equal(detect("fskjhsfskjdfh").verdict, "gibberish");
  assert.deepEqual(detect("こんにちは"), {
    verdict: "valid",
    reason: "Non-Latin text is accepted conservatively to avoid language bias.",
  });
});
