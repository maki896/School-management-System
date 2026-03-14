import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid identifier.");

export const teacherMarkCreateSchema = z.object({
  studentId: objectIdSchema,
  subjectId: objectIdSchema,
  gradeId: objectIdSchema,
  assessmentType: z.string().trim().min(1),
  score: z.number().min(0),
  maxScore: z.number().positive().default(100),
  term: z.string().trim().min(1),
  status: z.enum(["draft", "published"]).default("published"),
});

export const teacherMarkUpdateSchema = z
  .object({
    assessmentType: z.string().trim().min(1).optional(),
    score: z.number().min(0).optional(),
    maxScore: z.number().positive().optional(),
    term: z.string().trim().min(1).optional(),
    status: z.enum(["draft", "published"]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one mark field is required.",
  });

export const teacherAttendanceCreateSchema = z.object({
  studentId: objectIdSchema,
  gradeId: objectIdSchema,
  subjectId: objectIdSchema,
  date: z.string().date(),
  status: z.enum(["present", "absent", "late", "excused"]),
  notes: z.string().trim().min(1).optional(),
});

export const teacherAttendanceUpdateSchema = z
  .object({
    date: z.string().date().optional(),
    status: z.enum(["present", "absent", "late", "excused"]).optional(),
    notes: z.string().trim().min(1).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one attendance field is required.",
  });

export const teacherRouteParamsSchema = z.object({
  markId: objectIdSchema.optional(),
  attendanceId: objectIdSchema.optional(),
});
