import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";

import { env } from "./config/env";
import { adminAcademicsRouter } from "./routes/admin-academics.routes";
import { adminAttendanceRouter } from "./routes/admin-attendance.routes";
import { adminUsersRouter } from "./routes/admin-users.routes";
import { authRouter } from "./routes/auth.routes";
import { studentRouter } from "./routes/student.routes";
import { teacherRouter } from "./routes/teacher.routes";
import { HttpError } from "./utils/http-error";

export const app = express();

app.use(

  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response
    .status(200)
    .json({ status: "ok", database: mongoose.connection.readyState });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminUsersRouter);
app.use("/api/admin", adminAcademicsRouter);
app.use("/api/admin", adminAttendanceRouter);
app.use("/api/teacher", teacherRouter);
app.use("/api/student", studentRouter);

app.use(
  (
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    if (error instanceof ZodError) {

      response.status(400).json({
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        issues: error.issues,
      });
      return;
    }

    if (error instanceof HttpError) {
      response
        .status(error.statusCode)
        .json({ message: error.message, code: error.code });
      return;
    }

    response.status(500).json({
      message: "Unexpected server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  },
);
