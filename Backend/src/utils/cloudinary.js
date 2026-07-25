import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "svg"];

/**
 * Determines the Cloudinary resource_type from a filename.
 * Images → 'image', everything else (PDFs, DOCX, ZIP…) → 'raw'.
 */
const getResourceType = (filename) => {
  const ext = filename?.split(".").pop()?.toLowerCase() || "";
  return IMAGE_EXTS.includes(ext) ? "image" : "raw";
};

/**
 * Uploads a file to Cloudinary.
 *
 * - Uses resource_type 'image' for images, 'raw' for everything else (PDFs etc.)
 * - Stores under FYP_uploads/<safeName>_<timestamp> (no duplicate folder nesting)
 * - Cleans up the local multer temp file in a finally block (leak-proof)
 *
 * @param {string} localFilePath  Path to the multer temp file
 * @param {string} originalName   Original client filename (e.g. "report.pdf")
 * @returns {Promise<object|null>} Cloudinary response object, or null on failure
 */
const uploadOnCloudinary = async (localFilePath, originalName) => {
  try {
    if (!localFilePath) return null;

    const resourceType = getResourceType(originalName);

    // Build a clean, unique public_id — NO folder option so there is no nesting.
    const baseName = originalName
      ? originalName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_")
      : "file";
    const publicId = `FYP_uploads/${baseName}_${Date.now()}`;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
      public_id: publicId,
      overwrite: false,
    });

    return response; // contains: secure_url, public_id, resource_type, …
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  } finally {
    // Always clean up the local temp file, success or failure
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }
};

export { uploadOnCloudinary };