import { asyncHandler } from "../utils/async-handler";
import {
  getTeacherDashboard,
  listAssignedStudents,
} from "../services/teacher-dashboard.service";

export const getTeacherDashboardController = asyncHandler(
  async (request, response) => {
    response.status(200).json(await getTeacherDashboard(request.auth!.sub));
  },
);

export const listAssignedStudentsController = asyncHandler(
  async (request, response) => {
    response
      .status(200)
      .json({ items: await listAssignedStudents(request.auth!.sub) });
  },
);
