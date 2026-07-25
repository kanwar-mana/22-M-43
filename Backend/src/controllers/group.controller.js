import { Group } from "../models/group.model.js";
import { Session } from "../models/session.model.js";
import { User } from "../models/user.model.js";
import { Request } from "../models/request.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UAParser } from "ua-parser-js";

export const createGroup = asyncHandler(async (req, res) => {
  const { sessionId, requiredMembers, projectDetails } = req.body;
  const leaderId = req.user._id;
  if (!sessionId || !requiredMembers || !projectDetails) {
    throw new ApiError(
      400,
      "SessionId, required members, and project details are required"
    );
  }

  const isLeaderInAnotherGroup = await Group.findOne({ leader: leaderId });
  if (isLeaderInAnotherGroup) {
    throw new ApiError(400, "You are already leading another group");
  }

  const session = await Session.findById(sessionId);
  if (!session) {
    throw new ApiError(404, "Session not found");
  }
  const { minGroupSize, maxGroupSize } = session.settings;
  if (requiredMembers < minGroupSize || requiredMembers > maxGroupSize) {
    throw new ApiError(
      400,
      `Required members must be between ${minGroupSize} and ${maxGroupSize}`
    );
  }

  const leader = await User.findById(leaderId);
  if (leader.role !== "student") {
    throw new ApiError(400, "Only students can create groups");
  }

  const group = await Group.create({
    session: sessionId,
    leader: leaderId,
    department: leader.department,
    requiredMembers,
    projectDetails,
    members: [leaderId],
    milestones: session.fypMilestones.map((m) => ({
      title: m.title,
      description: m.description,
      deadline: m.dueDate,
      documentFiles: m.documentFiles || [],
      status: "PENDING",
    })),
  });
  if (group) {
    group.status = "PENDING_SUPERVISOR";
    await group.save();
  }

  leader.studentProfile.group = group._id;
  await leader.save();

  const populatedGroup = await Group.findById(group._id)
    .populate("leader", "fullName email studentProfile")
    .populate("members", "fullName email studentProfile")
    .populate("session", "name department settings fypMilestones startDate endDate");

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        populatedGroup,
        "Group created successfully. Invite members to complete the group."
      )
    );
});

export const updateGroupDetails = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { title, description, domain, technologies, requiredMembers } = req.body;

  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  // Check if current user is the leader
  if (group.leader.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the group leader can update group details");
  }

  // Check status (DRAFT, PENDING_SUPERVISOR, or REJECTED)
  const allowedStatuses = ["DRAFT", "PENDING_SUPERVISOR", "REJECTED"];
  if (!allowedStatuses.includes(group.status)) {
    throw new ApiError(400, `Group details cannot be updated because status is ${group.status}`);
  }

  if (title) group.projectDetails.title = title;
  if (description) group.projectDetails.description = description;
  if (domain) group.projectDetails.domain = domain;
  if (technologies) group.projectDetails.technologies = technologies;
  if (requiredMembers) {
    if (requiredMembers < group.members.length) {
      throw new ApiError(400, "Required members cannot be less than current group size");
    }
    group.requiredMembers = requiredMembers;
  }

  await group.save();

  const updatedGroup = await Group.findById(groupId)
    .populate("leader", "fullName email studentProfile")
    .populate("members", "fullName email studentProfile")
    .populate("session", "name department settings fypMilestones startDate endDate");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedGroup, "Group details updated successfully"));
});

export const getAllGroups = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.role === "coordinator") {
    const department = user.department;
    if (!department) {
      throw new ApiError(400, "Coordinator department not found");
    }
    const groups = await Group.find({ department })
      .populate("leader", "fullName email studentProfile")
      .populate("members", "fullName email studentProfile")
      .populate("supervisor", "fullName email supervisorProfile")
      .populate("internalEvaluator", "fullName email supervisorProfile")
      .populate("session", "name department settings fypMilestones startDate endDate");
    return res.status(200).json(new ApiResponse(200, groups, "Groups fetched successfully"));
  } else if (user.role === "supervisor") {
    const groups = await Group.find({
      $or: [{ supervisor: user._id }, { internalEvaluator: user._id }]
    })
      .populate("leader", "fullName email studentProfile")
      .populate("members", "fullName email studentProfile")
      .populate("supervisor", "fullName email supervisorProfile")
      .populate("internalEvaluator", "fullName email supervisorProfile")
      .populate("session", "name department settings fypMilestones startDate endDate");
    return res.status(200).json(new ApiResponse(200, groups, "Groups fetched successfully"));
  }

  throw new ApiError(403, "You are not authorized to perform this action");
});

export const getGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const user = req.user;

  const group = await Group.findById(groupId)
    .populate("leader", "fullName email studentProfile")
    .populate("members", "fullName email studentProfile")
    .populate("supervisor", "fullName email supervisorProfile")
    .populate("internalEvaluator", "fullName email supervisorProfile")
    .populate("session", "name department settings fypMilestones startDate endDate");

  if (
    user.role === "student" &&
    !group.members.some(
      (member) => member._id.toString() === user._id.toString()
    )
  ) {
    throw new ApiError(403, "You are not a member of this group");
  }

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, group, "Group retrieved successfully"));
});

export const updateGroup = asyncHandler(async (req, res) => {
  const { groupId, projectDetails, supervisor, status } = req.body;
  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }
  if (projectDetails) group.projectDetails = projectDetails;
  if (supervisor) group.supervisor = supervisor;
  if (status) group.status = status;
  await group.save();
  return res
    .status(200)
    .json(new ApiResponse(200, group, "Group updated successfully"));
});

export const deleteGroup = asyncHandler(async (req, res) => {
  const user = req.user;
  const { groupId } = req.params;
  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  // Leader can delete group if status is PENDING_SUPERVISOR or REJECTED
  const canLeaderDelete = ["PENDING_SUPERVISOR", "REJECTED"].includes(group.status) &&
    user._id.toString() === group.leader.toString();

  if (canLeaderDelete) {
    // Clear all members' group reference
    if (group.members && group.members.length > 0) {
      await User.updateMany(
        { _id: { $in: group.members } },
        { $set: { "studentProfile.group": null } }
      );
    }
    await Request.deleteMany({ group: groupId });
    await Group.findByIdAndDelete(groupId);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Group deleted successfully"));
  }

  if (group.status === "APPROVED" && user.role === "student") {
    throw new ApiError(403, "You are not allowed to delete this group");
  }


  if (group.members && group.members.length > 0) {
    await User.updateMany(
      { _id: { $in: group.members } },
      { $set: { "studentProfile.group": null } }
    );
  }

  if (group.supervisor) {
    await User.updateOne(
      { _id: group.supervisor },
      { $pull: { "supervisorProfile.groups": groupId } }
    );
  }


  await Request.deleteMany({ group: groupId });

  await Group.findByIdAndDelete(groupId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Group deleted successfully"));
});

// Remove a member from the group (leader or supervisor)
export const removeFromGroup = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { groupId, studentId } = req.body;

  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const isLeader = group.leader.toString() === userId.toString();
  const isSupervisor = group.supervisor && group.supervisor.toString() === userId.toString();

  if (!isLeader && !isSupervisor) {
    throw new ApiError(403, "Only the group leader or supervisor can remove members");
  }

  if (group.leader.toString() === studentId.toString()) {
    throw new ApiError(400, "Cannot remove the group leader from the group");
  }

  if (isLeader) {
    const pendingSupervisorRequest = await Request.findOne({
      group: groupId,
      type: "SUPERVISOR_REQUEST",
      status: "PENDING"
    });

    if (pendingSupervisorRequest) {
      throw new ApiError(400, "Cannot remove members after sending an invitation to a supervisor");
    }

    if (group.supervisor) {
      throw new ApiError(400, "Cannot remove members when the group already has a supervisor");
    }
  }

  group.members = group.members.filter(
    (memberId) => memberId.toString() !== studentId.toString()
  );
  await group.save();

  const student = await User.findById(studentId);
  if (student) {
    student.studentProfile.group = null;
    await student.save();
  }

  const updatedGroup = await Group.findById(group._id)
    .populate("leader", "fullName email studentProfile")
    .populate("members", "fullName email studentProfile")
    .populate("session", "name department settings fypMilestones startDate endDate");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedGroup, "Member removed successfully"));
});

//Leave member from group
export const leaveGroup = asyncHandler(async (req, res) =>  {
  const userId= req.user._id;
  const {groupId}=req.params;

  const group= await Group.findById(groupId);
  if(!group) {throw new ApiError(404,"Group not found")}

  if(group.supervisor){
    throw new ApiError(400,"As group has a supervisor, you can not leave the group")
  }
  if(group.leader.toString() === userId.toString()){
    throw new ApiError(400,"As you are the leader of the group, you can not leave the group")
  }

  if (!group.members.some((m) => m.toString() === userId.toString())) {
    throw new ApiError(400, "You are not a member of this group");
  }

  const pendingSupervisorRequest = await Request.findOne({
    group: groupId,
    type: "SUPERVISOR_REQUEST",
    status: "PENDING"
  });

  if (pendingSupervisorRequest) {
    throw new ApiError(400, "Cannot leave the group while a supervisor request is pending");
  }

  group.members = group.members.filter((memberId)=> memberId.toString()!== userId.toString());
  await group.save();

  await User.updateOne(
    {_id: userId},
    {$set:{"studentProfile.group": null}}
  );

  const updatedGroup = await Group.findById(group._id)
    .populate("leader", "fullName email studentProfile")
    .populate("members", "fullName email studentProfile")
    .populate("session", "name department settings fypMilestones startDate endDate");

  return res.status(200).json(new ApiResponse(200, updatedGroup, "Group left successfully"));
});


// Cancel supervisor invitation
export const cancelSupervisorRequest = asyncHandler(async (req, res) => {
  const leaderId = req.user._id;
  const { requestId } = req.params;

  const request = await Request.findById(requestId).populate("group");
  if (!request || request.type !== "SUPERVISOR_REQUEST") {
    throw new ApiError(404, "Supervisor request not found");
  }

  if (request.group.leader.toString() !== leaderId.toString()) {
    throw new ApiError(403, "Only the group leader can cancel this request");
  }

  if (request.status !== "PENDING") {
    throw new ApiError(400, `Cannot cancel request because it is already ${request.status}`);
  }

  await Request.findByIdAndDelete(requestId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Supervisor invitation cancelled successfully"));
});

// Invite a student to the group
export const inviteStudent = asyncHandler(async (req, res) => {
  const { groupId, studentId } = req.body;
  const leaderId = req.user._id;

  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (group.leader.toString() !== leaderId.toString()) {
    throw new ApiError(403, "Only the group leader can invite members");
  }

  if (group.status !== "PENDING_SUPERVISOR") {
    throw new ApiError(400, "Complete your group detail first");
  }

  if (group.members.length >= group.requiredMembers) {
    throw new ApiError(400, "Group has reached its required number of members");
  }

  if (leaderId.toString() === studentId.toString()) {
    throw new ApiError(400, "You cannot invite yourself");
  }

  const student = await User.findById(studentId);
  if (!student || student.role !== "student") {
    throw new ApiError(404, "Student not found");
  }

  if (student.studentProfile?.group) {
    throw new ApiError(400, "Student is already part of a group");
  }

  const existingRequest = await Request.findOne({
    type: "GROUP_INVITATION",
    group: groupId,
    receiver: studentId,
    status: "PENDING"
  });

  if (existingRequest) {
    throw new ApiError(400, "An invitation is already pending for this student");
  }

  const request = await Request.create({
    type: "GROUP_INVITATION",
    sender: leaderId,
    receiver: studentId,
    group: groupId,
    message: `You have been invited to join the group by ${req.user.fullName}`
  });

  return res.status(201).json(new ApiResponse(201, request, "Invitation sent successfully"));
});

// Respond to an invitation
export const respondToInvitation = asyncHandler(async (req, res) => {
  const { requestId, action } = req.body; // action: "ACCEPTED" or "REJECTED"
  const studentId = req.user._id;

  const request = await Request.findById(requestId);
  if (!request || request.type !== "GROUP_INVITATION") {
    throw new ApiError(404, "Invitation not found");
  }

  if (request.receiver.toString() !== studentId.toString()) {
    throw new ApiError(403, "You are not authorized to respond to this invitation");
  }

  if (request.status !== "PENDING") {
    throw new ApiError(400, `Invitation is already ${request.status}`);
  }

  if (action === "REJECTED") {
    request.status = "REJECTED";
    await request.save();
    return res.status(200).json(new ApiResponse(200, request, "Invitation rejected"));
  }

  if (action === "ACCEPTED") {
    const student = await User.findById(studentId);
    if (student.studentProfile?.group?.status === "PENDING_SUPERVISOR") {
      await Group.findByIdAndDelete(student.studentProfile?.group._id);
      await Request.deleteMany({ group: student.studentProfile?.group._id });
    }

    if (student.studentProfile?.group) {
      throw new ApiError(400, "You are already part of a group");
    }

    const group = await Group.findById(request.group);
    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    if (group.members.length >= group.requiredMembers) {
      throw new ApiError(400, "This group is already full");
    }

    // Add student to group
    group.members.push(studentId);
    await group.save();

    // Update student profile
    student.studentProfile.group = group._id;
    await student.save();

    // Mark request as accepted
    request.status = "ACCEPTED";
    await request.save();

    // Reject all other pending invitations for this student
    await Request.updateMany(
      { receiver: studentId, type: "GROUP_INVITATION", status: "PENDING" },
      { $set: { status: "REJECTED" } }
    );

    const groupLead = await Group.findOne({
      leader: studentId,
      status: "PENDING_SUPERVISOR"
    });

    if (groupLead) {
      await Group.findByIdAndDelete(groupLead._id);
    }

    const updatedGroup = await Group.findById(group._id)
      .populate("leader", "fullName email studentProfile")
      .populate("members", "fullName email studentProfile")
      .populate("session", "name department settings fypMilestones startDate endDate");

    return res.status(200).json(new ApiResponse(200, updatedGroup, "Successfully joined the group"));
  }

  throw new ApiError(400, "Invalid action. Use ACCEPTED or REJECTED");
});

// Get invitations for the logged in student
export const getMyInvitations = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const invitations = await Request.find({
    receiver: studentId,
    type: "GROUP_INVITATION",
    status: "PENDING"
  }).populate("group", "projectDetails requiredMembers members")
    .populate("sender", "fullName email");

  return res.status(200).json(new ApiResponse(200, invitations, "Invitations fetched successfully"));
});

// Get available students for a leader to invite
export const getAvailableStudents = asyncHandler(async (req, res) => {
  const { department } = req.user;
  const { search } = req.query;

  let query = {
    role: "student",
    department: department,
    "studentProfile.group": null
  };

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  const availableStudents = await User.find(query).select("fullName email studentProfile");

  return res.status(200).json(new ApiResponse(200, availableStudents, "Available students fetched successfully"));
});

// Get available supervisors
export const getSupervisors = asyncHandler(async (req, res) => {
  const { department } = req.user;
  const { search } = req.query;

  let query = {
    role: "supervisor",
    department: department
  };

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  const supervisors = await User.find(query).select("fullName email supervisorProfile department");

  return res.status(200).json(new ApiResponse(200, supervisors, "Supervisors fetched successfully"));
});

// Send a request to a supervisor
export const sendSupervisorRequest = asyncHandler(async (req, res) => {
  const { groupId, supervisorId } = req.body;
  const leaderId = req.user._id;

  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (group.leader.toString() !== leaderId.toString()) {
    throw new ApiError(403, "Only the group leader can send a supervisor request");
  }

  // Only allow if group is pending supervisor or rejected by a previous one
  if (group.status !== "PENDING_SUPERVISOR" && group.status !== "REJECTED") {
    throw new ApiError(400, `Cannot request a supervisor when group status is ${group.status}`);
  }

  // Ensure group is full before requesting supervisor
  if (group.members.length < group.requiredMembers) {
    throw new ApiError(400, "Group must have the required number of members before requesting a supervisor");
  }

  if (group.supervisor) {
    throw new ApiError(400, "Group already has a supervisor");
  }

  const supervisor = await User.findById(supervisorId);
  if (!supervisor || supervisor.role !== "supervisor") {
    throw new ApiError(404, "Supervisor not found");
  }

  // Check if supervisor quota is full
  if (supervisor.supervisorProfile?.groups?.length >= supervisor.supervisorProfile?.studentQuota) {
    throw new ApiError(400, "This supervisor has reached their maximum group quota");
  }

  const existingRequest = await Request.findOne({
    type: "SUPERVISOR_REQUEST",
    group: groupId,
    status: "PENDING"
  });

  if (existingRequest) {
    throw new ApiError(400, "A supervisor request is already pending for this group");
  }

  const request = await Request.create({
    type: "SUPERVISOR_REQUEST",
    sender: leaderId,
    receiver: supervisorId,
    group: groupId,
    message: `Group '${group.projectDetails.title}' has requested you as their supervisor`
  });

  return res.status(201).json(new ApiResponse(201, request, "Supervisor request sent successfully"));
});

// Get supervisor requests (for logged in supervisor)
export const getMySupervisorRequests = asyncHandler(async (req, res) => {
  const supervisorId = req.user._id;

  const requests = await Request.find({
    receiver: supervisorId,
    type: "SUPERVISOR_REQUEST",
    status: "PENDING"
  }).populate({
    path: "group",
    populate: [
      { path: "leader", select: "fullName email studentProfile" },
      { path: "members", select: "fullName email studentProfile" }
    ]
  }).populate("sender", "fullName email");

  return res.status(200).json(new ApiResponse(200, requests, "Supervisor requests fetched successfully"));
});

// Get supervisor requests sent BY the logged in student/leader (for cancel flow)
export const getMySentSupervisorRequests = asyncHandler(async (req, res) => {
  const leaderId = req.user._id;

  const requests = await Request.find({
    sender: leaderId,
    type: "SUPERVISOR_REQUEST"
  }).populate("receiver", "fullName email")
    .populate("group", "projectDetails _id");

  return res.status(200).json(new ApiResponse(200, requests, "Sent supervisor requests fetched successfully"));
});

// Respond to a supervisor request
export const respondToSupervisorRequest = asyncHandler(async (req, res) => {
  const { requestId, action, remarks } = req.body; // action: "ACCEPTED" or "REJECTED"
  const supervisorId = req.user._id;

  const request = await Request.findById(requestId);
  if (!request || request.type !== "SUPERVISOR_REQUEST") {
    throw new ApiError(404, "Supervisor request not found");
  }

  if (request.receiver.toString() !== supervisorId.toString()) {
    throw new ApiError(403, "You are not authorized to respond to this request");
  }

  if (request.status !== "PENDING") {
    throw new ApiError(400, `Request is already ${request.status}`);
  }

  const group = await Group.findById(request.group);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (remarks) {
    request.remarks = remarks;
  }

  if (action === "REJECTED") {
    request.status = "REJECTED";
    await request.save();
    
    group.status = "REJECTED";
    await group.save();
    
    return res.status(200).json(new ApiResponse(200, request, "Supervisor request rejected"));
  }

  if (action === "ACCEPTED") {
    const supervisor = await User.findById(supervisorId);
    
    if (supervisor.supervisorProfile?.groups?.length >= supervisor.supervisorProfile?.studentQuota) {
      throw new ApiError(400, "You have reached your maximum group quota");
    }

    if (group.supervisor) {
      throw new ApiError(400, "This group already has a supervisor");
    }

    // Accept request
    request.status = "ACCEPTED";
    await request.save();

    // Update group
    group.supervisor = supervisorId;
    group.status = "APPROVED";
    await group.save();

    // Update supervisor profile
    if (!supervisor.supervisorProfile) {
      supervisor.supervisorProfile = { groups: [], studentQuota: 5 }; // default fallback
    }
    supervisor.supervisorProfile.groups.push(group._id);
    await supervisor.save();

    // Reject any other pending requests for this group
    await Request.updateMany(
      { group: group._id, type: "SUPERVISOR_REQUEST", status: "PENDING" },
      { $set: { status: "REJECTED" } }
    );

    const updatedGroup = await Group.findById(group._id)
      .populate("leader", "fullName email studentProfile")
      .populate("members", "fullName email studentProfile")
      .populate("session", "name department settings fypMilestones startDate endDate");

    return res.status(200).json(new ApiResponse(200, updatedGroup, "Successfully accepted to be the supervisor of the group"));
  }

  throw new ApiError(400, "Invalid action. Use ACCEPTED or REJECTED");
});

// Submit a milestone
export const submitMilestone = asyncHandler(async (req, res) => {
  const { groupId, milestoneId } = req.params;
  const { submissionFiles, studentMessage } = req.body; // Array of {cloudinaryUrl, publicId, originalName}
  const userId = req.user._id;

  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }
  if(group.status!=="APPROVED"){
    throw new ApiError(403, "Group is not approved by the supervisor");
  }
  // Ensure only the leader can submit
  if (group.leader.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the group leader can submit milestones");
  }

  if (!submissionFiles || !Array.isArray(submissionFiles) || submissionFiles.length === 0) {
    throw new ApiError(400, "At least one submission file is required");
  }

  const milestone = group.milestones.id(milestoneId);
  if (!milestone) {
    throw new ApiError(404, "Milestone not found");
  }

  milestone.submissionFiles = submissionFiles;
  milestone.studentMessage = studentMessage || "";
  milestone.status = "SUBMITTED";

  await group.save();

  const updatedGroup = await Group.findById(group._id)
    .populate("leader", "fullName email studentProfile")
    .populate("members", "fullName email studentProfile")
    .populate("session", "name department settings fypMilestones startDate endDate");

  return res.status(200).json(new ApiResponse(200, updatedGroup, "Milestone submitted successfully"));
});

// Grade a milestone
export const gradeMilestone = asyncHandler(async (req, res) => {
  const { groupId, milestoneId } = req.params;
  const { action, remarks, grade } = req.body; // action: APPROVED or REJECTED
  const supervisorId = req.user._id;

  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (group.supervisor?.toString() !== supervisorId.toString()) {
    throw new ApiError(403, "You are not the supervisor of this group");
  }

  const milestone = group.milestones.id(milestoneId);
  if (!milestone) {
    throw new ApiError(404, "Milestone not found");
  }

  if (milestone.status === "PENDING") {
    throw new ApiError(400, "Cannot grade a milestone that hasn't been submitted yet");
  }

  if (action === "APPROVED" || action === "REJECTED") {
    milestone.status = action;
  } else {
    throw new ApiError(400, "Action must be APPROVED or REJECTED");
  }

  if (remarks) milestone.remarks = remarks;
  if (grade) milestone.grade = grade;

  await group.save();

  // Check if all milestones are approved to auto-complete the group (optional logic)
  const allApproved = group.milestones.every(m => m.status === "APPROVED");
  if (allApproved && group.milestones.length > 0) {
    group.status = "COMPLETED";
    await group.save();
  }

  const updatedGroup = await Group.findById(group._id)
    .populate("leader", "fullName email studentProfile")
    .populate("members", "fullName email studentProfile")
    .populate("supervisor", "fullName email supervisorProfile")
    .populate("internalEvaluator", "fullName email supervisorProfile")
    .populate("session", "name department settings fypMilestones startDate endDate");

  return res.status(200).json(new ApiResponse(200, updatedGroup, `Milestone ${action.toLowerCase()} successfully`));
});

export const assignInternalEvaluator = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { internalEvaluatorId } = req.body;
  const user = req.user;

  if (user.role !== "coordinator") {
    throw new ApiError(403, "Only coordinators can assign internal evaluators");
  }

  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (group.department !== user.department) {
    throw new ApiError(403, "Cannot modify groups from other departments");
  }

  if (internalEvaluatorId) {
    const evaluator = await User.findOne({ _id: internalEvaluatorId, role: "supervisor" });
    if (!evaluator) {
      throw new ApiError(404, "Supervisor not found");
    }

    if (group.supervisor?.toString() === internalEvaluatorId) {
      throw new ApiError(400, "The internal evaluator cannot be the group's own supervisor");
    }

    group.internalEvaluator = internalEvaluatorId;
  } else {
    group.internalEvaluator = undefined;
  }
  await group.save();

  const updatedGroup = await Group.findById(groupId)
    .populate("leader", "fullName email studentProfile")
    .populate("members", "fullName email studentProfile")
    .populate("supervisor", "fullName email supervisorProfile")
    .populate("internalEvaluator", "fullName email supervisorProfile")
    .populate("session", "name department settings fypMilestones startDate endDate");

  return res.status(200).json(new ApiResponse(200, updatedGroup, "Internal evaluator assigned successfully"));
});

