"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Milestone, CloudinaryFile } from "@/types/group.types";
import { UploadCloud, FileIcon, X } from "lucide-react";
import RepositoryFactory from "@/repository/RepositoryFactory";
import { getFileIcon } from "@/lib/utils";

interface MilestoneSubmissionFormProps {
  milestone: Milestone;
  onSubmit: (payload: { submissionFiles: CloudinaryFile[], studentMessage: string }) => Promise<void>;
  isLoading?: boolean;
}

export default function MilestoneSubmissionForm({ milestone, onSubmit, isLoading = false }: MilestoneSubmissionFormProps) {
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [studentMessage, setStudentMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localFiles.length === 0) return;

    setIsUploading(true);
    try {
      const uploadRepo = RepositoryFactory.get("upload");
      const uploadPromises = localFiles.map(file => uploadRepo.uploadDocument(file));
      const results = await Promise.all(uploadPromises);
      const newFiles: CloudinaryFile[] = results.map(res => ({
        cloudinaryUrl: res.data.data.url,
        publicId: res.data.data.publicId,
        originalName: res.data.data.originalName,
      }));
      
      await onSubmit({ submissionFiles: newFiles, studentMessage });
      setLocalFiles([]);
    } catch (err) {
      console.error("Failed to upload documents", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setLocalFiles(prev => [...prev, ...files]);
  };

  const removeFile = (indexToRemove: number) => {
    setLocalFiles(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const isSubmitting = isLoading || isUploading;

  return (
    <div className="space-y-4 rounded-xl border border-border/50 bg-card/60 p-5">
      <div className="mb-2">
        <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-primary" />
          Submit Milestone
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your documents and add an optional message for your supervisor.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <FileIcon className="w-3.5 h-3.5 text-muted-foreground" />
            Documents & Attachments
          </Label>
          
          {/* File Upload Dropzone */}
          <div className="relative flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer overflow-hidden group">
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              disabled={isSubmitting || milestone.status === "APPROVED"}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center justify-center pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 mb-3 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UploadCloud className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {isUploading ? "Uploading..." : "Click or drag files to upload"}
              </p>
            </div>
          </div>

          {/* Display Selected Files */}
          {localFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {localFiles.map((file, i) => {
                const Icon = getFileIcon(file.name);
                return (
                  <div 
                    key={`${file.name}-${i}`}
                    className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full group shadow-sm"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="max-w-[140px] font-medium truncate" title={file.name}>
                      {file.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-5 h-5 p-0 rounded-full hover:bg-primary/20 text-primary"
                      onClick={() => removeFile(i)}
                      disabled={isSubmitting}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Message (Optional)</Label>
          <Textarea 
            placeholder="Add any remarks for your supervisor..." 
            value={studentMessage}
            onChange={(e) => setStudentMessage(e.target.value)}
            disabled={isSubmitting || milestone.status === "APPROVED"}
            className="resize-none min-h-[90px] text-sm"
          />
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full sm:w-auto"
            disabled={isSubmitting || milestone.status === "APPROVED" || localFiles.length === 0}
          >
            {isLoading ? "Submitting..." : milestone.status === "APPROVED" ? "Already Approved" : "Submit Milestone"}
          </Button>
        </div>
      </form>
    </div>
  );
}
