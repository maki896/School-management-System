import { Types } from "mongoose";

import { env } from "../config/env";
import { RoleModel } from "../models/role.model";
import { UserModel } from "../models/user.model";
import {
  routeParamsSchema,
  studentCreateSchema,
  studentUpdateSchema,
  teacherCreateSchema,
  teacherUpdateSchema,
} from "../validators/admin.validators";
import { hashPassword } from "../services/auth.service";
import { asyncHandler } from "../utils/async-handler";
import { HttpError } from "../utils/http-error";

function mapUser(user: any) {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: (user.roleId as { name?: string } | undefined)?.name,
    status: user.status,
    staffIdentifier: user.profile?.staffIdentifier,
    studentIdentifier: user.profile?.studentIdentifier,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function resolveRole(roleName: "Teacher" | "Student") {
  const role = await RoleModel.findOne({ name: roleName }).exec();

  if (!role) {
    throw new HttpError(
      500,
      `${roleName} role is not configured.`,
      "ROLE_NOT_FOUND",
    );
  }

  return role;
}

async function listUsersByRole(roleName: "Teacher" | "Student") {
  const role = await resolveRole(roleName);

  const users = await UserModel.find({ roleId: role._id })
    .sort({ createdAt: -1 })
    .populate("roleId")
    .exec();

  return users.map(mapUser);
}

async function getUserByRole(id: string, roleName: "Teacher" | "Student") {
  const role = await resolveRole(roleName);

  const user = (await UserModel.findById(id).populate("roleId").exec()) as any;

  if (
    !user ||
    (user.roleId?._id?.toString?.() ?? user.roleId?.toString?.()) !==
      role._id.toString()
  ) {
    throw new HttpError(404, `${roleName} not found.`, "USER_NOT_FOUND");
  }

  return user;
}

async function ensureUniqueEmail(email: string, excludeUserId?: string) {
  const query: Record<string, unknown> = { email: email.toLowerCase() };

  if (excludeUserId) {
    query._id = { $ne: new Types.ObjectId(excludeUserId) };
  }

  const existing = await UserModel.findOne(query).exec();

  if (existing) {
    throw new HttpError(
      409,
      "Email address is already in use.",
      "EMAIL_EXISTS",
    );
  }
}

async function createUser(
  roleName: "Teacher" | "Student",
  input: {
    firstName: string;
    lastName: string;
    email: string;
    staffIdentifier?: string;
    studentIdentifier?: string;
    password?: string;
  },
) {
  await ensureUniqueEmail(input.email);
  const role = await resolveRole(roleName);

  const created = new UserModel({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email.toLowerCase(),
    passwordHash: await hashPassword(
      input.password ?? env.SEED_DEFAULT_PASSWORD,
    ),
    roleId: role._id,
    status: "active",
    profile: {
      staffIdentifier: input.staffIdentifier,
      studentIdentifier: input.studentIdentifier,
    },
  });

  await created.save();

  const reloaded = await UserModel.findById(created._id)
    .populate("roleId")
    .exec();

  if (!reloaded) {
    throw new HttpError(500, "User creation failed.", "USER_CREATE_FAILED");
  }

  return mapUser(reloaded);
}

async function updateUser(
  userId: string,
  roleName: "Teacher" | "Student",
  input: {
    firstName?: string;
    lastName?: string;
    email?: string;
    staffIdentifier?: string;
    studentIdentifier?: string;
    status?: "active" | "inactive";
    password?: string;
  },
) {
  const user = (await getUserByRole(userId, roleName)) as any;

  if (input.email) {
    await ensureUniqueEmail(input.email, user._id.toString());
    user.email = input.email.toLowerCase();
  }

  if (input.firstName) {
    user.firstName = input.firstName;
  }

  if (input.lastName) {
    user.lastName = input.lastName;
  }

  if (typeof input.status !== "undefined") {
    user.status = input.status;
  }

  if (typeof input.staffIdentifier !== "undefined") {
    user.profile = {
      ...user.profile,
      staffIdentifier: input.staffIdentifier,
    };
  }

  if (typeof input.studentIdentifier !== "undefined") {
    user.profile = {
      ...user.profile,
      studentIdentifier: input.studentIdentifier,
    };
  }

  if (input.password) {
    user.passwordHash = await hashPassword(input.password);
  }

  await user.save();

  const reloaded = await UserModel.findById(user._id).populate("roleId").exec();

  if (!reloaded) {
    throw new HttpError(500, "User update failed.", "USER_UPDATE_FAILED");
  }

  return mapUser(reloaded);
}

export const listTeachersController = asyncHandler(
  async (_request, response) => {
    response.status(200).json({ items: await listUsersByRole("Teacher") });
  },
);

export const createTeacherController = asyncHandler(
  async (request, response) => {
    const payload = teacherCreateSchema.parse(request.body);
    response.status(201).json({ item: await createUser("Teacher", payload) });
  },
);

export const getTeacherController = asyncHandler(async (request, response) => {
  const { teacherId } = routeParamsSchema.parse(request.params);
  const teacher = await getUserByRole(teacherId as string, "Teacher");
  response.status(200).json({ item: mapUser(teacher) });
});

export const updateTeacherController = asyncHandler(
  async (request, response) => {
    const { teacherId } = routeParamsSchema.parse(request.params);
    const payload = teacherUpdateSchema.parse(request.body);
    response
      .status(200)
      .json({
        item: await updateUser(teacherId as string, "Teacher", payload),
      });
  },
);

export const deleteTeacherController = asyncHandler(
  async (request, response) => {
    const { teacherId } = routeParamsSchema.parse(request.params);
    await updateUser(teacherId as string, "Teacher", { status: "inactive" });
    response.status(204).send();
  },
);

export const listStudentsController = asyncHandler(
  async (_request, response) => {
    response.status(200).json({ items: await listUsersByRole("Student") });
  },
);

export const createStudentController = asyncHandler(
  async (request, response) => {
    const payload = studentCreateSchema.parse(request.body);
    response.status(201).json({ item: await createUser("Student", payload) });
  },
);

export const getStudentController = asyncHandler(async (request, response) => {
  const { studentId } = routeParamsSchema.parse(request.params);
  const student = await getUserByRole(studentId as string, "Student");
  response.status(200).json({ item: mapUser(student) });
});

export const updateStudentController = asyncHandler(
  async (request, response) => {
    const { studentId } = routeParamsSchema.parse(request.params);
    const payload = studentUpdateSchema.parse(request.body);
    response
      .status(200)
      .json({
        item: await updateUser(studentId as string, "Student", payload),
      });
  },
);

export const deleteStudentController = asyncHandler(
  async (request, response) => {
    const { studentId } = routeParamsSchema.parse(request.params);
    await updateUser(studentId as string, "Student", { status: "inactive" });
    response.status(204).send();
  },
);
