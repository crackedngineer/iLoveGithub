import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    githubId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "GitHub User",
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);
