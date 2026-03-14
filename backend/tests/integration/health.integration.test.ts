import request from "supertest";

import { app } from "../../src/app";

describe("GET /api/health", () => {
  it("returns a successful health payload without requiring authentication", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: "ok",
      }),
    );
  });
});
