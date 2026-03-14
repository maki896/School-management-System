import { Types } from "mongoose";

import { GradeModel } from "../models/grade.model";
import { SubjectModel } from "../models/subject.model";
import {
  enrollmentCreateSchema,
  enrollmentUpdateSchema,
  gradeCreateSchema,
  gradeUpdateSchema,
  routeParamsSchema,
  subjectCreateSchema,
  subjectUpdateSchema,
  teachingAssignmentCreateSchema,
  teachingAssignmentUpdateSchema,
} from "../validators/admin.validators";
import {
  archiveEnrollment,
  createEnrollment,
  listEnrollments,
  updateEnrollment,
} from "../services/enrollment.service";
import {
  archiveTeachingAssignment,
  createTeachingAssignment,
  listTeachingAssignments,
  updateTeachingAssignment,
} from "../services/teaching-assignment.service";
import { asyncHandler } from "../utils/async-handler";
import { HttpError } from "../utils/http-error";

function mapSubject(subject: any) {
  return {
    id: subject._id.toString(),
    name: subject.name,
    code: subject.code,
    description: subject.description,
    status: subject.status,
    createdAt: subject.createdAt,
    updatedAt: subject.updatedAt,
  };
}

function mapGrade(grade: any) {
  return {
    id: grade._id.toString(),
    name: grade.name,
    academicYear: grade.academicYear,
    status: grade.status,
    createdAt: grade.createdAt,
    updatedAt: grade.updatedAt,
  };
}

async function ensureUniqueSubjectCode(code?: string, excludeId?: string) {
  if (!code) {
    return;
  }

  const query: Record<string, unknown> = { code: code.toUpperCase() };

  if (excludeId) {
    query._id = { $ne: new Types.ObjectId(excludeId) };
  }

  const existing = await SubjectModel.findOne(query).exec();

  if (existing) {
    throw new HttpError(
      409,
      "Subject code is already in use.",
      "SUBJECT_CODE_EXISTS",
    );
  }
}

async function ensureUniqueGrade(
  name: string,
  academicYear: string,
  excludeId?: string,
) {
  const query: Record<string, unknown> = { name, academicYear };

  if (excludeId) {
    query._id = { $ne: new Types.ObjectId(excludeId) };
  }

  const existing = await GradeModel.findOne(query).exec();

  if (existing) {
    throw new HttpError(409, "Grade already exists.", "GRADE_EXISTS");
  }
}

export const listSubjectsController = asyncHandler(
  async (_request, response) => {
    const items = await SubjectModel.find().sort({ createdAt: -1 }).exec();
    response.status(200).json({ items: items.map(mapSubject) });
  },
);

export const createSubjectController = asyncHandler(
  async (request, response) => {
    const payload = subjectCreateSchema.parse(request.body);
    await ensureUniqueSubjectCode(payload.code);
    const created = await SubjectModel.create({
      ...payload,
      code: payload.code?.toUpperCase(),
      status: "active",
    });
    response.status(201).json({ item: mapSubject(created) });
  },
);

export const getSubjectController = asyncHandler(async (request, response) => {
  const { subjectId } = routeParamsSchema.parse(request.params);
  const subject = await SubjectModel.findById(subjectId).exec();

  if (!subject) {
    throw new HttpError(404, "Subject not found.", "SUBJECT_NOT_FOUND");
  }

  response.status(200).json({ item: mapSubject(subject) });
});

export const updateSubjectController = asyncHandler(
  async (request, response) => {
    const { subjectId } = routeParamsSchema.parse(request.params);
    const payload = subjectUpdateSchema.parse(request.body);
    const subject = await SubjectModel.findById(subjectId).exec();

    if (!subject) {
      throw new HttpError(404, "Subject not found.", "SUBJECT_NOT_FOUND");
    }

    if (payload.code) {
      await ensureUniqueSubjectCode(payload.code, subject._id.toString());
      subject.code = payload.code.toUpperCase();
    }

    if (payload.name) {
      subject.name = payload.name;
    }

    if (typeof payload.description !== "undefined") {
      subject.description = payload.description;
    }

    if (payload.status) {
      subject.status = payload.status;
    }

    await subject.save();
    response.status(200).json({ item: mapSubject(subject) });
  },
);

export const deleteSubjectController = asyncHandler(
  async (request, response) => {
    const { subjectId } = routeParamsSchema.parse(request.params);
    const subject = await SubjectModel.findById(subjectId).exec();

    if (!subject) {
      throw new HttpError(404, "Subject not found.", "SUBJECT_NOT_FOUND");
    }

    subject.status = "inactive";
    await subject.save();
    response.status(204).send();
  },
);

export const listGradesController = asyncHandler(async (_request, response) => {
  const items = await GradeModel.find().sort({ createdAt: -1 }).exec();
  response.status(200).json({ items: items.map(mapGrade) });
});

export const createGradeController = asyncHandler(async (request, response) => {
  const payload = gradeCreateSchema.parse(request.body);
  await ensureUniqueGrade(payload.name, payload.academicYear);
  const created = await GradeModel.create({ ...payload, status: "active" });
  response.status(201).json({ item: mapGrade(created) });
});

export const getGradeController = asyncHandler(async (request, response) => {
  const { gradeId } = routeParamsSchema.parse(request.params);
  const grade = await GradeModel.findById(gradeId).exec();

  if (!grade) {
    throw new HttpError(404, "Grade not found.", "GRADE_NOT_FOUND");
  }

  response.status(200).json({ item: mapGrade(grade) });
});

export const updateGradeController = asyncHandler(async (request, response) => {
  const { gradeId } = routeParamsSchema.parse(request.params);
  const payload = gradeUpdateSchema.parse(request.body);
  const grade = await GradeModel.findById(gradeId).exec();

  if (!grade) {
    throw new HttpError(404, "Grade not found.", "GRADE_NOT_FOUND");
  }

  const nextName = payload.name ?? grade.name;
  const nextAcademicYear = payload.academicYear ?? grade.academicYear;

  if (payload.name || payload.academicYear) {
    await ensureUniqueGrade(nextName, nextAcademicYear, grade._id.toString());
  }

  grade.name = nextName;
  grade.academicYear = nextAcademicYear;

  if (payload.status) {
    grade.status = payload.status;
  }

  await grade.save();
  response.status(200).json({ item: mapGrade(grade) });
});

export const deleteGradeController = asyncHandler(async (request, response) => {
  const { gradeId } = routeParamsSchema.parse(request.params);
  const grade = await GradeModel.findById(gradeId).exec();

  if (!grade) {
    throw new HttpError(404, "Grade not found.", "GRADE_NOT_FOUND");
  }

  grade.status = "inactive";
  await grade.save();
  response.status(204).send();
});

export const listEnrollmentsController = asyncHandler(
  async (_request, response) => {
    response.status(200).json({ items: await listEnrollments() });
  },
);

export const createEnrollmentController = asyncHandler(
  async (request, response) => {
    const payload = enrollmentCreateSchema.parse(request.body);
    response.status(201).json({ item: await createEnrollment(payload) });
  },
);

export const updateEnrollmentController = asyncHandler(
  async (request, response) => {
    const { enrollmentId } = routeParamsSchema.parse(request.params);
    const payload = enrollmentUpdateSchema.parse(request.body);
    response
      .status(200)
      .json({ item: await updateEnrollment(enrollmentId as string, payload) });
  },
);

export const deleteEnrollmentController = asyncHandler(
  async (request, response) => {
    const { enrollmentId } = routeParamsSchema.parse(request.params);
    await archiveEnrollment(enrollmentId as string);
    response.status(204).send();
  },
);

export const listTeachingAssignmentsController = asyncHandler(
  async (_request, response) => {
    response.status(200).json({ items: await listTeachingAssignments() });
  },
);

export const createTeachingAssignmentController = asyncHandler(
  async (request, response) => {
    const payload = teachingAssignmentCreateSchema.parse(request.body);
    response
      .status(201)
      .json({ item: await createTeachingAssignment(payload) });
  },
);

export const updateTeachingAssignmentController = asyncHandler(
  async (request, response) => {
    const { assignmentId } = routeParamsSchema.parse(request.params);
    const payload = teachingAssignmentUpdateSchema.parse(request.body);
    response
      .status(200)
      .json({
        item: await updateTeachingAssignment(assignmentId as string, payload),
      });
  },
);

export const deleteTeachingAssignmentController = asyncHandler(
  async (request, response) => {
    const { assignmentId } = routeParamsSchema.parse(request.params);
    await archiveTeachingAssignment(assignmentId as string);
    response.status(204).send();
  },
);
