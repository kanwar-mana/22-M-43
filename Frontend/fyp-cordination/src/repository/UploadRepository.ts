import apiClient from "./index";
import { ApiResponse } from "@/types/auth.types";
import { UploadResponse } from "@/types/upload.types";

const UPLOAD_BASE = "/upload";

export default {
  // Upload a document (multipart/form-data)
  uploadDocument(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post<ApiResponse<UploadResponse>>(UPLOAD_BASE, formData);
  },
};
