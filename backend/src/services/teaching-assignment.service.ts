import { Types } from "mongoose";

import { GradeModel } from "../models/grade.model";
import { SubjectModel } from "../models/subject.model";
import { TeachingAssignmentModel } from "../models/teaching-assignment.model";
import { UserModel } from "../models/user.model";
import { HttpError } from "../utils/http-error";

function mapTeachingAssignment(assignment: any) {
  return {
    id: assignment._id.toString(),
    teacherId:
      assignment.teacherId?._id?.toString() ?? assignment.teacherId?.toString(),
    teacherName: assignment.teacherId
      ? `${assignment.teacherId.firstName} ${assignment.teacherId.lastName}`
      : undefined,
    gradeId:
      assignment.gradeId?._id?.toString() ?? assignment.gradeId?.toString(),
    gradeName: assignment.gradeId
      ? `${assignment.gradeId.name} ${assignment.gradeId.academicYear}`
      : undefined,
    subjectId:
      assignment.subjectId?._id?.toString() ?? assignment.subjectId?.toString(),
    subjectName: assignment.subjectId?.name,
    status: assignment.status,
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt,
  };
}

async function validateAssignmentReferences(input: {
  teacherId: string;
  gradeId: string;
  subjectId: string;
}): Promise<void> {
  const [teacher, grade, subject] = await Promise.all([
    UserModel.findById(input.teacherId).populate("roleId").exec(),
    GradeModel.findById(input.gradeId).exec(),
    SubjectModel.findById(input.subjectId).exec(),
  ]);

  if (!teacher) {
    throw new HttpError(404, "Teacher not found.", "TEACHER_NOT_FOUND");
  }

  const roleName = (teacher.roleId as { name?: string } | undefined)?.name;

  if (roleName !== "Teacher") {
    throw new HttpError(
      400,
      "Assignment requires a teacher account.",
      "INVALID_TEACHER_ROLE",
    );
  }

  if (!grade) {
    throw new HttpError(404, "Grade not found.", "GRADE_NOT_FOUND");
  }

  if (!subject) {
    throw new HttpError(404, "Subject not found.", "SUBJECT_NOT_FOUND");
  }
}

export async function listTeachingAssignments() {
  const records = await TeachingAssignmentModel.find()
    .sort({ createdAt: -1 })
    .populate("teacherId", "firstName lastName email profile.staffIdentifier")
    .populate("gradeId", "name academicYear")
    .populate("subjectId", "name code")
    .exec();

  return records.map(mapTeachingAssignment);
}

export async function createTeachingAssignment(input: {
  teacherId: string;
  gradeId: string;
  subjectId: string;
}) {
  await validateAssignmentReferences(input);

  const duplicate = await TeachingAssignmentModel.findOne({
    teacherId: new Types.ObjectId(input.teacherId),
    gradeId: new Types.ObjectId(input.gradeId),
    subjectId: new Types.ObjectId(input.subjectId),
    status: "active",
  }).exec();

  if (duplicate) {
    throw new HttpError(
      409,
      "Teaching assignment already exists.",
      "ASSIGNMENT_EXISTS",
    );
  }

  const created = await TeachingAssignmentModel.create({
    ...input,
    status: "active",
  });

  const reloaded = await TeachingAssignmentModel.findById(created._id)
    .populate("teacherId", "firstName lastName email profile.staffIdentifier")
    .populate("gradeId", "name academicYear")
    .populate("subjectId", "name code")
    .exec();

  if (!reloaded) {
    throw new HttpError(
      500,
      "Teaching assignment creation failed.",
      "ASSIGNMENT_CREATE_FAILED",
    );
  }

  return mapTeachingAssignment(reloaded);
}

export async function updateTeachingAssignment(
  assignmentId: string,
  input: {
    teacherId?: string;
    gradeId?: string;
    subjectId?: string;
    status?: "active" | "archived";
  },
) {
  const existing = await TeachingAssignmentModel.findById(assignmentId).exec();

  if (!existing) {
    throw new HttpError(
      404,
      "Teaching assignment not found.",
      "ASSIGNMENT_NOT_FOUND",
    );
  }

  const nextTeacherId = input.teacherId ?? existing.teacherId.toString();
  const nextGradeId = input.gradeId ?? existing.gradeId.toString();
  const nextSubjectId = input.subjectId ?? existing.subjectId.toString();

  await validateAssignmentReferences({
    teacherId: nextTeacherId,
    gradeId: nextGradeId,
    subjectId: nextSubjectId,
  });

  const duplicate = await TeachingAssignmentModel.findOne({
    _id: { $ne: existing._id },
    teacherId: new Types.ObjectId(nextTeacherId),
    gradeId: new Types.ObjectId(nextGradeId),
    subjectId: new Types.ObjectId(nextSubjectId),
    status: input.status ?? existing.status,
  }).exec();

  if (duplicate) {
    throw new HttpError(
      409,
      "Teaching assignment already exists.",
      "ASSIGNMENT_EXISTS",
    );
  }

  existing.teacherId = new Types.ObjectId(nextTeacherId);
  existing.gradeId = new Types.ObjectId(nextGradeId);
  existing.subjectId = new Types.ObjectId(nextSubjectId);

  if (input.status) {
    existing.status = input.status;
  }

  await existing.save();

  const reloaded = await TeachingAssignmentModel.findById(existing._id)
    .populate("teacherId", "firstName lastName email profile.staffIdentifier")
    .populate("gradeId", "name academicYear")
    .populate("subjectId", "name code")
    .exec();

  if (!reloaded) {
    throw new HttpError(
      500,
      "Teaching assignment update failed.",
      "ASSIGNMENT_UPDATE_FAILED",
    );
  }

  return mapTeachingAssignment(reloaded);
}

export async function archiveTeachingAssignment(
  assignmentId: string,
): Promise<void> {
  const assignment =
    await TeachingAssignmentModel.findById(assignmentId).exec();

  if (!assignment) {
    throw new HttpError(
      404,
      "Teaching assignment not found.",
      "ASSIGNMENT_NOT_FOUND",
    );
  }

  assignment.status = "archived";
  await assignment.save();
}
