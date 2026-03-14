import { Router } from "express";

import {
  createEnrollmentController,
  createGradeController,
  createSubjectController,
  createTeachingAssignmentController,
  deleteEnrollmentController,
  deleteGradeController,
  deleteSubjectController,
  deleteTeachingAssignmentController,
  getGradeController,
  getSubjectController,
  listEnrollmentsController,
  listGradesController,
  listSubjectsController,
  listTeachingAssignmentsController,
  updateEnrollmentController,
  updateGradeController,
  updateSubjectController,
  updateTeachingAssignmentController,
} from "../controllers/admin-academics.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";

export const adminAcademicsRouter = Router();

adminAcademicsRouter.use(requireAuth, requireRole("Admin"));

adminAcademicsRouter.get("/subjects", listSubjectsController);
adminAcademicsRouter.post("/subjects", createSubjectController);
adminAcademicsRouter.get("/subjects/:subjectId", getSubjectController);
adminAcademicsRouter.patch("/subjects/:subjectId", updateSubjectController);
adminAcademicsRouter.delete("/subjects/:subjectId", deleteSubjectController);

adminAcademicsRouter.get("/grades", listGradesController);
adminAcademicsRouter.post("/grades", createGradeController);
adminAcademicsRouter.get("/grades/:gradeId", getGradeController);
adminAcademicsRouter.patch("/grades/:gradeId", updateGradeController);
adminAcademicsRouter.delete("/grades/:gradeId", deleteGradeController);

adminAcademicsRouter.get("/enrollments", listEnrollmentsController);
adminAcademicsRouter.post("/enrollments", createEnrollmentController);
adminAcademicsRouter.patch(
  "/enrollments/:enrollmentId",
  updateEnrollmentController,
);
adminAcademicsRouter.delete(
  "/enrollments/:enrollmentId",
  deleteEnrollmentController,
);

adminAcademicsRouter.get(
  "/teaching-assignments",
  listTeachingAssignmentsController,
);
adminAcademicsRouter.post(
  "/teaching-assignments",
  createTeachingAssignmentController,
);
adminAcademicsRouter.patch(
  "/teaching-assignments/:assignmentId",
  updateTeachingAssignmentController,
);
adminAcademicsRouter.delete(
  "/teaching-assignments/:assignmentId",
  deleteTeachingAssignmentController,
);
