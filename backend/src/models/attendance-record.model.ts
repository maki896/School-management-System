import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const attendanceRecordSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: "Grade", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject" },
    teacherId: { type: Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      required: true,
    },
    notes: { type: String, trim: true },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

attendanceRecordSchema.index(
  { studentId: 1, gradeId: 1, subjectId: 1, date: 1 },
  { unique: true },
);

export type AttendanceRecordDocument = InferSchemaType<
  typeof attendanceRecordSchema
> & {
  _id: Schema.Types.ObjectId;
};

export const AttendanceRecordModel =
  (models.AttendanceRecord as Model<AttendanceRecordDocument>) ||
  model<AttendanceRecordDocument>("AttendanceRecord", attendanceRecordSchema);
