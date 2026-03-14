import request from "supertest";

import { app } from "../../src/app";
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

describe("Teacher marks and dashboard workflows", () => {
  beforeAll(startIntegrationDatabase);
  afterAll(stopIntegrationDatabase);
  beforeEach(resetIntegrationDatabase);

  it("shows only assigned students and allows marks inside teacher scope", async () => {
    const teacher = await createTestUser("Teacher", {
      email: "teacher.scope@school.local",
    });
    const otherTeacher = await createTestUser("Teacher", {
      email: "teacher.other@school.local",
    });
    const student = await createTestUser("Student", {
      email: "student.scope@school.local",
    });
    const otherStudent = await createTestUser("Student", {
      email: "student.other@school.local",
    });
    const { grade, subject } = await createGradeAndSubject();
    const secondContext = await createGradeAndSubject();

    await TeachingAssignmentModel.create({
      teacherId: teacher._id.toString(),
      gradeId: grade._id.toString(),
      subjectId: subject._id.toString(),
      status: "active",
    });
    await TeachingAssignmentModel.create({
      teacherId: otherTeacher._id.toString(),
      gradeId: secondContext.grade._id.toString(),
      subjectId: secondContext.subject._id.toString(),
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
      gradeId: secondContext.grade._id.toString(),
      subjectId: secondContext.subject._id.toString(),
      status: "active",
    });

    const headers = createAuthHeader(teacher, "Teacher");

    const studentsResponse = await request(app)
      .get("/api/teacher/students")
      .set(headers);

    expect(studentsResponse.status).toBe(200);
    expect(studentsResponse.body.items).toHaveLength(1);
    expect(studentsResponse.body.items[0].email).toBe(
      "student.scope@school.local",
    );

    const createMarkResponse = await request(app)
      .post("/api/teacher/marks")
      .set(headers)
      .send({
        studentId: student._id.toString(),
        gradeId: grade._id.toString(),
        subjectId: subject._id.toString(),
        assessmentType: "Midterm",
        score: 91,
        maxScore: 100,
        term: "Term 2",
        status: "published",
      });

    expect(createMarkResponse.status).toBe(201);
    expect(createMarkResponse.body.item.score).toBe(91);

    const markId = createMarkResponse.body.item.id as string;

    const updateMarkResponse = await request(app)
      .patch(`/api/teacher/marks/${markId}`)
      .set(headers)
      .send({ score: 94, status: "draft" });

    expect(updateMarkResponse.status).toBe(200);
    expect(updateMarkResponse.body.item.score).toBe(94);
    expect(updateMarkResponse.body.item.status).toBe("draft");

    const dashboardResponse = await request(app)
      .get("/api/teacher/dashboard")
      .set(headers);

    expect(dashboardResponse.status).toBe(200);
    expect(dashboardResponse.body.assignments).toHaveLength(1);
    expect(dashboardResponse.body.students).toHaveLength(1);
    expect(dashboardResponse.body.recentMarks).toHaveLength(1);

    const marksResponse = await request(app)
      .get("/api/teacher/marks")
      .set(headers);

    expect(marksResponse.status).toBe(200);
    expect(marksResponse.body.items).toHaveLength(1);

    expect(await MarkModel.countDocuments().exec()).toBe(1);
  });

  it("denies mark creation outside assigned teacher scope", async () => {
    const teacher = await createTestUser("Teacher", {
      email: "teacher.denied@school.local",
    });
    const student = await createTestUser("Student", {
      email: "student.denied@school.local",
    });
    const { grade, subject } = await createGradeAndSubject();

    await EnrollmentModel.create({
      studentId: student._id.toString(),
      gradeId: grade._id.toString(),
      subjectId: subject._id.toString(),
      status: "active",
    });

    const response = await request(app)
      .post("/api/teacher/marks")
      .set(createAuthHeader(teacher, "Teacher"))
      .send({
        studentId: student._id.toString(),
        gradeId: grade._id.toString(),
        subjectId: subject._id.toString(),
        assessmentType: "Quiz",
        score: 72,
        maxScore: 100,
        term: "Term 1",
        status: "published",
      });

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("TEACHER_SCOPE_DENIED");
  });
});
