import { Session } from "../models/session.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Group } from "../models/group.model.js";

export const createSession = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user || user.role !== "coordinator") {
    throw new ApiError(403, "Only coordinators can create sessions");
  }
  const { name, startDate, endDate, department, settings, fypMilestones } =
    req.body;

  // Validate required fields
  if (!name || !startDate || !endDate || !department) {
    throw new ApiError(
      400,
      "Name, start date, end date, and department are required"
    );
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw new ApiError(400, "Start date must be before end date");
  }

  // Check if session with same name already exists
  const existingSession = await Session.findOne({ name, department }).populate("coordinator", "fullName");
  if (existingSession) {
    throw new ApiError(
      409,
      `Session with ${department} already exists and is coordinated by ${existingSession.coordinator?.fullName || "Unknown Coordinator"}`
    );
  }

  // Create the session
  const session = await Session.create({
    name,
    startDate: start,
    endDate: end,
    department,
    coordinator: req.user._id, // From verifyJWT middleware
    settings: {
      maxGroupSize: settings?.maxGroupSize || 4,
      minGroupSize: settings?.minGroupSize || 2,
    },
    fypMilestones: fypMilestones || [],
  });

  // Add the session to the coordinator's profile
  const coordinator = await User.findById(req.user._id);
  coordinator.coordinatorProfile.sessions.push(session._id);
  await coordinator.save();

  return res
    .status(201)
    .json(new ApiResponse(201, session, "Session created successfully"));
});

export const getSession = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user || !user.department) {
    throw new ApiError(401, "Unauthorized: User/department missing");
  }

  // Coordinator: see all sessions of their department
  if (user.role === "coordinator") {
    const session = await Session.find({ coordinator: user._id });

    return res
      .status(200)
      .json(new ApiResponse(200, session, "Sessions retrieved successfully"));
  }

  const session = await Session.find({
    department: user.department,
    isActive: true,
  }).populate("coordinator", "fullName email");

  if (!session || session.length === 0) {
    throw new ApiError(404, "No active session found for your department");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, session, "Active sessions retrieved successfully")
    );
});

export const updateSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { name, startDate, endDate, department, settings, fypMilestones } =
    req.body;
  // Validate sessionId
  if (!sessionId) {
    throw new ApiError(400, "Session ID is required");
  }
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new ApiError(404, "Session not found");
  }
  if (session.coordinator.toString() !== req.user._id.toString())
    throw new ApiError(403, "Not allowed");
  // Update fields if provided
  if (name) session.name = name;
  if (startDate) session.startDate = new Date(startDate);
  if (endDate) session.endDate = new Date(endDate);
  if (department) session.department = department;
  if (settings) {
    session.settings.maxGroupSize =
      settings.maxGroupSize || session.settings.maxGroupSize;
    session.settings.minGroupSize =
      settings.minGroupSize || session.settings.minGroupSize;
  }
  if (fypMilestones) {
    // Preserve existing Session milestone _ids
    const updatedSessionMilestones = fypMilestones.map((m, index) => {
      const existingSessionMilestone = session.fypMilestones[index] || {};
      const milestoneData = { ...m };
      if (existingSessionMilestone._id) {
        milestoneData._id = existingSessionMilestone._id;
      }
      return milestoneData;
    });
    session.fypMilestones = updatedSessionMilestones;
    
    // Sync the updated milestones to all groups associated with this session
    const groups = await Group.find({ session: session._id });
    for (const group of groups) {
      const updatedMilestones = updatedSessionMilestones.map((sessionMilestone, index) => {
        // Try to match by index first. If the coordinator deletes a milestone, 
        // the indices shift, but this is the safest way since frontend strips _id.
        const existingGroupMilestone = group.milestones[index] || {};
        
        const milestoneData = {
          title: sessionMilestone.title,
          description: sessionMilestone.description,
          deadline: sessionMilestone.dueDate,
          documentFiles: sessionMilestone.documentFiles || [],
          // Preserve existing student submissions and grades
          status: existingGroupMilestone.status || "PENDING",
          submissionFiles: existingGroupMilestone.submissionFiles || [],
          studentMessage: existingGroupMilestone.studentMessage || "",
          remarks: existingGroupMilestone.remarks || "",
          grade: existingGroupMilestone.grade || "",
        };

        if (existingGroupMilestone._id) {
          milestoneData._id = existingGroupMilestone._id;
        }

        return milestoneData;
      });
      group.milestones = updatedMilestones;
      await group.save();
    }
  }
  await session.save();
  return res
    .status(200)
    .json(new ApiResponse(200, session, "Session updated successfully"));
});

export const deleteSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    throw new ApiError(400, "Session ID is required");
  }
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new ApiError(404, "Session not found");
  }
  if (session.coordinator.toString() !== req.user._id.toString())
    throw new ApiError(403, "Not allowed");

  await Session.findByIdAndDelete(sessionId);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Session deleted successfully"));
});

export const changeActivation = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new ApiError(400, "Session ID is required");
  }
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new ApiError(404, "Session not found");
  }
  if (session.coordinator.toString() !== req.user._id.toString())
    throw new ApiError(403, "Not allowed");

  session.isActive = !session.isActive;
  await session.save();
  return res
    .status(200)
    .json(new ApiResponse(200, session, "Session activation status updated"));
});
