import mongoose, { Schema } from "mongoose";

const groupSchema = new Schema(
  {
    session: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },

    leader: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: {
      type: String,
      required: true,
    },

    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    requiredMembers: {
      type: Number,
      required: true,
    },
    supervisor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    internalEvaluator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    projectDetails: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      domain: {
        type: String,
        enum: [
          "Research",
          "Web"
        ],
        required: true,
      },
      technologies: { type: [String], required: true },
      proposalDocument: { type: String },
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING_SUPERVISOR",
        "APPROVED",
        "REJECTED",
        "COMPLETED",
      ],
      default: "DRAFT",
    },

    milestones: [
      {
        title: String,
        description: String,
        deadline: Date,
        documentFiles: [
          {
            cloudinaryUrl: String,
            publicId: String,
            originalName: String,
          },
        ],
        status: {
          type: String,
          enum: ["PENDING", "SUBMITTED", "APPROVED", "REJECTED"],
          default: "PENDING",
        },
        submissionFiles: [
          {
            cloudinaryUrl: String,
            publicId: String,
            originalName: String,
          },
        ],
        studentMessage: String,
        remarks: String,
        grade: String,
      },
    ],
  },
  { timestamps: true }
);

export const Group = mongoose.model("Group", groupSchema);
