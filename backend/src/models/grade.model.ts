import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const gradeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  {
    timestamps: true,
  },
);

gradeSchema.index({ name: 1, academicYear: 1 }, { unique: true });

export type GradeDocument = InferSchemaType<typeof gradeSchema> & {
  _id: Schema.Types.ObjectId;
};

export const GradeModel =
  (models.Grade as Model<GradeDocument>) ||
  model<GradeDocument>("Grade", gradeSchema);
