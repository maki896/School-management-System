import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const teachingAssignmentSchema = new Schema(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: "Grade", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  {
    timestamps: true,
  },
);

teachingAssignmentSchema.index(
  { teacherId: 1, gradeId: 1, subjectId: 1, status: 1 },
  { unique: true },
);

export type TeachingAssignmentDocument = InferSchemaType<
  typeof teachingAssignmentSchema
> & {
  _id: Schema.Types.ObjectId;
};

export const TeachingAssignmentModel =
  (models.TeachingAssignment as Model<TeachingAssignmentDocument>) ||
  model<TeachingAssignmentDocument>(
    "TeachingAssignment",
    teachingAssignmentSchema,
  );
