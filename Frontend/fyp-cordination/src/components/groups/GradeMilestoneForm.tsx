"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Milestone, GradeMilestonePayload } from "@/types/group.types";
import { FileIcon } from "lucide-react";
import { downloadCloudinaryFile } from "@/lib/utils";

interface GradeMilestoneFormProps {
  milestone: Milestone;
  onGrade: (payload: GradeMilestonePayload) => Promise<void>;
  isLoading?: boolean;
}

// Component for supervisors to grade a submitted milestone
export default function GradeMilestoneForm({ milestone, onGrade, isLoading = false }: GradeMilestoneFormProps) {
  const [remarks, setRemarks] = useState(milestone.remarks || "");
  const [grade, setGrade] = useState(milestone.grade || "");

  // Handles the submission of the grade evaluation
  const handleGrade = async (action: "APPROVED" | "REJECTED") => {
    await onGrade({ action, remarks, grade });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluate Milestone: {milestone.title}</CardTitle>
        <CardDescription>Review the submission and provide a grade or remarks.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {milestone.studentMessage && (
          <div className="p-4 bg-muted/50 rounded-lg mb-4 border border-border/50">
            <span className="font-semibold text-sm mb-1 block text-primary">Student Message:</span>
            <p className="text-sm text-muted-foreground italic">"{milestone.studentMessage}"</p>
          </div>
        )}

        {milestone.submissionFiles && milestone.submissionFiles.length > 0 && (
          <div className="mb-4">
            <span className="font-medium text-sm mb-2 block">Submitted Documents:</span>
            <div className="flex flex-wrap gap-2">
              {milestone.submissionFiles.map((file, index) => (
                <button 
                  key={index} 
                  type="button"
                  onClick={() => downloadCloudinaryFile(file.cloudinaryUrl, file.originalName)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 hover:underline border border-primary/20 rounded-full transition-colors group cursor-pointer"
                >
                  <FileIcon className="w-3.5 h-3.5" />
                  <span className="max-w-[200px] truncate" title={file.originalName}>
                    {file.originalName}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Grade (Optional)</Label>
            <Input 
              placeholder="e.g. A, 85/100, Pass" 
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Remarks</Label>
          <Textarea 
            placeholder="Provide feedback on the submission..." 
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button 
            onClick={() => handleGrade("APPROVED")} 
            disabled={isLoading || milestone.status !== "SUBMITTED"}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Approve Milestone
          </Button>
          <Button 
            onClick={() => handleGrade("REJECTED")} 
            disabled={isLoading || milestone.status !== "SUBMITTED"}
            variant="destructive" 
            className="w-full"
          >
            Reject Milestone
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
