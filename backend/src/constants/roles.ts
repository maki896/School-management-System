export const ROLE_NAMES = ["Admin", "Teacher", "Student"] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

export const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  Admin: [
    "teachers:manage",
    "students:manage",
    "subjects:manage",
    "grades:manage",
    "enrollments:manage",
    "assignments:manage",
    "attendance:manage",
  ],
  Teacher: ["dashboard:read", "marks:manage", "attendance:manage"],
  Student: ["report:read"],
};
