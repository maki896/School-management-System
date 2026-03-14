import fs from "node:fs";
import path from "node:path";

import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import { env } from "../../src/config/env";
import type { RoleName } from "../../src/constants/roles";
import { GradeModel } from "../../src/models/grade.model";
import { RoleModel } from "../../src/models/role.model";
import { SubjectModel } from "../../src/models/subject.model";
import { UserModel } from "../../src/models/user.model";
import { hashPassword, seedRoles } from "../../src/services/auth.service";

let mongoServer: MongoMemoryServer | null = null;

export async function startIntegrationDatabase(): Promise<void> {
  process.env.MONGOMS_MD5_CHECK = "0";

  const cachedBinaryPath = path.join(
    process.env.USERPROFILE ?? "",
    ".cache",
    "mongodb-binaries",
    "mongod-x64-win32-7.0.14.exe",
  );

  const binary = fs.existsSync(cachedBinaryPath)
    ? {
        version: "7.0.14",
        systemBinary: cachedBinaryPath,
      }
    : {
        version: "7.0.14",
      };

  mongoServer ??= await MongoMemoryServer.create({
    binary,
  });

  await mongoose.disconnect();
  await mongoose.connect(mongoServer.getUri());
}

export async function stopIntegrationDatabase(): Promise<void> {
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}

export async function resetIntegrationDatabase(): Promise<void> {
  const { collections } = mongoose.connection;

  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );

  await seedRoles();
}

export async function createTestUser(
  role: RoleName,
  overrides: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    staffIdentifier: string;
    studentIdentifier: string;
    status: "active" | "inactive";
  }> = {},
) {
  const roleRecord = await RoleModel.findOne({ name: role }).exec();

  if (!roleRecord) {
    throw new Error(`Role ${role} not found in test database.`);
  }

  const emailPrefix = role.toLowerCase();
  const user = new UserModel({
    firstName: overrides.firstName ?? `${role}First`,
    lastName: overrides.lastName ?? `${role}Last`,
    email: overrides.email ?? `${emailPrefix}.${Date.now()}@school.local`,
    passwordHash: await hashPassword(
      overrides.password ?? env.SEED_DEFAULT_PASSWORD,
    ),
    roleId: roleRecord._id,
    status: overrides.status ?? "active",
    profile: {
      staffIdentifier: overrides.staffIdentifier,
      studentIdentifier: overrides.studentIdentifier,
    },
  });

  await user.save();

  return user;
}

export function createAuthHeader(
  user: { _id: { toString(): string }; email: string },
  role: RoleName,
) {
  const token = jwt.sign(
    { sub: user._id.toString(), role, email: user.email },
    env.JWT_SECRET,
    { expiresIn: "8h" },
  );

  return { Authorization: `Bearer ${token}` };
}

export async function createGradeAndSubject() {
  const grade = await GradeModel.create({
    name: `Grade ${Date.now()}`,
    academicYear: "2026",
    status: "active",
  });

  const subject = await SubjectModel.create({
    name: `Science ${Date.now()}`,
    code: `SCI-${Math.floor(Math.random() * 10000)}`,
    description: "Integration test subject",
    status: "active",
  });

  return { grade, subject };
}
