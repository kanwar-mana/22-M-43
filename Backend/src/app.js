import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//Import Routes Here
import authRoutes from "./routes/auth.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import groupRoutes from "./routes/group.routes.js";
import usersRoutes from "./routes/users.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import coordinatorRoutes from "./routes/coordinator.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

//Use Routes Here
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1/groups", groupRoutes);
app.use("/api/v1/coordinator", usersRoutes);
app.use("/api/v1/coordinator", coordinatorRoutes);
app.use("/api/v1/upload", uploadRoutes);

app.use(errorHandler);

export { app };
