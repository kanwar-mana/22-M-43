import { Router } from "express";
import { uploadDocument } from "../controllers/upload.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, upload.single("file"), uploadDocument);

export default router;
