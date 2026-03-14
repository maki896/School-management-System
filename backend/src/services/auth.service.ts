import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import type { RoleName } from "../constants/roles";
import { ROLE_PERMISSIONS } from "../constants/roles";
import { RoleModel } from "../models/role.model";
import { UserModel } from "../models/user.model";
import { HttpError } from "../utils/http-error";

export interface AuthUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: RoleName;
  status: "active" | "inactive";
}

export interface AuthResult {
  accessToken: string;
  user: AuthUserSummary;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: RoleName;
}


export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function seedRoles(): Promise<void> {
  const existingRoles = await RoleModel.countDocuments().exec();

  if (existingRoles > 0) {
    return;
  }

  await RoleModel.insertMany(
    Object.entries(ROLE_PERMISSIONS).map(([name, permissions]) => ({
      name,
      permissions,
    })),
  );
}

export async function authenticateUser(input: LoginInput): Promise<AuthResult> {
  const user = await UserModel.findOne({ email: input.email.toLowerCase() })
    .populate("roleId")
    .exec();

  if (!user) {
    throw new HttpError(
      401,
      "Invalid email or password.",
      "INVALID_CREDENTIALS",
    );
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches || user.status !== "active") {
    throw new HttpError(
      401,
      "Invalid email or password.",
      "INVALID_CREDENTIALS",
    );
  }

  const populatedRole = user.roleId as { name?: RoleName } | undefined;
  const role = populatedRole?.name;

  if (!role) {
    throw new HttpError(
      500,
      "User role is not configured correctly.",
      "ROLE_NOT_FOUND",
    );
  }

  const accessToken = jwt.sign(
    {
      sub: user._id.toString(),
      role,
      email: user.email,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    },
  );

  return {
    accessToken,
    user: {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role,
      status: user.status,
    },
  };
}
export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const existing = await UserModel.findOne({ email: input.email.toLowerCase() }).exec();

  if (existing) {
    throw new HttpError(409, "Email address is already in use.", "EMAIL_EXISTS");
  }

  const role = await RoleModel.findOne({ name: input.role }).exec();

  if (!role) {
    throw new HttpError(500, "Role configuration error.", "ROLE_NOT_FOUND");
  }

  const user = new UserModel({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email.toLowerCase(),
    passwordHash: await hashPassword(input.password),
    roleId: role._id,
    status: "active",
  });

  await user.save();

  return authenticateUser({ email: input.email, password: input.password });
}
