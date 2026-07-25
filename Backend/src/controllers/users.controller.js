import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getDepartmentSupervisors = asyncHandler(async (req, res) => {
  const coordinator = req.user;

  if (coordinator.role !== "coordinator") {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  const department = coordinator.department;

  if (!department) {
    throw new ApiError(400, "Coordinator department not found");
  }

  const supervisors = await User.find({
    role: "supervisor",
    department: department,
  }).select("-password");
  console.log(supervisors);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        supervisors,
        "Department supervisors fetched successfully"
      )
    );
});

export const getDepartmentStudents = asyncHandler(async (req, res) => {
  const coordinator = req.user;

  if (coordinator.role !== "coordinator") {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  const department = coordinator.department;

  if (!department) {
    throw new ApiError(400, "Coordinator department not found");
  }

  const students = await User.find({
    role: "student",
    department: department,
  }).select("-password");

  res
    .status(200)
    .json(
      new ApiResponse(200, students, "Department students fetched successfully")
    );
});
