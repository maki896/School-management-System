import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid identifier.");

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue === "" ? undefined : trimmedValue;
};

const optionalTrimmedString = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().min(1).optional(),
);

const optionalPasswordString = z.preprocess(
  emptyStringToUndefined,
  z.string().min(8).optional(),
);

export const teacherCreateSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().email(),
  staffIdentifier: optionalTrimmedString,
  password: optionalPasswordString,
});

export const teacherUpdateSchema = z
  .object({
    firstName: optionalTrimmedString,
    lastName: optionalTrimmedString,
    email: z.string().email().optional(),
    staffIdentifier: optionalTrimmedString,
    status: z.enum(["active", "inactive"]).optional(),
    password: optionalPasswordString,
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one teacher field is required.",
  });

export const studentCreateSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().email(),
  studentIdentifier: optionalTrimmedString,
  password: optionalPasswordString,
});

export const studentUpdateSchema = z
  .object({
    firstName: optionalTrimmedString,
    lastName: optionalTrimmedString,
    email: z.string().email().optional(),
    studentIdentifier: optionalTrimmedString,
    status: z.enum(["active", "inactive"]).optional(),
    password: optionalPasswordString,
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one student field is required.",
  });

export const subjectCreateSchema = z.object({
  name: z.string().trim().min(1),
  code: optionalTrimmedString,
  description: optionalTrimmedString,
});

export const subjectUpdateSchema = z
  .object({
    name: optionalTrimmedString,
    code: optionalTrimmedString,
    description: optionalTrimmedString,
    status: z.enum(["active", "inactive"]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one subject field is required.",
  });

export const gradeCreateSchema = z.object({
  name: z.string().trim().min(1),
  academicYear: z.string().trim().min(1),
});

export const gradeUpdateSchema = z
  .object({
    name: optionalTrimmedString,
    academicYear: optionalTrimmedString,
    status: z.enum(["active", "inactive"]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one grade field is required.",
  });

export const enrollmentCreateSchema = z.object({
  studentId: objectIdSchema,
  gradeId: objectIdSchema,
  subjectId: objectIdSchema,
});

export const enrollmentUpdateSchema = z
  .object({
    studentId: objectIdSchema.optional(),
    gradeId: objectIdSchema.optional(),
    subjectId: objectIdSchema.optional(),
    status: z.enum(["active", "archived"]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one enrollment field is required.",
  });

export const teachingAssignmentCreateSchema = z.object({
  teacherId: objectIdSchema,
  gradeId: objectIdSchema,
  subjectId: objectIdSchema,
});

export const teachingAssignmentUpdateSchema = z
  .object({
    teacherId: objectIdSchema.optional(),
    gradeId: objectIdSchema.optional(),
    subjectId: objectIdSchema.optional(),
    status: z.enum(["active", "archived"]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one teaching assignment field is required.",
  });

export const attendanceCreateSchema = z.object({
  studentId: objectIdSchema,
  gradeId: objectIdSchema,
  subjectId: objectIdSchema.optional(),
  teacherId: objectIdSchema.optional(),
  date: z.string().date(),
  status: z.enum(["present", "absent", "late", "excused"]),
  notes: optionalTrimmedString,
});

export const attendanceUpdateSchema = z
  .object({
    studentId: objectIdSchema.optional(),
    gradeId: objectIdSchema.optional(),
    subjectId: objectIdSchema.optional(),
    teacherId: objectIdSchema.optional(),
    date: z.string().date().optional(),
    status: z.enum(["present", "absent", "late", "excused"]).optional(),
    notes: optionalTrimmedString,
    active: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one attendance field is required.",
  });

export const routeParamsSchema = z.object({
  teacherId: objectIdSchema.optional(),
  studentId: objectIdSchema.optional(),
  subjectId: objectIdSchema.optional(),
  gradeId: objectIdSchema.optional(),
  enrollmentId: objectIdSchema.optional(),
  assignmentId: objectIdSchema.optional(),
  attendanceId: objectIdSchema.optional(),
});

export function parseRouteParams<T extends z.ZodRawShape>(
  value: unknown,
  schema: z.ZodObject<T>,
) {
  return schema.parse(value);
}
