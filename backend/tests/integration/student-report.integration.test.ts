import request from "supertest";

import { app } from "../../src/app";
import { AttendanceRecordModel } from "../../src/models/attendance-record.model";
import { EnrollmentModel } from "../../src/models/enrollment.model";
import { MarkModel } from "../../src/models/mark.model";
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

describe("Student self-service report workflows", () => {
  beforeAll(startIntegrationDatabase);
  afterAll(stopIntegrationDatabase);
  beforeEach(resetIntegrationDatabase);

  it("returns only the signed-in student's published marks and active attendance", async () => {
    const teacher = await createTestUser("Teacher", {
      email: "teacher.report@school.local",
    });
    const student = await createTestUser("Student", {
      email: "student.report@school.local",
    });
    const otherStudent = await createTestUser("Student", {
      email: "student.other.report@school.local",
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

    await EnrollmentModel.create({
      studentId: otherStudent._id.toString(),
      gradeId: grade._id.toString(),
      subjectId: subject._id.toString(),
      status: "active",
    });

    await MarkModel.create({
      studentId: student._id.toString(),
      subjectId: subject._id.toString(),
      gradeId: grade._id.toString(),
      teacherId: teacher._id.toString(),
      assessmentType: "Final Exam",
      score: 89,
      maxScore: 100,
      term: "Term 3",
      status: "published",
    });

    await MarkModel.create({
      studentId: otherStudent._id.toString(),
      subjectId: subject._id.toString(),
      gradeId: grade._id.toString(),
      teacherId: teacher._id.toString(),
      assessmentType: "Final Exam",
      score: 54,
      maxScore: 100,
      term: "Term 3",
      status: "published",
    });

    await MarkModel.create({
      studentId: student._id.toString(),
      subjectId: subject._id.toString(),
      gradeId: grade._id.toString(),
      teacherId: teacher._id.toString(),
      assessmentType: "Draft Quiz",
      score: 44,
      maxScore: 50,
      term: "Term 3",
      status: "draft",
    });

    await AttendanceRecordModel.create({
      studentId: student._id.toString(),
      gradeId: grade._id.toString(),
      subjectId: subject._id.toString(),
      teacherId: teacher._id.toString(),
      date: new Date("2026-03-11"),
      status: "present",
      notes: "On time",
      active: true,
    });

    await AttendanceRecordModel.create({
      studentId: otherStudent._id.toString(),
      gradeId: grade._id.toString(),
      subjectId: subject._id.toString(),
      teacherId: teacher._id.toString(),
      date: new Date("2026-03-11"),
      status: "absent",
      active: true,
    });

    await AttendanceRecordModel.create({
      studentId: student._id.toString(),
      gradeId: grade._id.toString(),
      subjectId: subject._id.toString(),
      teacherId: teacher._id.toString(),
      date: new Date("2026-03-09"),
      status: "late",
      active: false,
    });

    const headers = createAuthHeader(student, "Student");

    const reportResponse = await request(app)
      .get("/api/student/me/report")
      .set(headers);

    expect(reportResponse.status).toBe(200);
    expect(reportResponse.body.student.email).toBe(
      "student.report@school.local",
    );
    expect(reportResponse.body.grade.name).toBe(grade.name);
    expect(reportResponse.body.marks).toHaveLength(1);
    expect(reportResponse.body.marks[0].score).toBe(89);
    expect(reportResponse.body.attendance).toHaveLength(1);
    expect(reportResponse.body.attendance[0].status).toBe("present");

    const marksResponse = await request(app)
      .get("/api/student/me/marks")
      .set(headers);

    expect(marksResponse.status).toBe(200);
    expect(marksResponse.body.items).toHaveLength(1);
    expect(marksResponse.body.items[0].assessmentType).toBe("Final Exam");

    const attendanceResponse = await request(app)
      .get("/api/student/me/attendance")
      .set(headers);

    expect(attendanceResponse.status).toBe(200);
    expect(attendanceResponse.body.items).toHaveLength(1);
    expect(attendanceResponse.body.items[0].date).toBe("2026-03-11");
  });

  it("denies non-student roles from student self-service endpoints", async () => {
    const teacher = await createTestUser("Teacher", {
      email: "teacher.denied.report@school.local",
    });

    const response = await request(app)
      .get("/api/student/me/report")
      .set(createAuthHeader(teacher, "Teacher"));

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("ACCESS_DENIED");
  });
});
