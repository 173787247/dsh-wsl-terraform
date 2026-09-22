import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { summarizePlan } from "../lib/tf.js";

describe("plan summary", () => {
  it("parses", () => {
    const s = summarizePlan("Plan: 1 to add, 2 to change, 0 to destroy.");
    assert.equal(s.add, 1);
    assert.equal(s.change, 2);
  });
});
