import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const enrollmentSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: "Grade", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  {
    timestamps: true,
  },
);

enrollmentSchema.index(
  { studentId: 1, gradeId: 1, subjectId: 1, status: 1 },
  { unique: true },
);

export type EnrollmentDocument = InferSchemaType<typeof enrollmentSchema> & {
  _id: Schema.Types.ObjectId;
};

export const EnrollmentModel =
  (models.Enrollment as Model<EnrollmentDocument>) ||
  model<EnrollmentDocument>("Enrollment", enrollmentSchema);
