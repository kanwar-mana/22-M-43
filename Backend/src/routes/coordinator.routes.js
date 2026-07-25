import { Router } from "express";
import {
  allowSupervisorEmail,
  getAllowedSupervisors,
  removeAllowedSupervisor,
} from "../controllers/coordinator.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

// Coordinator manages supervisor whitelist
router.route("/allow-supervisor").post(allowSupervisorEmail);
router.route("/allowed-supervisors").get(getAllowedSupervisors);
router.route("/allowed-supervisors/:id").delete(removeAllowedSupervisor);

export default router;
