import { Router } from "express";

import {
  createAttendanceController,
  deleteAttendanceController,
  getAttendanceController,
  listAttendanceController,
  updateAttendanceController,
} from "../controllers/admin-attendance.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";

export const adminAttendanceRouter = Router();

adminAttendanceRouter.use(requireAuth, requireRole("Admin"));

adminAttendanceRouter.get("/attendance", listAttendanceController);
adminAttendanceRouter.post("/attendance", createAttendanceController);
adminAttendanceRouter.get("/attendance/:attendanceId", getAttendanceController);
adminAttendanceRouter.patch(
  "/attendance/:attendanceId",
  updateAttendanceController,
);
adminAttendanceRouter.delete(
  "/attendance/:attendanceId",
  deleteAttendanceController,
);
