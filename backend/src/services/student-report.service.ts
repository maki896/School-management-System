import { Types } from "mongoose";

import { AttendanceRecordModel } from "../models/attendance-record.model";
import { EnrollmentModel } from "../models/enrollment.model";
import { GradeModel } from "../models/grade.model";
import { MarkModel } from "../models/mark.model";
import { UserModel } from "../models/user.model";
import { HttpError } from "../utils/http-error";

function mapStudent(student: any) {
  return {
    id: student._id.toString(),
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    role: "Student",
    status: student.status,
    studentIdentifier: student.profile?.studentIdentifier,
  };
}

function mapGrade(grade: any) {
  return {
    id: grade._id.toString(),
    name: grade.name,
    academicYear: grade.academicYear,
    status: grade.status,
  };
}

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

export async function listStudentMarks(studentId: string) {
  const marks = await MarkModel.find({
    studentId: new Types.ObjectId(studentId),
    status: "published",
  })
    .sort({ recordedAt: -1, updatedAt: -1 })
    .populate("studentId", "firstName lastName")
    .populate("subjectId", "name code")
    .populate("gradeId", "name academicYear status")
    .populate("teacherId", "firstName lastName")
    .exec();

  return marks.map(mapMark);
}

export async function listStudentAttendance(studentId: string) {
  const attendance = await AttendanceRecordModel.find({
    studentId: new Types.ObjectId(studentId),
    active: true,
  })
    .sort({ date: -1, updatedAt: -1 })
    .populate("studentId", "firstName lastName")
    .populate("subjectId", "name code")
    .populate("gradeId", "name academicYear status")
    .populate("teacherId", "firstName lastName")
    .exec();

  return attendance.map(mapAttendance);
}

async function resolveStudentGrade(studentId: string) {
  const activeEnrollment = await EnrollmentModel.findOne({
    studentId: new Types.ObjectId(studentId),
    status: "active",
  })
    .sort({ createdAt: -1 })
    .populate("gradeId", "name academicYear status")
    .exec();

  if (
    activeEnrollment?.gradeId &&
    typeof activeEnrollment.gradeId === "object"
  ) {
    return mapGrade(activeEnrollment.gradeId);
  }

  const mark = await MarkModel.findOne({
    studentId: new Types.ObjectId(studentId),
  })
    .sort({ recordedAt: -1 })
    .populate("gradeId", "name academicYear status")
    .exec();

  if (mark?.gradeId && typeof mark.gradeId === "object") {
    return mapGrade(mark.gradeId);
  }

  const attendance = await AttendanceRecordModel.findOne({
    studentId: new Types.ObjectId(studentId),
  })
    .sort({ date: -1 })
    .populate("gradeId", "name academicYear status")
    .exec();

  if (attendance?.gradeId && typeof attendance.gradeId === "object") {
    return mapGrade(attendance.gradeId);
  }

  return null;
}

export async function getStudentReport(studentId: string) {
  const student = await UserModel.findById(studentId).populate("roleId").exec();

  if (!student) {
    throw new HttpError(404, "Student not found.", "STUDENT_NOT_FOUND");
  }

  if ((student.roleId as { name?: string } | undefined)?.name !== "Student") {
    throw new HttpError(
      403,
      "Only students can access student reports.",
      "STUDENT_ACCESS_REQUIRED",
    );
  }

  const [marks, attendance, grade] = await Promise.all([
    listStudentMarks(studentId),
    listStudentAttendance(studentId),
    resolveStudentGrade(studentId),
  ]);

  return {
    student: mapStudent(student),
    grade,
    marks,
    attendance,
  };
}
