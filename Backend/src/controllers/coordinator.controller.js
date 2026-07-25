import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AllowedSupervisor } from "../models/allowedSupervisor.model.js";

export const allowSupervisorEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const coordinator = req.user;

  if (!email?.trim()) {
    throw new ApiError(400, "Email is required");
  }

  const emailLower = email.trim().toLowerCase();

  // Prevent duplicates
  const existing = await AllowedSupervisor.findOne({ email: emailLower });
  if (existing) {
    throw new ApiError(400, "This email is already on the allowed list");
  }

  const entry = await AllowedSupervisor.create({
    email: emailLower,
    department: coordinator.department,
    addedBy: coordinator._id,
  });

  return res.status(201).json(
    new ApiResponse(201, entry, "Email added to supervisor whitelist")
  );
});


export const getAllowedSupervisors = asyncHandler(async (req, res) => {
  const coordinator = req.user;

  const list = await AllowedSupervisor.find({ department: coordinator.department })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, list, "Allowed supervisors fetched successfully")
  );
});


export const removeAllowedSupervisor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coordinator = req.user;

  const entry = await AllowedSupervisor.findOne({ _id: id, department: coordinator.department });
  if (!entry) {
    throw new ApiError(404, "Entry not found or not in your department");
  }

  await entry.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, null, "Email removed from supervisor whitelist")
  );
});
