import test from "node:test";
import assert from "node:assert/strict";
import { stableStringify } from "@aegis/core";

test("stableStringify sorts keys", () => {
  const a = stableStringify({ b: 1, a: 2 });
  const b = stableStringify({ a: 2, b: 1 });
  assert.equal(a, b);
  assert.equal(a, JSON.stringify({ a: 2, b: 1 }));
});
