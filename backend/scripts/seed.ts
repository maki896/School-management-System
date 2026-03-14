import { disconnectDatabase, connectDatabase } from "../src/config/database";
import { env } from "../src/config/env";
import { AttendanceRecordModel } from "../src/models/attendance-record.model";
import { EnrollmentModel } from "../src/models/enrollment.model";
import { GradeModel } from "../src/models/grade.model";
import { MarkModel } from "../src/models/mark.model";
import { RoleModel } from "../src/models/role.model";
import { SubjectModel } from "../src/models/subject.model";
import { TeachingAssignmentModel } from "../src/models/teaching-assignment.model";
import { UserModel } from "../src/models/user.model";
import { hashPassword, seedRoles } from "../src/services/auth.service";
import { seedProfiles } from "../tests/fixtures/seed-data";

async function runSeed(): Promise<void> {
  await connectDatabase();
  await seedRoles();

  const [adminRole, teacherRole, studentRole] = await Promise.all([
    RoleModel.findOne({ name: "Admin" }).exec(),
    RoleModel.findOne({ name: "Teacher" }).exec(),
    RoleModel.findOne({ name: "Student" }).exec(),
  ]);

  if (!adminRole || !teacherRole || !studentRole) {
    throw new Error("Expected seed roles to exist.");
  }

  const passwordHash = await hashPassword(env.SEED_DEFAULT_PASSWORD);

  const grade = await GradeModel.findOneAndUpdate(
    {
      name: seedProfiles.grade.name,
      academicYear: seedProfiles.grade.academicYear,
    },
    seedProfiles.grade,
    { upsert: true, new: true },
  ).exec();

  const subject = await SubjectModel.findOneAndUpdate(
    { code: seedProfiles.subject.code },
    seedProfiles.subject,
    { upsert: true, new: true },
  ).exec();

  const admin = await UserModel.findOneAndUpdate(
    { email: env.SEED_ADMIN_EMAIL },
    {
      firstName: seedProfiles.admin.firstName,
      lastName: seedProfiles.admin.lastName,
      email: env.SEED_ADMIN_EMAIL,
      passwordHash,
      roleId: adminRole._id,
      status: "active",
      profile: { staffIdentifier: seedProfiles.admin.staffIdentifier },
    },
    { upsert: true, new: true },
  ).exec();

  const teacher = await UserModel.findOneAndUpdate(
    { email: env.SEED_TEACHER_EMAIL },
    {
      firstName: seedProfiles.teacher.firstName,
      lastName: seedProfiles.teacher.lastName,
      email: env.SEED_TEACHER_EMAIL,
      passwordHash,
      roleId: teacherRole._id,
      status: "active",
      profile: { staffIdentifier: seedProfiles.teacher.staffIdentifier },
    },
    { upsert: true, new: true },
  ).exec();

  const student = await UserModel.findOneAndUpdate(
    { email: env.SEED_STUDENT_EMAIL },
    {
      firstName: seedProfiles.student.firstName,
      lastName: seedProfiles.student.lastName,
      email: env.SEED_STUDENT_EMAIL,
      passwordHash,
      roleId: studentRole._id,
      status: "active",
      profile: { studentIdentifier: seedProfiles.student.studentIdentifier },
    },
    { upsert: true, new: true },
  ).exec();

  await EnrollmentModel.findOneAndUpdate(
    {
      studentId: student._id,
      gradeId: grade._id,
      subjectId: subject._id,
      status: "active",
    },
    {
      studentId: student._id,
      gradeId: grade._id,
      subjectId: subject._id,
      status: "active",
    },
    { upsert: true, new: true },
  ).exec();

  await TeachingAssignmentModel.findOneAndUpdate(
    {
      teacherId: teacher._id,
      gradeId: grade._id,
      subjectId: subject._id,
      status: "active",
    },
    {
      teacherId: teacher._id,
      gradeId: grade._id,
      subjectId: subject._id,
      status: "active",
    },
    { upsert: true, new: true },
  ).exec();

  await MarkModel.findOneAndUpdate(
    {
      studentId: student._id,
      subjectId: subject._id,
      gradeId: grade._id,
      assessmentType: "Quiz 1",
      term: "Term 1",
    },
    {
      studentId: student._id,
      subjectId: subject._id,
      gradeId: grade._id,
      teacherId: teacher._id,
      assessmentType: "Quiz 1",
      score: 86,
      maxScore: 100,
      term: "Term 1",
      status: "published",
    },
    { upsert: true, new: true },
  ).exec();

  await AttendanceRecordModel.findOneAndUpdate(
    {
      studentId: student._id,
      gradeId: grade._id,
      subjectId: subject._id,
      date: new Date("2026-03-10"),
    },
    {
      studentId: student._id,
      gradeId: grade._id,
      subjectId: subject._id,
      teacherId: teacher._id,
      date: new Date("2026-03-10"),
      status: "present",
      notes: "Seeded attendance record.",
      active: true,
    },
    { upsert: true, new: true },
  ).exec();

  console.log("Seed completed successfully.");
  console.log(`Admin: ${admin.email} / ${env.SEED_DEFAULT_PASSWORD}`);
  console.log(`Teacher: ${teacher.email} / ${env.SEED_DEFAULT_PASSWORD}`);
  console.log(`Student: ${student.email} / ${env.SEED_DEFAULT_PASSWORD}`);
}

void runSeed()
  .catch((error) => {
    console.error("Seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
