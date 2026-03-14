import { Types } from "mongoose";

import { EnrollmentModel } from "../models/enrollment.model";
import { GradeModel } from "../models/grade.model";
import { SubjectModel } from "../models/subject.model";
import { UserModel } from "../models/user.model";
import { HttpError } from "../utils/http-error";

function enrollmentProjection() {
  return EnrollmentModel.find()
    .populate("studentId", "firstName lastName email profile.studentIdentifier")
    .populate("gradeId", "name academicYear")
    .populate("subjectId", "name code");
}

function formatEnrollment(
  enrollment: Awaited<ReturnType<typeof enrollmentProjection>> extends infer _T
    ? never
    : never,
) {
  return enrollment;
}

type EnrollmentRecord =
  Awaited<ReturnType<typeof enrollmentProjection>> extends {
    [key: string]: unknown;
  }
    ? never
    : never;

function mapEnrollment(enrollment: any) {
  return {
    id: enrollment._id.toString(),
    studentId:
      enrollment.studentId?._id?.toString() ?? enrollment.studentId?.toString(),
    studentName: enrollment.studentId
      ? `${enrollment.studentId.firstName} ${enrollment.studentId.lastName}`
      : undefined,
    gradeId:
      enrollment.gradeId?._id?.toString() ?? enrollment.gradeId?.toString(),
    gradeName: enrollment.gradeId
      ? `${enrollment.gradeId.name} ${enrollment.gradeId.academicYear}`
      : undefined,
    subjectId:
      enrollment.subjectId?._id?.toString() ?? enrollment.subjectId?.toString(),
    subjectName: enrollment.subjectId?.name,
    status: enrollment.status,
    createdAt: enrollment.createdAt,
    updatedAt: enrollment.updatedAt,
  };
}

async function validateEnrollmentReferences(input: {
  studentId: string;
  gradeId: string;
  subjectId: string;
}): Promise<void> {
  const [student, grade, subject] = await Promise.all([
    UserModel.findById(input.studentId).populate("roleId").exec(),
    GradeModel.findById(input.gradeId).exec(),
    SubjectModel.findById(input.subjectId).exec(),
  ]);

  if (!student) {
    throw new HttpError(404, "Student not found.", "STUDENT_NOT_FOUND");
  }

  const roleName = (student.roleId as { name?: string } | undefined)?.name;

  if (roleName !== "Student") {
    throw new HttpError(
      400,
      "Enrollment requires a student account.",
      "INVALID_STUDENT_ROLE",
    );
  }

  if (!grade) {
    throw new HttpError(404, "Grade not found.", "GRADE_NOT_FOUND");
  }

  if (!subject) {
    throw new HttpError(404, "Subject not found.", "SUBJECT_NOT_FOUND");
  }
}

export async function listEnrollments() {
  const records = await EnrollmentModel.find()
    .sort({ createdAt: -1 })
    .populate("studentId", "firstName lastName email profile.studentIdentifier")
    .populate("gradeId", "name academicYear")
    .populate("subjectId", "name code")
    .exec();

  return records.map(mapEnrollment);
}

export async function createEnrollment(input: {
  studentId: string;
  gradeId: string;
  subjectId: string;
}) {
  await validateEnrollmentReferences(input);

  const duplicate = await EnrollmentModel.findOne({
    studentId: new Types.ObjectId(input.studentId),
    gradeId: new Types.ObjectId(input.gradeId),
    subjectId: new Types.ObjectId(input.subjectId),
    status: "active",
  }).exec();

  if (duplicate) {
    throw new HttpError(409, "Enrollment already exists.", "ENROLLMENT_EXISTS");
  }

  const created = await EnrollmentModel.create({
    ...input,
    status: "active",
  });

  const reloaded = await EnrollmentModel.findById(created._id)
    .populate("studentId", "firstName lastName email profile.studentIdentifier")
    .populate("gradeId", "name academicYear")
    .populate("subjectId", "name code")
    .exec();

  if (!reloaded) {
    throw new HttpError(
      500,
      "Enrollment creation failed.",
      "ENROLLMENT_CREATE_FAILED",
    );
  }

  return mapEnrollment(reloaded);
}

export async function updateEnrollment(
  enrollmentId: string,
  input: {
    studentId?: string;
    gradeId?: string;
    subjectId?: string;
    status?: "active" | "archived";
  },
) {
  const existing = await EnrollmentModel.findById(enrollmentId).exec();

  if (!existing) {
    throw new HttpError(404, "Enrollment not found.", "ENROLLMENT_NOT_FOUND");
  }

  const nextStudentId = input.studentId ?? existing.studentId.toString();
  const nextGradeId = input.gradeId ?? existing.gradeId.toString();
  const nextSubjectId = input.subjectId ?? existing.subjectId.toString();

  await validateEnrollmentReferences({
    studentId: nextStudentId,
    gradeId: nextGradeId,
    subjectId: nextSubjectId,
  });

  const duplicate = await EnrollmentModel.findOne({
    _id: { $ne: existing._id },
    studentId: new Types.ObjectId(nextStudentId),
    gradeId: new Types.ObjectId(nextGradeId),
    subjectId: new Types.ObjectId(nextSubjectId),
    status: input.status ?? existing.status,
  }).exec();

  if (duplicate) {
    throw new HttpError(409, "Enrollment already exists.", "ENROLLMENT_EXISTS");
  }

  existing.studentId = new Types.ObjectId(nextStudentId);
  existing.gradeId = new Types.ObjectId(nextGradeId);
  existing.subjectId = new Types.ObjectId(nextSubjectId);

  if (input.status) {
    existing.status = input.status;
  }

  await existing.save();

  const reloaded = await EnrollmentModel.findById(existing._id)
    .populate("studentId", "firstName lastName email profile.studentIdentifier")
    .populate("gradeId", "name academicYear")
    .populate("subjectId", "name code")
    .exec();

  if (!reloaded) {
    throw new HttpError(
      500,
      "Enrollment update failed.",
      "ENROLLMENT_UPDATE_FAILED",
    );
  }

  return mapEnrollment(reloaded);
}

export async function archiveEnrollment(enrollmentId: string): Promise<void> {
  const enrollment = await EnrollmentModel.findById(enrollmentId).exec();

  if (!enrollment) {
    throw new HttpError(404, "Enrollment not found.", "ENROLLMENT_NOT_FOUND");
  }

  enrollment.status = "archived";
  await enrollment.save();
}
