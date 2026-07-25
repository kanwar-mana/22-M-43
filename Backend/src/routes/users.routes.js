import { Router } from "express";
import {
  getDepartmentSupervisors,
  getDepartmentStudents,
} from "../controllers/users.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/supervisors").get(getDepartmentSupervisors);
router.route("/students").get(getDepartmentStudents);

export default router;
