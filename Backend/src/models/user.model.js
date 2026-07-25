import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,

      match: [
        /^[a-zA-Z0-9._%+-]+@(students\.)?uettaxila\.edu\.pk$/,
        "Please use an official university email",
      ],
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    // refreshToken is now stored in UserSession model for multi-device support

    role: {
      type: String,
      enum: ["student", "supervisor", "coordinator"],
      default: "student",
    },
    department: { type: String },
    studentProfile: {
      studentId: { type: String }, // e.g., 22-CS-001
      batch: { type: String }, // e.g., Fall 2022
      cgpa: { type: Number },
      group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
      coordinator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },

    supervisorProfile: {
      groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
      designation: { type: String },
      expertise: [String],
      studentQuota: { type: Number },
      coordinator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    coordinatorProfile: {
      sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Session" }],
    },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeExpiresAt: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpiresAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, role: this.role, email: this.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};
export const User = mongoose.model("User", userSchema);
