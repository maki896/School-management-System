import { Types } from "mongoose";

import { MarkModel } from "../models/mark.model";
import { HttpError } from "../utils/http-error";
import {
  assertTeacherStudentScope,
  listTeacherMarks,
} from "./teacher-dashboard.service";

function mapMark(mark: any) {
  return {
    id: mark._id.toString(),
    studentId: mark.studentId?._id?.toString() ?? mark.studentId?.toString(),
    studentName: mark.studentId
      ? `${mark.studentId.firstName} ${mark.studentId.lastName}`
      : undefined,
    subjectId: mark.subjectId?._id?.toString() ?? mark.subjectId?.toString(),
    subjectName: mark.subjectId?.name,
    gradeId: mark.gradeId?._id?.toString() ?? mark.gradeId?.toString(),
    gradeName: mark.gradeId
      ? `${mark.gradeId.name} ${mark.gradeId.academicYear}`
      : undefined,
    teacherId: mark.teacherId?._id?.toString() ?? mark.teacherId?.toString(),
    assessmentType: mark.assessmentType,
    score: mark.score,
    maxScore: mark.maxScore,
    term: mark.term,
    status: mark.status,
    recordedAt: mark.recordedAt,
  };
}

export { listTeacherMarks };

export async function createTeacherMark(
  teacherId: string,
  input: {
    studentId: string;
    subjectId: string;
    gradeId: string;
    assessmentType: string;
    score: number;
    maxScore: number;
    term: string;
    status: "draft" | "published";
  },
) {
  await assertTeacherStudentScope({
    teacherId,
    studentId: input.studentId,
    gradeId: input.gradeId,
    subjectId: input.subjectId,
  });

  const created = await MarkModel.create({
    ...input,
    teacherId: new Types.ObjectId(teacherId),
    studentId: new Types.ObjectId(input.studentId),
    subjectId: new Types.ObjectId(input.subjectId),
    gradeId: new Types.ObjectId(input.gradeId),
  });

  const reloaded = await MarkModel.findById(created._id)
    .populate("studentId", "firstName lastName")
    .populate("subjectId", "name code")
    .populate("gradeId", "name academicYear")
    .populate("teacherId", "firstName lastName")
    .exec();

  if (!reloaded) {
    throw new HttpError(500, "Mark creation failed.", "MARK_CREATE_FAILED");
  }

  return mapMark(reloaded);
}

export async function updateTeacherMark(
  teacherId: string,
  markId: string,
  input: {
    assessmentType?: string;
    score?: number;
    maxScore?: number;
    term?: string;
    status?: "draft" | "published";
  },
) {
  const mark = await MarkModel.findById(markId).exec();

  if (!mark) {
    throw new HttpError(404, "Mark not found.", "MARK_NOT_FOUND");
  }

  await assertTeacherStudentScope({
    teacherId,
    studentId: mark.studentId.toString(),
    gradeId: mark.gradeId.toString(),
    subjectId: mark.subjectId.toString(),
  });

  if (typeof input.assessmentType !== "undefined") {
    mark.assessmentType = input.assessmentType;
  }
  if (typeof input.score !== "undefined") {
    mark.score = input.score;
  }
  if (typeof input.maxScore !== "undefined") {
    mark.maxScore = input.maxScore;
  }
  if (typeof input.term !== "undefined") {
    mark.term = input.term;
  }
  if (typeof input.status !== "undefined") {
    mark.status = input.status;
  }

  await mark.save();

  const reloaded = await MarkModel.findById(mark._id)
    .populate("studentId", "firstName lastName")
    .populate("subjectId", "name code")
    .populate("gradeId", "name academicYear")
    .populate("teacherId", "firstName lastName")
    .exec();

  if (!reloaded) {
    throw new HttpError(500, "Mark update failed.", "MARK_UPDATE_FAILED");
  }

  return mapMark(reloaded);
}
