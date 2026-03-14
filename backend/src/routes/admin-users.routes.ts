import { Router } from "express";

import {
  createStudentController,
  createTeacherController,
  deleteStudentController,
  deleteTeacherController,
  getStudentController,
  getTeacherController,
  listStudentsController,
  listTeachersController,
  updateStudentController,
  updateTeacherController,
} from "../controllers/admin-users.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";

export const adminUsersRouter = Router();

adminUsersRouter.use(requireAuth, requireRole("Admin"));

adminUsersRouter.get("/teachers", listTeachersController);
adminUsersRouter.post("/teachers", createTeacherController);
adminUsersRouter.get("/teachers/:teacherId", getTeacherController);
adminUsersRouter.patch("/teachers/:teacherId", updateTeacherController);
adminUsersRouter.delete("/teachers/:teacherId", deleteTeacherController);

adminUsersRouter.get("/students", listStudentsController);
adminUsersRouter.post("/students", createStudentController);
adminUsersRouter.get("/students/:studentId", getStudentController);
adminUsersRouter.patch("/students/:studentId", updateStudentController);
adminUsersRouter.delete("/students/:studentId", deleteStudentController);
