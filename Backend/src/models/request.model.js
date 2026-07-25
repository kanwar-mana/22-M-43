import mongoose, { Schema } from "mongoose";

const requestSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["GROUP_INVITATION", "SUPERVISOR_REQUEST"],
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User", // For GROUP_INVITATION, this is the student inviting. For SUPERVISOR_REQUEST, this could be the leader.
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User", // The student being invited OR the supervisor being requested
      required: true,
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    message: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Request = mongoose.model("Request", requestSchema);
