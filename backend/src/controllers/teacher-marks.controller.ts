import { asyncHandler } from "../utils/async-handler";
import {
  listTeacherMarks,
  createTeacherMark,
  updateTeacherMark,
} from "../services/mark.service";
import {
  teacherMarkCreateSchema,
  teacherMarkUpdateSchema,
  teacherRouteParamsSchema,
} from "../validators/teacher.validators";

export const listTeacherMarksController = asyncHandler(
  async (request, response) => {
    response
      .status(200)
      .json({ items: await listTeacherMarks(request.auth!.sub) });
  },
);

export const createTeacherMarkController = asyncHandler(
  async (request, response) => {
    const payload = teacherMarkCreateSchema.parse(request.body);
    response
      .status(201)
      .json({ item: await createTeacherMark(request.auth!.sub, payload) });
  },
);

export const updateTeacherMarkController = asyncHandler(
  async (request, response) => {
    const { markId } = teacherRouteParamsSchema.parse(request.params);
    const payload = teacherMarkUpdateSchema.parse(request.body);
    response
      .status(200)
      .json({
        item: await updateTeacherMark(
          request.auth!.sub,
          markId as string,
          payload,
        ),
      });
  },
);
