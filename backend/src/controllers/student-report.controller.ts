import { asyncHandler } from "../utils/async-handler";
import {
  getStudentReport,
  listStudentAttendance,
  listStudentMarks,
} from "../services/student-report.service";

export const getStudentReportController = asyncHandler(
  async (request, response) => {
    response.status(200).json(await getStudentReport(request.auth!.sub));
  },
);

export const listStudentMarksController = asyncHandler(
  async (request, response) => {
    response
      .status(200)
      .json({ items: await listStudentMarks(request.auth!.sub) });
  },
);

export const listStudentAttendanceController = asyncHandler(
  async (request, response) => {
    response
      .status(200)
      .json({ items: await listStudentAttendance(request.auth!.sub) });
  },
);
