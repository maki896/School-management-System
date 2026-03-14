import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { env } from "../config/env";
import type { RoleName } from "../constants/roles";
import { HttpError } from "../utils/http-error";

export interface AuthPayload {
  sub: string;
  role: RoleName;
  email: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

const authPayloadSchema = z.object({
  sub: z.string().min(1),
  role: z.enum(["Admin", "Teacher", "Student"] satisfies [
    RoleName,
    ...RoleName[],
  ]),
  email: z.string().email(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export function requireAuth(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    next(new HttpError(401, "Authentication is required.", "AUTH_REQUIRED"));
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    next(new HttpError(401, "Authentication is required.", "AUTH_REQUIRED"));
    return;
  }

  try {
    const decodedToken = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    request.auth = authPayloadSchema.parse(decodedToken);
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(
        new HttpError(
          401,
          "Your session has expired. Please sign in again.",
          "SESSION_EXPIRED",
        ),
      );
      return;
    }

    next(
      new HttpError(
        401,
        "Your session is invalid. Please sign in again.",
        "INVALID_TOKEN",
      ),
    );
  }
}
