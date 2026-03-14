import { InferSchemaType, Model, Schema, model, models } from "mongoose";

import { ROLE_NAMES } from "../constants/roles";

const roleSchema = new Schema(
  {
    name: {
      type: String,
      enum: ROLE_NAMES,
      required: true,
      unique: true,
      trim: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export type RoleDocument = InferSchemaType<typeof roleSchema> & {
  _id: Schema.Types.ObjectId;
};

export const RoleModel =
  (models.Role as Model<RoleDocument>) ||
  model<RoleDocument>("Role", roleSchema);
