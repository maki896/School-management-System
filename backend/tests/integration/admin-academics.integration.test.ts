import request from "supertest";

import { app } from "../../src/app";
import {
  createAuthHeader,
  createGradeAndSubject,
  createTestUser,
  resetIntegrationDatabase,
  startIntegrationDatabase,
  stopIntegrationDatabase,
} from "../fixtures/integration-test-helpers";

jest.setTimeout(120000);

describe("Admin academic management", () => {
  beforeAll(startIntegrationDatabase);
  afterAll(stopIntegrationDatabase);

  beforeEach(resetIntegrationDatabase);

  it("allows an admin to manage academic records end to end", async () => {
    const admin = await createTestUser("Admin");
    const teacher = await createTestUser("Teacher", {
      email: "math.teacher@school.local",
      staffIdentifier: "T-300",
    });
    const student = await createTestUser("Student", {
      email: "learner@school.local",
      studentIdentifier: "S-300",
    });

    const headers = createAuthHeader(admin, "Admin");

    const subjectResponse = await request(app)
      .post("/api/admin/subjects")
      .set(headers)
      .send({ name: "Mathematics", code: "MTH-1", description: "Core math" });

    expect(subjectResponse.status).toBe(201);

    const gradeResponse = await request(app)
      .post("/api/admin/grades")
      .set(headers)
      .send({ name: "Grade 9", academicYear: "2026" });

    expect(gradeResponse.status).toBe(201);

    const subjectId = subjectResponse.body.item.id as string;
    const gradeId = gradeResponse.body.item.id as string;

    const enrollmentResponse = await request(app)
      .post("/api/admin/enrollments")
      .set(headers)
      .send({ studentId: student._id.toString(), gradeId, subjectId });

    expect(enrollmentResponse.status).toBe(201);

    const assignmentResponse = await request(app)
      .post("/api/admin/teaching-assignments")
      .set(headers)
      .send({ teacherId: teacher._id.toString(), gradeId, subjectId });

    expect(assignmentResponse.status).toBe(201);

    const attendanceResponse = await request(app)
      .post("/api/admin/attendance")
      .set(headers)
      .send({
        studentId: student._id.toString(),
        teacherId: teacher._id.toString(),
        gradeId,
        subjectId,
        date: "2026-03-12",
        status: "present",
        notes: "On time",
      });

    expect(attendanceResponse.status).toBe(201);
    expect(attendanceResponse.body.item.studentName).toContain("Student");

    const updateAttendanceResponse = await request(app)
      .patch(`/api/admin/attendance/${attendanceResponse.body.item.id}`)
      .set(headers)
      .send({ status: "late", notes: "Late by 10 minutes" });

    expect(updateAttendanceResponse.status).toBe(200);
    expect(updateAttendanceResponse.body.item.status).toBe("late");

    const listResponse = await request(app)
      .get("/api/admin/attendance")
      .set(headers);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.items).toHaveLength(1);

    const archiveEnrollmentResponse = await request(app)
      .delete(`/api/admin/enrollments/${enrollmentResponse.body.item.id}`)
      .set(headers);

    expect(archiveEnrollmentResponse.status).toBe(204);

    const archiveAssignmentResponse = await request(app)
      .delete(
        `/api/admin/teaching-assignments/${assignmentResponse.body.item.id}`,
      )
      .set(headers);

    expect(archiveAssignmentResponse.status).toBe(204);
  });

  it("rejects duplicate enrollments for the same active student-grade-subject context", async () => {
    const admin = await createTestUser("Admin");
    const student = await createTestUser("Student", {
      email: "duplicate.student@school.local",
      studentIdentifier: "S-900",
    });
    const { grade, subject } = await createGradeAndSubject();
    const headers = createAuthHeader(admin, "Admin");

    const payload = {
      studentId: student._id.toString(),
      gradeId: grade._id.toString(),
      subjectId: subject._id.toString(),
    };

    const firstResponse = await request(app)
      .post("/api/admin/enrollments")
      .set(headers)
      .send(payload);

    expect(firstResponse.status).toBe(201);

    const secondResponse = await request(app)
      .post("/api/admin/enrollments")
      .set(headers)
      .send(payload);

    expect(secondResponse.status).toBe(409);
    expect(secondResponse.body.code).toBe("ENROLLMENT_EXISTS");
  });

  it("accepts blank optional subject fields when creating subjects from admin forms", async () => {
    const admin = await createTestUser("Admin");
    const headers = createAuthHeader(admin, "Admin");

    const response = await request(app)
      .post("/api/admin/subjects")
      .set(headers)
      .send({
        name: "Chemistry",
        code: "",
        description: "",
      });

    expect(response.status).toBe(201);
    expect(response.body.item).toEqual(
      expect.objectContaining({
        name: "Chemistry",
      }),
    );
  });
});
