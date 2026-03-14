import {
  attendanceCreateSchema,
  attendanceUpdateSchema,
  routeParamsSchema,
} from "../validators/admin.validators";
import {
  createAttendanceRecord,
  deactivateAttendanceRecord,
  getAttendanceRecord,
  listAttendanceRecords,
  updateAttendanceRecord,
} from "../services/attendance-admin.service";
import { asyncHandler } from "../utils/async-handler";

export const listAttendanceController = asyncHandler(
  async (_request, response) => {
    response.status(200).json({ items: await listAttendanceRecords() });
  },
);

export const createAttendanceController = asyncHandler(
  async (request, response) => {
    const payload = attendanceCreateSchema.parse(request.body);
    response.status(201).json({ item: await createAttendanceRecord(payload) });
  },
);

export const getAttendanceController = asyncHandler(
  async (request, response) => {
    const { attendanceId } = routeParamsSchema.parse(request.params);
    response
      .status(200)
      .json({ item: await getAttendanceRecord(attendanceId as string) });
  },
);

export const updateAttendanceController = asyncHandler(
  async (request, response) => {
    const { attendanceId } = routeParamsSchema.parse(request.params);
    const payload = attendanceUpdateSchema.parse(request.body);
    response
      .status(200)
      .json({
        item: await updateAttendanceRecord(attendanceId as string, payload),
      });
  },
);

export const deleteAttendanceController = asyncHandler(
  async (request, response) => {
    const { attendanceId } = routeParamsSchema.parse(request.params);
    await deactivateAttendanceRecord(attendanceId as string);
    response.status(204).send();
  },
);
