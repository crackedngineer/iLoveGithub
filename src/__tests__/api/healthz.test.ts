/**
 * @jest-environment node
 */

import {GET} from "@/app/api/healthz/route";

describe("GET /api/healthz", () => {
  it("responds with HTTP 200", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });

  it("returns status 'ok' in the JSON body", async () => {
    const response = await GET();
    const data = await response.json();
    expect(data.status).toBe("ok");
  });

  it("returns a human-readable message confirming the app is alive", async () => {
    const response = await GET();
    const data = await response.json();
    expect(data.message).toBe("Application is alive");
  });

  it("includes a timestamp in ISO 8601 format", async () => {
    const before = Date.now();
    const response = await GET();
    const data = await response.json();
    const ts = new Date(data.timestamp).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(data.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });

  it("includes process uptime as a number", async () => {
    const response = await GET();
    const data = await response.json();
    expect(typeof data.uptime).toBe("number");
    expect(data.uptime).toBeGreaterThanOrEqual(0);
  });

  it("includes memory usage with used, total and unit fields", async () => {
    const response = await GET();
    const data = await response.json();
    expect(data.memory).toHaveProperty("used");
    expect(data.memory).toHaveProperty("total");
    expect(data.memory.unit).toBe("MB");
  });
});
