import { Types } from "mongoose";

import { AttendanceRecordModel } from "../models/attendance-record.model";
import { HttpError } from "../utils/http-error";
import {
  assertTeacherStudentScope,
  listTeacherAttendance,
} from "./teacher-dashboard.service";

function mapAttendance(record: any) {
  return {
    id: record._id.toString(),
    studentId:
      record.studentId?._id?.toString() ?? record.studentId?.toString(),
    studentName: record.studentId
      ? `${record.studentId.firstName} ${record.studentId.lastName}`
      : undefined,
    gradeId: record.gradeId?._id?.toString() ?? record.gradeId?.toString(),
    gradeName: record.gradeId
      ? `${record.gradeId.name} ${record.gradeId.academicYear}`
      : undefined,
    subjectId:
      record.subjectId?._id?.toString() ?? record.subjectId?.toString(),
    subjectName: record.subjectId?.name,
    teacherId:
      record.teacherId?._id?.toString() ?? record.teacherId?.toString(),
    date:
      record.date instanceof Date
        ? record.date.toISOString().slice(0, 10)
        : record.date,
    status: record.status,
    notes: record.notes,
    active: record.active,
  };
}

export { listTeacherAttendance };

export async function createTeacherAttendance(
  teacherId: string,
  input: {
    studentId: string;
    gradeId: string;
    subjectId: string;
    date: string;
    status: "present" | "absent" | "late" | "excused";
    notes?: string;
  },
) {
  await assertTeacherStudentScope({
    teacherId,
    studentId: input.studentId,
    gradeId: input.gradeId,
    subjectId: input.subjectId,
  });

  const duplicate = await AttendanceRecordModel.findOne({
    studentId: new Types.ObjectId(input.studentId),
    gradeId: new Types.ObjectId(input.gradeId),
    subjectId: new Types.ObjectId(input.subjectId),
    date: new Date(input.date),
  }).exec();

  if (duplicate) {
    throw new HttpError(
      409,
      "Attendance record already exists.",
      "ATTENDANCE_EXISTS",
    );
  }

  const created = await AttendanceRecordModel.create({
    studentId: new Types.ObjectId(input.studentId),
    gradeId: new Types.ObjectId(input.gradeId),
    subjectId: new Types.ObjectId(input.subjectId),
    teacherId: new Types.ObjectId(teacherId),
    date: new Date(input.date),
    status: input.status,
    notes: input.notes,
    active: true,
  });

  const reloaded = await AttendanceRecordModel.findById(created._id)
    .populate("studentId", "firstName lastName")
    .populate("subjectId", "name code")
    .populate("gradeId", "name academicYear")
    .populate("teacherId", "firstName lastName")
    .exec();

  if (!reloaded) {
    throw new HttpError(
      500,
      "Attendance creation failed.",
      "ATTENDANCE_CREATE_FAILED",
    );
  }

  return mapAttendance(reloaded);
}

export async function updateTeacherAttendance(
  teacherId: string,
  attendanceId: string,
  input: {
    date?: string;
    status?: "present" | "absent" | "late" | "excused";
    notes?: string;
  },
) {
  const record = await AttendanceRecordModel.findById(attendanceId).exec();

  if (!record) {
    throw new HttpError(
      404,
      "Attendance record not found.",
      "ATTENDANCE_NOT_FOUND",
    );
  }

  await assertTeacherStudentScope({
    teacherId,
    studentId: record.studentId.toString(),
    gradeId: record.gradeId.toString(),
    subjectId: record.subjectId?.toString() ?? "",
  });

  if (typeof input.date !== "undefined") {
    record.date = new Date(input.date);
  }
  if (typeof input.status !== "undefined") {
    record.status = input.status;
  }
  if (typeof input.notes !== "undefined") {
    record.notes = input.notes;
  }
  record.teacherId = new Types.ObjectId(teacherId);

  await record.save();

  const reloaded = await AttendanceRecordModel.findById(record._id)
    .populate("studentId", "firstName lastName")
    .populate("subjectId", "name code")
    .populate("gradeId", "name academicYear")
    .populate("teacherId", "firstName lastName")
    .exec();

  if (!reloaded) {
    throw new HttpError(
      500,
      "Attendance update failed.",
      "ATTENDANCE_UPDATE_FAILED",
    );
  }

  return mapAttendance(reloaded);
}
