const { test } = require("node:test");
const assert = require("node:assert/strict");

const baseUrl = process.env.BASE_URL || "http://localhost:3000";

test("GET /health devuelve 200 y status ok", async () => {
  const response = await fetch(`${baseUrl}/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { status: "ok" });
});

test("GET /ruta-inexistente devuelve 404 Route not found", async () => {
  const response = await fetch(`${baseUrl}/ruta-que-no-existe-xyz`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.deepEqual(body, { error: "Route not found" });
});
