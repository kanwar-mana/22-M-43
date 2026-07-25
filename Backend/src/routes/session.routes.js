import { Router } from "express";
import {
  createSession,
  updateSession,
  getSession,
  deleteSession,
  changeActivation,
} from "../controllers/session.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/create-session").post(createSession);
router.route("/").get(getSession);
router.route("/update-session/:sessionId").patch(updateSession);
router.route("/delete-session/:sessionId").delete(deleteSession);
router.route("/change-activation/:sessionId").patch(changeActivation);

export default router;
