import { z } from "zod";

import { authenticateUser, registerUser } from "../services/auth.service";
import { asyncHandler } from "../utils/async-handler";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["Admin", "Teacher", "Student"]),
});

export const loginController = asyncHandler(async (request, response) => {
  const payload = loginSchema.parse(request.body);
  const result = await authenticateUser(payload);

  response.status(200).json(result);
});

export const registerController = asyncHandler(async (request, response) => {
  const payload = registerSchema.parse(request.body);
  const result = await registerUser(payload);



  response.status(201).json(result);
});

