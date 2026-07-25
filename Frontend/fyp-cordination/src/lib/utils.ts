import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  File as FileIcon,
} from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Returns an appropriate Lucide icon component based on file extension. */
export const getFileIcon = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return ImageIcon;
  if (["pdf", "txt", "csv", "doc", "docx"].includes(ext)) return FileText;
  if (["xls", "xlsx"].includes(ext)) return FileSpreadsheet;
  if (["zip", "rar", "tar", "gz"].includes(ext)) return FileArchive;
  if (["json", "js", "ts", "html", "css", "jsx", "tsx"].includes(ext)) return FileCode;
  return FileIcon;
};

/**
 * Downloads a Cloudinary file using the fetch → Blob → object URL approach.
 *
 * Why fetch+blob instead of <a href target="_blank">?
 * - `a.download` is IGNORED by browsers for cross-origin URLs (security restriction).
 * - Using a Blob URL (blob:) makes it same-origin, so `a.download = originalName`
 *   correctly sets the saved filename including extension.
 * - This approach also works for raw files (PDFs, DOCX, etc.) without needing
 *   Cloudinary URL transformations (which can cause 400 errors on raw resources).
 *
 * @param cloudinaryUrl  The secure_url returned by Cloudinary
 * @param originalName   The original filename (e.g. "report.pdf") used as the download filename
 */
export const downloadCloudinaryFile = async (
  cloudinaryUrl: string,
  originalName: string
): Promise<void> => {
  try {
    const response = await fetch(cloudinaryUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = originalName; // Works because objectUrl is same-origin (blob:)
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl); // Free memory immediately after click
  } catch (error) {
    console.error("File download failed:", error);
  }
};
