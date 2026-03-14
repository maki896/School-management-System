import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const defaultJwtSecret = "replace-with-a-long-development-secret";

const normalizedString = (minimumLength = 1) =>
  z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : undefined;
  }, z.string().min(minimumLength));

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    MONGODB_URI: normalizedString().default(
      "mongodb://127.0.0.1:27017/school_management_system",
    ),
    JWT_SECRET: normalizedString(16).default(defaultJwtSecret),
    JWT_EXPIRES_IN: normalizedString().default("8h"),
    CLIENT_ORIGIN: normalizedString()
      .pipe(z.string().url())
      .default("http://localhost:4200"),
    SEED_ADMIN_EMAIL: z.string().email().default("admin@school.local"),
    SEED_TEACHER_EMAIL: z.string().email().default("teacher@school.local"),
    SEED_STUDENT_EMAIL: z.string().email().default("student@school.local"),
    SEED_DEFAULT_PASSWORD: normalizedString(8).default("Password123!"),
  })
  .superRefine((value, context) => {
    if (
      value.NODE_ENV === "production" &&
      value.JWT_SECRET === defaultJwtSecret
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_SECRET"],
        message:
          "JWT_SECRET must be overridden in production and cannot use the development default.",
      });
    }
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment configuration: ${parsedEnv.error.message}`,
  );
}

export const env = parsedEnv.data;
