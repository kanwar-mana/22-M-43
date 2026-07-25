import mongoose, { Schema } from "mongoose";

const allowedSupervisorSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    department: {
      type: String,
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    used: {
      type: Boolean,
      default: false, // becomes true once the supervisor signs up
    },
  },
  { timestamps: true }
);

// Ensure one whitelist entry per email
allowedSupervisorSchema.index({ email: 1 }, { unique: true });

export const AllowedSupervisor = mongoose.model("AllowedSupervisor", allowedSupervisorSchema);
