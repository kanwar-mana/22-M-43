import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const uploadDocument = asyncHandler(async (req, res) => {
  const localFilePath = req.file?.path;
  const originalName = req.file?.originalname;

  if (!localFilePath) {
    throw new ApiError(400, "No file uploaded");
  }

  const result = await uploadOnCloudinary(localFilePath, originalName);

  if (!result) {
    throw new ApiError(500, "File upload to Cloudinary failed");
  }

  return res.status(200).json(
    new ApiResponse(200, {
      url: result.secure_url,
      publicId: result.public_id,
      originalName: originalName,
    }, "File uploaded successfully")
  );
});
