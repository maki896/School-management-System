import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";

import { env } from "../../src/config/env";
import { requireAuth } from "../../src/middleware/auth.middleware";
import { requireRole } from "../../src/middleware/rbac.middleware";

function createMiddlewareApp() {
  const app = express();

  app.get(
    "/admin-only",
    requireAuth,
    requireRole("Admin"),
    (_request, response) => {
      response.status(200).json({ ok: true });
    },
  );

  app.get(
    "/teacher-or-admin",
    requireAuth,
    requireRole("Teacher", "Admin"),
    (_request, response) => {
      response.status(200).json({ ok: true });
    },
  );

  app.use(
    (
      error: unknown,
      _request: express.Request,
      response: express.Response,
      _next: express.NextFunction,
    ) => {
      if (
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        "message" in error
      ) {
        response.status((error as { statusCode: number }).statusCode).json({
          message: (error as { message: string }).message,
          code: (error as { code?: string }).code,
        });
        return;
      }

      response.status(500).json({
        message: "Unexpected server error.",
        code: "INTERNAL_SERVER_ERROR",
      });
    },
  );

  return app;
}

function createToken(
  payload: Record<string, unknown>,
  expiresIn: string | number = "8h",
) {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
}

describe("RBAC middleware regression coverage", () => {
  const app = createMiddlewareApp();

  it("returns AUTH_REQUIRED when the bearer header is missing", async () => {
    const response = await request(app).get("/admin-only");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("AUTH_REQUIRED");
  });

  it("returns INVALID_TOKEN when the token is malformed", async () => {
    const response = await request(app)
      .get("/admin-only")
      .set("Authorization", "Bearer definitely-not-a-jwt");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_TOKEN");
  });

  it("returns SESSION_EXPIRED when the token has expired", async () => {
    const expiredToken = createToken(
      {
        sub: "teacher-1",
        role: "Teacher",
        email: "teacher.expired@school.local",
      },
      -10,
    );

    const response = await request(app)
      .get("/teacher-or-admin")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("SESSION_EXPIRED");
  });

  it("returns INVALID_TOKEN when required claims are missing", async () => {
    const tokenWithoutRole = createToken({
      sub: "user-1",
      email: "invalid.claims@school.local",
    });

    const response = await request(app)
      .get("/teacher-or-admin")
      .set("Authorization", `Bearer ${tokenWithoutRole}`);

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_TOKEN");
  });

  it("returns ACCESS_DENIED when the authenticated role is outside the allowed scope", async () => {
    const studentToken = createToken({
      sub: "student-1",
      role: "Student",
      email: "student.scope@school.local",
    });

    const response = await request(app)
      .get("/teacher-or-admin")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("ACCESS_DENIED");
  });

  it("allows requests when the authenticated role matches the allowed scope", async () => {
    const adminToken = createToken({
      sub: "admin-1",
      role: "Admin",
      email: "admin.scope@school.local",
    });

    const response = await request(app)
      .get("/teacher-or-admin")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
