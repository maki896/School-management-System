import { Types } from "mongoose";

import { AttendanceRecordModel } from "../models/attendance-record.model";
import { EnrollmentModel } from "../models/enrollment.model";
import { MarkModel } from "../models/mark.model";
import { TeachingAssignmentModel } from "../models/teaching-assignment.model";
import { UserModel } from "../models/user.model";
import { HttpError } from "../utils/http-error";

function buildScopeKey(gradeId: string, subjectId: string): string {
  return `${gradeId}:${subjectId}`;
}

function mapAssignment(assignment: any) {
  return {
    id: assignment._id.toString(),
    teacherId:
      assignment.teacherId?._id?.toString() ?? assignment.teacherId?.toString(),
    gradeId:
      assignment.gradeId?._id?.toString() ?? assignment.gradeId?.toString(),
    gradeName: assignment.gradeId
      ? `${assignment.gradeId.name} ${assignment.gradeId.academicYear}`
      : undefined,
    subjectId:
      assignment.subjectId?._id?.toString() ?? assignment.subjectId?.toString(),
    subjectName: assignment.subjectId?.name,
    status: assignment.status,
  };
}

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

export async function listTeacherAssignments(teacherId: string) {
  const assignments = await TeachingAssignmentModel.find({
    teacherId: new Types.ObjectId(teacherId),
    status: "active",
  })
    .populate("teacherId", "firstName lastName")
    .populate("gradeId", "name academicYear")
    .populate("subjectId", "name code")
    .exec();

  return assignments.map(mapAssignment);
}

export async function listAssignedStudents(teacherId: string) {
  const assignments = await TeachingAssignmentModel.find({
    teacherId: new Types.ObjectId(teacherId),
    status: "active",
  }).exec();

  if (assignments.length === 0) {
    return [];
  }

  const assignmentScope = new Set(
    assignments.map((assignment) =>
      buildScopeKey(
        assignment.gradeId.toString(),
        assignment.subjectId.toString(),
      ),
    ),
  );

  const enrollments = await EnrollmentModel.find({ status: "active" }).exec();
  const studentIds = Array.from(
    new Set(
      enrollments
        .filter((enrollment) =>
          assignmentScope.has(
            buildScopeKey(
              enrollment.gradeId.toString(),
              enrollment.subjectId.toString(),
            ),
          ),
        )
        .map((enrollment) => enrollment.studentId.toString()),
    ),
  );

  if (studentIds.length === 0) {
    return [];
  }

  const students = await Promise.all(
    studentIds.map((studentId) => UserModel.findById(studentId).exec()),
  );
  return students
    .filter((student): student is NonNullable<typeof student> =>
      Boolean(student),
    )
    .map(mapStudent);
}

export async function assertTeacherStudentScope(input: {
  teacherId: string;
  studentId: string;
  gradeId: string;
  subjectId: string;
}): Promise<void> {
  const [assignment, enrollment, student] = await Promise.all([
    TeachingAssignmentModel.findOne({
      teacherId: new Types.ObjectId(input.teacherId),
      gradeId: new Types.ObjectId(input.gradeId),
      subjectId: new Types.ObjectId(input.subjectId),
      status: "active",
    }).exec(),
    EnrollmentModel.findOne({
      studentId: new Types.ObjectId(input.studentId),
      gradeId: new Types.ObjectId(input.gradeId),
      subjectId: new Types.ObjectId(input.subjectId),
      status: "active",
    }).exec(),
    UserModel.findById(input.studentId).populate("roleId").exec(),
  ]);

  if (!assignment) {
    throw new HttpError(
      403,
      "Teacher is not assigned to the requested grade and subject.",
      "TEACHER_SCOPE_DENIED",
    );
  }

  if (!student) {
    throw new HttpError(404, "Student not found.", "STUDENT_NOT_FOUND");
  }

  if ((student.roleId as { name?: string } | undefined)?.name !== "Student") {
    throw new HttpError(
      400,
      "Marks and attendance require a student account.",
      "INVALID_STUDENT_ROLE",
    );
  }

  if (!enrollment) {
    throw new HttpError(
      403,
      "Student is not enrolled in the requested grade and subject.",
      "STUDENT_SCOPE_DENIED",
    );
  }
}

export async function getTeacherDashboard(teacherId: string) {
  const assignments = await listTeacherAssignments(teacherId);
  const students = await listAssignedStudents(teacherId);
  const recentMarks = await MarkModel.find({
    teacherId: new Types.ObjectId(teacherId),
  })
    .sort({ updatedAt: -1 })
    .limit(10)
    .populate("studentId", "firstName lastName")
    .populate("subjectId", "name code")
    .populate("gradeId", "name academicYear")
    .populate("teacherId", "firstName lastName")
    .exec();
  const recentAttendance = await AttendanceRecordModel.find({
    teacherId: new Types.ObjectId(teacherId),
  })
    .sort({ updatedAt: -1 })
    .limit(10)
    .populate("studentId", "firstName lastName")
    .populate("subjectId", "name code")
    .populate("gradeId", "name academicYear")
    .populate("teacherId", "firstName lastName")
    .exec();

  return {
    assignments,
    students,
    recentMarks: recentMarks.map(mapMark),
    recentAttendance: recentAttendance.map(mapAttendance),
  };
}

export async function listTeacherMarks(teacherId: string) {
  const marks = await MarkModel.find({
    teacherId: new Types.ObjectId(teacherId),
  })
    .sort({ updatedAt: -1 })
    .populate("studentId", "firstName lastName")
    .populate("subjectId", "name code")
    .populate("gradeId", "name academicYear")
    .populate("teacherId", "firstName lastName")
    .exec();

  return marks.map(mapMark);
}

export async function listTeacherAttendance(teacherId: string) {
  const records = await AttendanceRecordModel.find({
    teacherId: new Types.ObjectId(teacherId),
    active: true,
  })
    .sort({ date: -1, updatedAt: -1 })
    .populate("studentId", "firstName lastName")
    .populate("subjectId", "name code")
    .populate("gradeId", "name academicYear")
    .populate("teacherId", "firstName lastName")
    .exec();

  return records.map(mapAttendance);
}
