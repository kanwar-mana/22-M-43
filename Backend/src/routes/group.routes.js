import { Router } from "express";
import {
  createGroup,
  getAllGroups,
  getGroup,
  //   getMyGroup,
  deleteGroup,
  inviteStudent,
  respondToInvitation,
  removeFromGroup,
  leaveGroup,
  cancelSupervisorRequest,
  sendSupervisorRequest,
  respondToSupervisorRequest,
  getMyInvitations,
  getMySupervisorRequests,
  getMySentSupervisorRequests,
  getSupervisors,
  getAvailableStudents,
  submitMilestone,
  gradeMilestone,
  updateGroupDetails,
  assignInternalEvaluator,
} from "../controllers/group.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/create-group").post(createGroup);
router.route("/:groupId/update").put(updateGroupDetails);
router.route("/:groupId/assign-evaluator").patch(assignInternalEvaluator);
router.route("/all-groups").get(getAllGroups);
router.route("/available-students").get(getAvailableStudents);
router.route("/my-invitations").get(getMyInvitations);

router.route("/delete-group/:groupId").delete(deleteGroup);
router.route("/remove-member").post(removeFromGroup);
router.route("/leave-group/:groupId").post(leaveGroup);
router.route("/cancel-supervisor-request/:requestId").delete(cancelSupervisorRequest);
router.route("/invite-student").post(inviteStudent);
router.route("/respond-invitation").post(respondToInvitation);

// Supervisor Endpoints
router.route("/supervisors").get(getSupervisors);
router.route("/send-supervisor-request").post(sendSupervisorRequest);
router.route("/my-supervisor-requests").get(getMySupervisorRequests);
router.route("/my-sent-supervisor-requests").get(getMySentSupervisorRequests);
router.route("/respond-supervisor-request").post(respondToSupervisorRequest);

// Milestone Endpoints
router.route("/:groupId/milestones/:milestoneId/submit").post(submitMilestone);
router.route("/:groupId/milestones/:milestoneId/grade").post(gradeMilestone);

// Dynamic routes should be at the end
router.route("/:groupId").get(getGroup);

export default router;
