const test = require("node:test");
const assert = require("node:assert");
const { str, oneOf, required } = require("../utils/validate");
const { complaintShape, serviceShape } = require("../utils/shapes");

test("str only returns trimmed strings (blocks NoSQL operator objects)", () => {
  assert.strictEqual(str("  hi  "), "hi");
  assert.strictEqual(str({ $gt: "" }), "");
  assert.strictEqual(str(["a"]), "");
  assert.strictEqual(str("x".repeat(600), 10).length, 10);
});

test("oneOf / required throw 400", () => {
  assert.strictEqual(oneOf("Water", ["Water"], "category"), "Water");
  assert.throws(() => oneOf("Nope", ["Water"], "category"), (e) => e.status === 400);
  assert.throws(() => required("", "x"), (e) => e.status === 400);
});

test("complaintShape keeps the field names the frontend uses", () => {
  const at = new Date("2026-01-02T00:00:00Z");
  const s = complaintShape({ complaintId: "MG-B-0147", category: "Water", title: "t", status: "Pending", urgency: "Low",
    address: "a", residentName: "r", createdAt: at, updatedAt: at, statusHistory: [] });
  assert.strictEqual(s.id, "MG-B-0147");
  assert.strictEqual(s.cat, "Water");
  assert.strictEqual(s.ts, at.getTime());
  assert.strictEqual(s.hasPhoto, false);
  assert.ok(!("photoData" in s));
});

test("serviceShape maps timestamps", () => {
  const at = new Date();
  const s = serviceShape({ _id: "abc", serviceId: "gardening", name: "Gardening", category: "Maintenance", status: "Requested", createdAt: at, updatedAt: at, addedBy: "x", address: "y" });
  assert.strictEqual(s.addedAt, at.getTime());
});
