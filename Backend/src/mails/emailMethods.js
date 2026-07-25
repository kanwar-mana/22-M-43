import { resend, Sender } from "./resend.config.js";
import { ApiError } from "../utils/ApiError.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_SUCCESS_TEMPLATE,
} from "./emailTemplate.js";

export const sendVerificationEmail = async (
  email,
  fullName,
  verificationCode
) => {
  try {
    const response = await resend.emails.send({
      from: Sender,
      to: email,
      subject: "Verify your email address",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{fullName}", fullName).replace(
        "{verificationCode}",
        verificationCode
      ),
    });
    
    if (response.error) {
      console.error("Resend API Error:", response.error);
      throw new Error(response.error.message || "Resend failed to send email");
    }
    
    console.log("Verification email sent:", response);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new ApiError(500, error.message || "Failed to send verification email");
  }
};

export const sendPasswordResetEmail = async (email, fullName, resetURL) => {
  try {
    const response = await resend.emails.send({
      from: Sender,
      to: email,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace(
        "{fullName}",
        fullName
      ).replaceAll("{resetURL}", resetURL),
    });
    
    if (response.error) {
      console.error("Resend API Error:", response.error);
      throw new Error(response.error.message || "Resend failed to send email");
    }
    
    console.log("Password reset email sent:", response);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new ApiError(500, error.message || "Failed to send password reset email");
  }
};

export const sendPasswordResetSuccessEmail = async (email, fullName) => {
  try {
    const response = await resend.emails.send({
      from: Sender,
      to: email,
      subject: "Password reset successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE.replace("{fullName}", fullName),
    });
    
    if (response.error) {
      console.error("Resend API Error:", response.error);
      throw new Error(response.error.message || "Resend failed to send email");
    }
    
    console.log("Password reset success email sent:", response);
  } catch (error) {
    console.error("Error sending password reset success email:", error);
    // Don't throw error for success email, it's not critical
  }
};

export const sendVerificationSuccessEmail = async (email, fullName) => {
  try {
    const response = await resend.emails.send({
      from: Sender,
      to: email,
      subject: "Account Verified Successfully",
      html: VERIFICATION_SUCCESS_TEMPLATE.replace("{fullName}", fullName),
    });
    
    if (response.error) {
      console.error("Resend API Error:", response.error);
      throw new Error(response.error.message || "Resend failed to send email");
    }
    
    console.log("Verification success email sent:", response);
  } catch (error) {
    console.error("Error sending verification success email:", error);
    // Don't throw error for success email, it's not critical
  }
};
