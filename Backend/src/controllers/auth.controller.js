import asyncHandler from "../utils/asyncHandler.js";
import { UAParser } from "ua-parser-js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { UserSession } from "../models/userSession.model.js";
import { AllowedSupervisor } from "../models/allowedSupervisor.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  sendVerificationSuccessEmail,
} from "../mails/emailMethods.js";
import jwt from "jsonwebtoken";

const accessOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 1000 * 60 * 15, // 15 minutes
};

const refreshOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
};

const generateAccessAndRefreshToken = async (
  userId,
  deviceInfo = "Unknown Device",
  ipAddress = ""
) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Calculate refresh token expiry (30 days)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create a new session for this device

    await UserSession.create({
      userId: user._id,
      refreshToken,
      deviceInfo,
      ipAddress,
      expiresAt,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating Access and Refresh tokens");
  }
};
const verificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const signupUser = asyncHandler(async (req, res) => {
  //Get user data from req.body
  //Check if user data fields is empty or not
  //Check if user already exists - with username or email
  //Create new user object- new entry in DB
  //Remove password & refresh token field from response
  //Check if user created successfully
  //Send response with created user data

  const { email, password, fullName, role, department } = req.body;

  if (
    [role, fullName, email, password, department].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (role === "coordinator" && normalizedEmail.includes("@students.")) {
    throw new ApiError(403, "Students are not allowed to register as coordinators.");
  }

  // Check supervisor whitelist
  if (role === "supervisor") {
    const isAllowed = await AllowedSupervisor.findOne({
      email: email.trim().toLowerCase(),
      department: department
    });
    
    if (!isAllowed) {
      throw new ApiError(403, "This email is not authorized to register as a supervisor for this department. Please contact your coordinator.");
    }
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.isVerified) {
      throw new ApiError(400, "User with this email already exists");
    }

    let coordinatorId = null;
    if (role === "student" || role === "supervisor") {
      const coordinator = await User.findOne({ role: "coordinator", department });
      if (coordinator) {
        coordinatorId = coordinator._id;
      }
    }

    // If user exists but not verified, resend verification email
    existingUser.fullName = fullName;
    existingUser.role = role;
    existingUser.password = password;
    existingUser.department = department;
    existingUser.verificationCode = verificationCode();
    existingUser.verificationCodeExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (coordinatorId) {
      if (role === "student") {
        existingUser.studentProfile = { ...existingUser.studentProfile, coordinator: coordinatorId };
      } else if (role === "supervisor") {
        existingUser.supervisorProfile = { ...existingUser.supervisorProfile, coordinator: coordinatorId };
      }
    }

    await existingUser.save();

    await sendVerificationEmail(
      existingUser.email,
      existingUser.fullName,
      existingUser.verificationCode
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "User already exists but not verified. A new verification code has been sent to your email.",
          "RESEND_VERIFICATION_EMAIL"
        )
      );
  }

  let coordinatorId = null;
  if (role === "student" || role === "supervisor") {
    const coordinator = await User.findOne({ role: "coordinator", department });
    if (coordinator) {
      coordinatorId = coordinator._id;
    }
  }

  const userData = {
    email,
    password,
    fullName,
    department,
    role,
    verificationCode: verificationCode(),
    verificationCodeExpiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  };

  if (coordinatorId) {
    if (role === "student") {
      userData.studentProfile = { coordinator: coordinatorId };
    } else if (role === "supervisor") {
      userData.supervisorProfile = { coordinator: coordinatorId, groups: [], studentQuota: 5 };
    }
  }

  const user = await User.create(userData);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -verificationCode -verificationCodeExpiresAt -studentProfile -supervisorProfile"
  );
  
  if (!createdUser) {
    throw new ApiError(500, "User creation in DB failed");
  }

  try {
    await sendVerificationEmail(user.email, user.fullName, userData.verificationCode);
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw new ApiError(500, error.message || "Failed to send verification email. Registration rolled back.");
  }

  if (role === "supervisor") {
    await AllowedSupervisor.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { used: true }
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdUser,
        "Registration successful. Please check your email for verification code."
      )
    );
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, verificationCode, token } = req.body;
  const code = verificationCode || token;
  console.log(email, code);
  if ([email, code].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Email and verification code are required");
  }
  const user = await User.findOneAndUpdate(
    {
      email,
      verificationCode: code,
      verificationCodeExpiresAt: { $gt: Date.now() },
      isVerified: false,
    },
    {
      $set: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    },
    { new: true }
  );

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification code");
  }
  
  // Send the welcome/verification success email asynchronously
  sendVerificationSuccessEmail(user.email, user.fullName).catch(err => {
    console.error("Failed to send verification success email:", err);
  });

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -verificationCode -verificationCodeExpiresAt"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, loggedInUser, "Email verified successfully"));
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "User is already verified");
  }

  // Generate new verification code
  const newVerificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  
  user.verificationCode = newVerificationCode;
  user.verificationCodeExpiresAt = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  await sendVerificationEmail(user.email, user.fullName, newVerificationCode);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Verification code resent successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if ([email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "User don't exist with this email");
  }
  if (!user.isVerified) {
    throw new ApiError(
      401,
      "Email is not verified. Please verify your email before logging in."
    );
  }
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  let ipAddress =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
  if (ipAddress.includes(",")) {
    ipAddress = ipAddress.split(",")[0].trim();
  }
  // Normalize IPv6 localhost
  if (ipAddress === "::1") ipAddress = "127.0.0.1";
  const rawUserAgent = req.headers["user-agent"];
  const parser = new UAParser(rawUserAgent);
  const result = parser.getResult();

  // Convert to readable string matches your Schema type: String
  const deviceInfo = `${result.browser.name || "Unknown Browser"} on ${result.os.name || "Unknown OS"}${result.device.type ? ` (${result.device.type})` : ""}`;

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
    deviceInfo,
    ipAddress
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessOptions)
    .cookie("refreshToken", refreshToken, refreshOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User Logged in successfully"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  // Delete only this device's session from DB
  if (refreshToken) {
    try {
      await UserSession.findOneAndDelete({ refreshToken });
    } catch (err) {
      console.log("Error deleting session:", err.message);
    }
  }

  return res
    .status(200)
    .clearCookie("accessToken", accessOptions)
    .clearCookie("refreshToken", refreshOptions)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

// Logout from all devices
export const logoutAllDevices = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Delete all sessions for this user
  await UserSession.deleteMany({ userId });

  return res
    .status(200)
    .clearCookie("accessToken", accessOptions)
    .clearCookie("refreshToken", refreshOptions)
    .json(
      new ApiResponse(200, null, "Logged out from all devices successfully")
    );
});

// Get all active sessions for a user
export const getActiveSessions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const currentRefreshToken = req.cookies?.refreshToken;

  const sessions = await UserSession.find({ userId })
    .select("deviceInfo ipAddress lastActive createdAt")
    .sort({ lastActive: -1 });

  // Mark the current session
  const sessionsWithCurrent = sessions.map((session) => {
    const sessionObj = session.toObject();
    // We can't directly compare tokens, but we can mark by checking the current session
    return sessionObj;
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { sessions: sessionsWithCurrent },
        "Active sessions fetched"
      )
    );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { user: req.user }, "User fetched"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized: No refresh token provided");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find the session with this refresh token
    const session = await UserSession.findOne({
      refreshToken: incomingRefreshToken,
      userId: decodedToken._id,
    });

    if (!session) {
      throw new ApiError(401, "Unauthorized: Session expired or invalid");
    }

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Unauthorized: User not found");
    }

    // Generate new access token only (keep same refresh token for this session)
    const accessToken = user.generateAccessToken();

    // Update last active time for this session
    session.lastActive = new Date();
    await session.save();

    const safeUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, accessOptions)
      .cookie("refreshToken", incomingRefreshToken, refreshOptions)
      .json(
        new ApiResponse(
          200,
          { user: safeUser, accessToken, refreshToken: incomingRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    // Clear cookies on error
    return res
      .status(401)
      .clearCookie("accessToken", accessOptions)
      .clearCookie("refreshToken", refreshOptions)
      .json(new ApiResponse(401, null, "Session expired. Please login again."));
  }
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email || email.trim() === "") {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists or not for security
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "If an account exists with this email, you will receive a password reset code."
        )
      );
  }

  // Generate reset token (6-digit code)
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  // Build reset URL
  const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
  const resetURL = `${frontendURL}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

  // Send reset email with URL
  await sendPasswordResetEmail(user.email, user.fullName, resetURL);

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Password reset code sent to your email.")
    );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    throw new ApiError(
      400,
      "Email, reset token, and new password are required"
    );
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long");
  }

  const user = await User.findOne({
    email,
    resetPasswordToken: token,
    resetPasswordExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  // Update password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  // Invalidate all existing sessions for security
  await UserSession.deleteMany({ userId: user._id });

  // Send success email
  await sendPasswordResetSuccessEmail(user.email, user.fullName);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Password reset successful. Please login with your new password."
      )
    );
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long");
  }

  const user = await User.findById(req.user._id);

  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  const currentRefreshToken = req.cookies?.refreshToken;
  if (currentRefreshToken) {
    await UserSession.deleteMany({
      userId: user._id,
      refreshToken: { $ne: currentRefreshToken },
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password updated successfully."));
});
