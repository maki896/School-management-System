import { Types } from "mongoose";

import { AttendanceRecordModel } from "../models/attendance-record.model";
import { GradeModel } from "../models/grade.model";
import { SubjectModel } from "../models/subject.model";
import { UserModel } from "../models/user.model";
import { HttpError } from "../utils/http-error";

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
    teacherName: record.teacherId
      ? `${record.teacherId.firstName} ${record.teacherId.lastName}`
      : undefined,
    date:
      record.date instanceof Date
        ? record.date.toISOString().slice(0, 10)
        : record.date,
    status: record.status,
    notes: record.notes,
    active: record.active,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

async function validateAttendanceReferences(input: {
  studentId: string;
  gradeId: string;
  subjectId?: string;
  teacherId?: string;
}): Promise<void> {
  const [student, grade, subject, teacher] = await Promise.all([
    UserModel.findById(input.studentId).populate("roleId").exec(),
    GradeModel.findById(input.gradeId).exec(),
    input.subjectId
      ? SubjectModel.findById(input.subjectId).exec()
      : Promise.resolve(null),
    input.teacherId
      ? UserModel.findById(input.teacherId).populate("roleId").exec()
      : Promise.resolve(null),
  ]);

  if (!student) {
    throw new HttpError(404, "Student not found.", "STUDENT_NOT_FOUND");
  }

  if ((student.roleId as { name?: string } | undefined)?.name !== "Student") {
    throw new HttpError(
      400,
      "Attendance requires a student account.",
      "INVALID_STUDENT_ROLE",
    );
  }

  if (!grade) {
    throw new HttpError(404, "Grade not found.", "GRADE_NOT_FOUND");
  }

  if (input.subjectId && !subject) {
    throw new HttpError(404, "Subject not found.", "SUBJECT_NOT_FOUND");
  }

  if (input.teacherId && !teacher) {
    throw new HttpError(404, "Teacher not found.", "TEACHER_NOT_FOUND");
  }

  if (
    teacher &&
    (teacher.roleId as { name?: string } | undefined)?.name !== "Teacher"
  ) {
    throw new HttpError(
      400,
      "Attendance teacher must be a teacher account.",
      "INVALID_TEACHER_ROLE",
    );
  }
}

export async function listAttendanceRecords() {
  const records = await AttendanceRecordModel.find()
    .sort({ date: -1, createdAt: -1 })
    .populate("studentId", "firstName lastName email profile.studentIdentifier")
    .populate("gradeId", "name academicYear")
    .populate("subjectId", "name code")
    .populate("teacherId", "firstName lastName email profile.staffIdentifier")
    .exec();

  return records.map(mapAttendance);
}

export async function getAttendanceRecord(attendanceId: string) {
  const record = await AttendanceRecordModel.findById(attendanceId)
    .populate("studentId", "firstName lastName email profile.studentIdentifier")
    .populate("gradeId", "name academicYear")
    .populate("subjectId", "name code")
    .populate("teacherId", "firstName lastName email profile.staffIdentifier")
    .exec();

  if (!record) {
    throw new HttpError(
      404,
      "Attendance record not found.",
      "ATTENDANCE_NOT_FOUND",
    );
  }

  return mapAttendance(record);
}

export async function createAttendanceRecord(input: {
  studentId: string;
  gradeId: string;
  subjectId?: string;
  teacherId?: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  notes?: string;
}) {
  await validateAttendanceReferences(input);

  const duplicate = await AttendanceRecordModel.findOne({
    studentId: new Types.ObjectId(input.studentId),
    gradeId: new Types.ObjectId(input.gradeId),
    subjectId: input.subjectId ? new Types.ObjectId(input.subjectId) : null,
    date: new Date(input.date),
    active: true,
  }).exec();

  if (duplicate) {
    throw new HttpError(
      409,
      "Attendance record already exists.",
      "ATTENDANCE_EXISTS",
    );
  }

  const created = await AttendanceRecordModel.create({
    ...input,
    date: new Date(input.date),
    studentId: new Types.ObjectId(input.studentId),
    gradeId: new Types.ObjectId(input.gradeId),
    subjectId: input.subjectId
      ? new Types.ObjectId(input.subjectId)
      : undefined,
    teacherId: input.teacherId
      ? new Types.ObjectId(input.teacherId)
      : undefined,
    active: true,
  });

  return getAttendanceRecord(created._id.toString());
}

export async function updateAttendanceRecord(
  attendanceId: string,
  input: {
    studentId?: string;
    gradeId?: string;
    subjectId?: string;
    teacherId?: string;
    date?: string;
    status?: "present" | "absent" | "late" | "excused";
    notes?: string;
    active?: boolean;
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

  const nextPayload = {
    studentId: input.studentId ?? record.studentId.toString(),
    gradeId: input.gradeId ?? record.gradeId.toString(),
    subjectId:
      input.subjectId ??
      (record.subjectId ? record.subjectId.toString() : undefined),
    teacherId:
      input.teacherId ??
      (record.teacherId ? record.teacherId.toString() : undefined),
  };

  await validateAttendanceReferences(nextPayload);

  record.studentId = new Types.ObjectId(nextPayload.studentId);
  record.gradeId = new Types.ObjectId(nextPayload.gradeId);
  record.subjectId = nextPayload.subjectId
    ? new Types.ObjectId(nextPayload.subjectId)
    : undefined;
  record.teacherId = nextPayload.teacherId
    ? new Types.ObjectId(nextPayload.teacherId)
    : undefined;

  if (input.date) {
    record.date = new Date(input.date);
  }

  if (input.status) {
    record.status = input.status;
  }

  if (typeof input.notes !== "undefined") {
    record.notes = input.notes;
  }

  if (typeof input.active === "boolean") {
    record.active = input.active;
  }

  await record.save();

  return getAttendanceRecord(record._id.toString());
}

export async function deactivateAttendanceRecord(
  attendanceId: string,
): Promise<void> {
  const record = await AttendanceRecordModel.findById(attendanceId).exec();

  if (!record) {
    throw new HttpError(
      404,
      "Attendance record not found.",
      "ATTENDANCE_NOT_FOUND",
    );
  }

  record.active = false;
  await record.save();
}
