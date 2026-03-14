import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const subjectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true, uppercase: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  {
    timestamps: true,
  },
);

subjectSchema.index({ code: 1 }, { unique: true, sparse: true });

export type SubjectDocument = InferSchemaType<typeof subjectSchema> & {
  _id: Schema.Types.ObjectId;
};

export const SubjectModel =
  (models.Subject as Model<SubjectDocument>) ||
  model<SubjectDocument>("Subject", subjectSchema);
