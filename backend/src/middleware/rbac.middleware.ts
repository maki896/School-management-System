import type { NextFunction, Request, Response } from "express";

import type { RoleName } from "../constants/roles";
import { HttpError } from "../utils/http-error";

export function requireRole(...allowedRoles: RoleName[]) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    if (!request.auth) {
      next(new HttpError(401, "Authentication is required.", "AUTH_REQUIRED"));
      return;
    }

    if (!allowedRoles.includes(request.auth.role)) {
      next(
        new HttpError(
          403,
          "You do not have permission to access this resource.",
          "ACCESS_DENIED",
        ),
      );
      return;
    }

    next();
  };
}
