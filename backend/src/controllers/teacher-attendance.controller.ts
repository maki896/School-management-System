import { asyncHandler } from "../utils/async-handler";
import {
  createTeacherAttendance,
  listTeacherAttendance,
  updateTeacherAttendance,
} from "../services/teacher-attendance.service";
import {
  teacherAttendanceCreateSchema,
  teacherAttendanceUpdateSchema,
  teacherRouteParamsSchema,
} from "../validators/teacher.validators";

export const listTeacherAttendanceController = asyncHandler(
  async (request, response) => {
    response
      .status(200)
      .json({ items: await listTeacherAttendance(request.auth!.sub) });
  },
);

export const createTeacherAttendanceController = asyncHandler(
  async (request, response) => {
    const payload = teacherAttendanceCreateSchema.parse(request.body);
    response
      .status(201)
      .json({
        item: await createTeacherAttendance(request.auth!.sub, payload),
      });
  },
);

export const updateTeacherAttendanceController = asyncHandler(
  async (request, response) => {
    const { attendanceId } = teacherRouteParamsSchema.parse(request.params);
    const payload = teacherAttendanceUpdateSchema.parse(request.body);
    response
      .status(200)
      .json({
        item: await updateTeacherAttendance(
          request.auth!.sub,
          attendanceId as string,
          payload,
        ),
      });
  },
);
