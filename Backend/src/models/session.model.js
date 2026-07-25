import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // e.g., "Fall 2025"
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    coordinator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // The admin who created/manages this session
    },
    settings: {
      maxGroupSize: { type: Number, default: 4 },
      minGroupSize: { type: Number, default: 2 },
      groupsPerSupervisor: { type: Number, default: 6 },
    },
    fypMilestones: [
      {
        title: { type: String, required: true },
        dueDate: { type: Date, required: true },
        description: { type: String },
        documentFiles: [
          {
            cloudinaryUrl: { type: String, required: true },
            publicId: { type: String, required: true },
            originalName: { type: String, required: true },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Session = mongoose.model("Session", sessionSchema);
