import { Router } from "express";

import {
  getStudentReportController,
  listStudentAttendanceController,
  listStudentMarksController,
} from "../controllers/student-report.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";

export const studentRouter = Router();

studentRouter.use(requireAuth, requireRole("Student"));

studentRouter.get("/me/report", getStudentReportController);
studentRouter.get("/me/marks", listStudentMarksController);
studentRouter.get("/me/attendance", listStudentAttendanceController);
