import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const markSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: "Grade", required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assessmentType: { type: String, required: true, trim: true },
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, min: 0, default: 100 },
    term: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    recordedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export type MarkDocument = InferSchemaType<typeof markSchema> & {
  _id: Schema.Types.ObjectId;
};

export const MarkModel =
  (models.Mark as Model<MarkDocument>) ||
  model<MarkDocument>("Mark", markSchema);
