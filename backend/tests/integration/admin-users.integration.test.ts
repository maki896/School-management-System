import request from "supertest";

import { app } from "../../src/app";
import {
  createAuthHeader,
  createTestUser,
  resetIntegrationDatabase,
  startIntegrationDatabase,
  stopIntegrationDatabase,
} from "../fixtures/integration-test-helpers";

jest.setTimeout(120000);

describe("Admin user management", () => {
  beforeAll(startIntegrationDatabase);
  afterAll(stopIntegrationDatabase);

  beforeEach(resetIntegrationDatabase);

  it("allows an admin to create, update, list, and deactivate teachers", async () => {
    const admin = await createTestUser("Admin");
    const adminHeaders = createAuthHeader(admin, "Admin");

    const createResponse = await request(app)
      .post("/api/admin/teachers")
      .set(adminHeaders)
      .send({
        firstName: "Rita",
        lastName: "Mason",
        email: "rita.teacher@school.local",
        staffIdentifier: "T-200",
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.item).toEqual(
      expect.objectContaining({
        email: "rita.teacher@school.local",
        role: "Teacher",
        staffIdentifier: "T-200",
      }),
    );

    const teacherId = createResponse.body.item.id as string;

    const updateResponse = await request(app)
      .patch(`/api/admin/teachers/${teacherId}`)
      .set(adminHeaders)
      .send({ lastName: "Owens" });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.item.lastName).toBe("Owens");

    const listResponse = await request(app)
      .get("/api/admin/teachers")
      .set(adminHeaders);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.items).toHaveLength(1);

    const deleteResponse = await request(app)
      .delete(`/api/admin/teachers/${teacherId}`)
      .set(adminHeaders);

    expect(deleteResponse.status).toBe(204);

    const detailResponse = await request(app)
      .get(`/api/admin/teachers/${teacherId}`)
      .set(adminHeaders);

    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.item.status).toBe("inactive");
  });

  it("accepts blank optional fields when creating teachers and students from admin forms", async () => {
    const admin = await createTestUser("Admin");
    const adminHeaders = createAuthHeader(admin, "Admin");

    const teacherResponse = await request(app)
      .post("/api/admin/teachers")
      .set(adminHeaders)
      .send({
        firstName: "Mina",
        lastName: "Clark",
        email: "mina.teacher@school.local",
        staffIdentifier: "",
        password: "",
      });

    expect(teacherResponse.status).toBe(201);
    expect(teacherResponse.body.item).toEqual(
      expect.objectContaining({
        email: "mina.teacher@school.local",
        role: "Teacher",
      }),
    );

    const studentResponse = await request(app)
      .post("/api/admin/students")
      .set(adminHeaders)
      .send({
        firstName: "Nora",
        lastName: "Stone",
        email: "nora.student@school.local",
        studentIdentifier: "",
        password: "",
      });

    expect(studentResponse.status).toBe(201);
    expect(studentResponse.body.item).toEqual(
      expect.objectContaining({
        email: "nora.student@school.local",
        role: "Student",
      }),
    );
  });

  it("blocks non-admin users from admin user routes", async () => {
    const teacher = await createTestUser("Teacher", {
      email: "allowed.teacher@school.local",
    });

    const response = await request(app)
      .get("/api/admin/teachers")
      .set(createAuthHeader(teacher, "Teacher"));

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("ACCESS_DENIED");
  });
});
