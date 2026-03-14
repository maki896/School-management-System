import request from "supertest";

import { app } from "../../src/app";
import { AttendanceRecordModel } from "../../src/models/attendance-record.model";
import { EnrollmentModel } from "../../src/models/enrollment.model";
import { TeachingAssignmentModel } from "../../src/models/teaching-assignment.model";
import {
  createAuthHeader,
  createGradeAndSubject,
  createTestUser,
  resetIntegrationDatabase,
  startIntegrationDatabase,
  stopIntegrationDatabase,
} from "../fixtures/integration-test-helpers";

jest.setTimeout(120000);

describe("Teacher attendance workflows", () => {
  beforeAll(startIntegrationDatabase);
  afterAll(stopIntegrationDatabase);
  beforeEach(resetIntegrationDatabase);

  it("allows attendance creation and update only within assigned teacher scope", async () => {
    const teacher = await createTestUser("Teacher", {
      email: "teacher.attendance@school.local",
    });
    const student = await createTestUser("Student", {
      email: "student.attendance@school.local",
    });
    const { grade, subject } = await createGradeAndSubject();

    await TeachingAssignmentModel.create({
      teacherId: teacher._id.toString(),
      gradeId: grade._id.toString(),
      subjectId: subject._id.toString(),
      status: "active",
    });
    await EnrollmentModel.create({
      studentId: student._id.toString(),
      gradeId: grade._id.toString(),
      subjectId: subject._id.toString(),
      status: "active",
    });

    const headers = createAuthHeader(teacher, "Teacher");

    const createResponse = await request(app)
      .post("/api/teacher/attendance")
      .set(headers)
      .send({
        studentId: student._id.toString(),
        gradeId: grade._id.toString(),
        subjectId: subject._id.toString(),
        date: "2026-03-12",
        status: "present",
        notes: "Ready for class",
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.item.status).toBe("present");

    const attendanceId = createResponse.body.item.id as string;

    const updateResponse = await request(app)
      .patch(`/api/teacher/attendance/${attendanceId}`)
      .set(headers)
      .send({ status: "late", notes: "Arrived after attendance call" });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.item.status).toBe("late");

    const listResponse = await request(app)
      .get("/api/teacher/attendance")
      .set(headers);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.items).toHaveLength(1);
    expect(listResponse.body.items[0].studentName).toContain("Student");

    expect(await AttendanceRecordModel.countDocuments().exec()).toBe(1);
  });

  it("denies attendance creation when the student is outside teacher scope", async () => {
    const teacher = await createTestUser("Teacher", {
      email: "teacher.attendance.denied@school.local",
    });
    const student = await createTestUser("Student", {
      email: "student.attendance.denied@school.local",
    });
    const { grade, subject } = await createGradeAndSubject();

    await EnrollmentModel.create({
      studentId: student._id.toString(),
      gradeId: grade._id.toString(),
      subjectId: subject._id.toString(),
      status: "active",
    });

    const response = await request(app)
      .post("/api/teacher/attendance")
      .set(createAuthHeader(teacher, "Teacher"))
      .send({
        studentId: student._id.toString(),
        gradeId: grade._id.toString(),
        subjectId: subject._id.toString(),
        date: "2026-03-12",
        status: "present",
      });

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("TEACHER_SCOPE_DENIED");
  });
});
