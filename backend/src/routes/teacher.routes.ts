import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import {
  getTeacherDashboardController,
  listAssignedStudentsController,
} from "../controllers/teacher-dashboard.controller";
import {
  createTeacherMarkController,
  listTeacherMarksController,
  updateTeacherMarkController,
} from "../controllers/teacher-marks.controller";
import {
  createTeacherAttendanceController,
  listTeacherAttendanceController,
  updateTeacherAttendanceController,
} from "../controllers/teacher-attendance.controller";

export const teacherRouter = Router();

teacherRouter.use(requireAuth, requireRole("Teacher"));

teacherRouter.get("/dashboard", getTeacherDashboardController);
teacherRouter.get("/students", listAssignedStudentsController);
teacherRouter.get("/marks", listTeacherMarksController);
teacherRouter.post("/marks", createTeacherMarkController);
teacherRouter.patch("/marks/:markId", updateTeacherMarkController);
teacherRouter.get("/attendance", listTeacherAttendanceController);
teacherRouter.post("/attendance", createTeacherAttendanceController);
teacherRouter.patch(
  "/attendance/:attendanceId",
  updateTeacherAttendanceController,
);
