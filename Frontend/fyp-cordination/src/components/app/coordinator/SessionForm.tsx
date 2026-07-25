"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  FolderPlus,
  Plus,
  Settings2,
  Trash2,
  UploadCloud,
  FileIcon,
  X,
} from "lucide-react";
import { getFileIcon, downloadCloudinaryFile } from "@/lib/utils";
import type { CloudinaryFile } from "@/types/group.types";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEPARTMENTS } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Session } from "@/types/session.types";
import RepositoryFactory from "@/repository/RepositoryFactory";

export type SessionFormMilestone = {
  title: string;
  dueDate: string;
  description: string;
  documentFiles: CloudinaryFile[];
  localFiles?: File[];
};

export type SessionFormValues = {
  name: string;
  department: string;
  startDate: string;
  endDate: string;
  maxGroupSize: string;
  minGroupSize: string;
  groupsPerSupervisor: string;
  fypMilestones: SessionFormMilestone[];
};

export type SessionFormSubmitPayload = {
  name: string;
  department: string;
  startDate: string;
  endDate: string;
  settings: {
    maxGroupSize: number;
    minGroupSize: number;
    groupsPerSupervisor: number;
  };
  fypMilestones: SessionFormMilestone[];
};

export const DEFAULT_SESSION_FORM_VALUES: SessionFormValues = {
  name: "",
  department: "",
  startDate: "",
  endDate: "",
  maxGroupSize: "",
  minGroupSize: "",
  groupsPerSupervisor: "",
  fypMilestones: [
    {
      title: "",
      dueDate: "",
      description: "",
      documentFiles: [],
      localFiles: [],
    },
  ],
};

function toDateInputValue(value?: string) {
  return value ? value.slice(0, 10) : "";
}

export function mapSessionToFormValues(session: Session): SessionFormValues {
  return {
    name: session.name || "",
    department: session.department || "",
    startDate: toDateInputValue(session.startDate),
    endDate: toDateInputValue(session.endDate),
    maxGroupSize: String(session.settings?.maxGroupSize ?? ""),
    minGroupSize: String(session.settings?.minGroupSize ?? ""),
    groupsPerSupervisor: String(session.settings?.groupsPerSupervisor ?? ""),
    fypMilestones:
      session.fypMilestones && session.fypMilestones.length > 0
        ? session.fypMilestones.map((milestone) => ({
            title: milestone.title || "",
            dueDate: toDateInputValue(milestone.dueDate),
            description: milestone.description || "",
            documentFiles: milestone.documentFiles || [],
            localFiles: [],
          }))
        : [{ title: "", dueDate: "", description: "", documentFiles: [], localFiles: [] }],
  };
}

interface SessionFormProps {
  title: string;
  description: string;
  submitLabel: string;
  initialValues: SessionFormValues;
  isSubmitting?: boolean;
  onSubmit: (payload: SessionFormSubmitPayload) => Promise<void> | void;
  onCancel?: () => void;
  cancelLabel?: string;
}

function SessionForm({
  title,
  description,
  submitLabel,
  initialValues,
  isSubmitting = false,
  onSubmit,
  onCancel,
  cancelLabel = "Cancel",
}: SessionFormProps) {
  const [form, setForm] = useState<SessionFormValues>(initialValues);
  const [isUploadingLocal, setIsUploadingLocal] = useState(false);
  const isCurrentlySubmitting = isSubmitting || isUploadingLocal;

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  const isGroupSizeValid = useMemo(() => {
    const min = Number(form.minGroupSize);
    const max = Number(form.maxGroupSize);

    if (Number.isNaN(min) || Number.isNaN(max)) return false;
    if (min <= 0 || max <= 0) return false;

    return min <= max;
  }, [form.minGroupSize, form.maxGroupSize]);

  const isMilestonesValid = useMemo(
    () =>
      form.fypMilestones.length > 0 &&
      form.fypMilestones.every(
        (milestone) =>
          milestone.title.trim() &&
          milestone.description.trim() &&
          milestone.dueDate,
      ),
    [form.fypMilestones],
  );

  const isFormValid =
    form.name.trim() &&
    form.department.trim() &&
    form.startDate &&
    form.endDate &&
    form.groupsPerSupervisor &&
    isGroupSizeValid &&
    isMilestonesValid;

  const updateMilestone = (
    index: number,
    key: keyof SessionFormMilestone,
    value: any,
  ) => {
    setForm((previous) => ({
      ...previous,
      fypMilestones: previous.fypMilestones.map((milestone, idx) =>
        idx === index ? { ...milestone, [key]: value } : milestone,
      ),
    }));
  };

  const addMilestone = () => {
    setForm((previous) => ({
      ...previous,
      fypMilestones: [
        ...previous.fypMilestones,
        { title: "", dueDate: "", description: "", documentFiles: [], localFiles: [] },
      ],
    }));
  };

  const removeMilestone = (index: number) => {
    setForm((previous) => ({
      ...previous,
      fypMilestones: previous.fypMilestones.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid || isCurrentlySubmitting) return;

    setIsUploadingLocal(true);
    
    try {
      const uploadRepo = RepositoryFactory.get("upload");
      
      const finalMilestones = await Promise.all(
        form.fypMilestones.map(async (milestone) => {
          let newFiles: CloudinaryFile[] = [];
          if (milestone.localFiles && milestone.localFiles.length > 0) {
            const uploadPromises = milestone.localFiles.map(file => uploadRepo.uploadDocument(file));
            const results = await Promise.all(uploadPromises);
            newFiles = results.map(res => ({
              cloudinaryUrl: res.data.data.url,
              publicId: res.data.data.publicId,
              originalName: res.data.data.originalName,
            }));
          }
          return {
            title: milestone.title.trim(),
            dueDate: milestone.dueDate,
            description: milestone.description.trim(),
            documentFiles: [...(milestone.documentFiles || []), ...newFiles],
          };
        })
      );

      const payload: SessionFormSubmitPayload = {
        name: form.name.trim(),
        department: form.department.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        settings: {
          maxGroupSize: Number(form.maxGroupSize),
          minGroupSize: Number(form.minGroupSize),
          groupsPerSupervisor: Number(form.groupsPerSupervisor),
        },
        fypMilestones: finalMilestones,
      };

      await onSubmit(payload);
    } catch (err) {
      console.error("Failed to upload local files", err);
    } finally {
      setIsUploadingLocal(false);
    }
  };

  const handleFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setForm((previous) => ({
      ...previous,
      fypMilestones: previous.fypMilestones.map((milestone, idx) =>
        idx === index 
          ? { ...milestone, localFiles: [...(milestone.localFiles || []), ...files] } 
          : milestone
      ),
    }));
  };

  const removeLocalFile = (milestoneIndex: number, fileIndex: number) => {
    setForm((previous) => ({
      ...previous,
      fypMilestones: previous.fypMilestones.map((milestone, idx) =>
        idx === milestoneIndex 
          ? { ...milestone, localFiles: (milestone.localFiles || []).filter((_, i) => i !== fileIndex) } 
          : milestone
      ),
    }));
  };

  const removeFile = (milestoneIndex: number, publicIdToRemove: string) => {
    setForm((previous) => ({
      ...previous,
      fypMilestones: previous.fypMilestones.map((milestone, idx) =>
        idx === milestoneIndex
          ? { ...milestone, documentFiles: milestone.documentFiles.filter(f => f.publicId !== publicIdToRemove) }
          : milestone
      ),
    }));
  };

  return (
    <div className="w-full space-y-4">
      <Card className="w-full border-none shadow-lg/3">
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <FolderPlus className="size-4" />
            </div>
            <p>{title}</p>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <Separator />

        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="session-name">Session Name</Label>
                <Input
                  id="session-name"
                  placeholder="Fall 2026"
                  value={form.name}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  disabled={isCurrentlySubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-department">Department</Label>
                <Select
                  value={form.department}
                  onValueChange={(val) =>
                    setForm((previous) => ({ ...previous, department: val }))
                  }
                  disabled={isCurrentlySubmitting}
                >
                  <SelectTrigger id="session-department" className="w-full">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="session-start">Start Date</Label>
                <Input
                  id="session-start"
                  type="date"
                  icon={<CalendarDays />}
                  value={form.startDate}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      startDate: event.target.value,
                    }))
                  }
                  disabled={isCurrentlySubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-end">End Date</Label>
                <Input
                  id="session-end"
                  type="date"
                  icon={<CalendarDays />}
                  value={form.endDate}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      endDate: event.target.value,
                    }))
                  }
                  disabled={isCurrentlySubmitting}
                />
              </div>
            </div>

            <div className="rounded-xl p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <Settings2 className="size-4 text-primary" />
                <h3 className="text-sm font-semibold">Session Settings</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="max-group-size">Max Group Size</Label>
                  <Input
                    id="max-group-size"
                    type="number"
                    min={1}
                    value={form.maxGroupSize}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        maxGroupSize: event.target.value,
                      }))
                    }
                    disabled={isCurrentlySubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-group-size">Min Group Size</Label>
                  <Input
                    id="min-group-size"
                    type="number"
                    min={1}
                    value={form.minGroupSize}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        minGroupSize: event.target.value,
                      }))
                    }
                    disabled={isCurrentlySubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groups-per-supervisor">Groups Per Supervisor</Label>
                  <Input
                    id="groups-per-supervisor"
                    type="number"
                    min={1}
                    value={form.groupsPerSupervisor}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        groupsPerSupervisor: event.target.value,
                      }))
                    }
                    disabled={isCurrentlySubmitting}
                  />
                </div>
              </div>

              {!isGroupSizeValid ? (
                <p className="mt-3 text-xs text-destructive">
                  Minimum group size must be less than or equal to maximum group
                  size.
                </p>
              ) : null}
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              <div className="flex flex-wrap items-start">
                <h3 className="text-sm font-semibold">FYP Milestones</h3>
              </div>

              <div className="space-y-3">
                {form.fypMilestones.map((milestone, index) => (
                  <div
                    key={`milestone-${index}`}
                    className="space-y-3 rounded-lg border border-border/60 p-3"
                  >
                    <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                      <div className="space-y-2">
                        <Label htmlFor={`milestone-title-${index}`}>
                          Title
                        </Label>
                        <Input
                          id={`milestone-title-${index}`}
                          placeholder="Proposal Submission"
                          value={milestone.title}
                          onChange={(event) =>
                            updateMilestone(index, "title", event.target.value)
                          }
                          disabled={isCurrentlySubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`milestone-date-${index}`}>
                          Due Date
                        </Label>
                        <Input
                          id={`milestone-date-${index}`}
                          type="date"
                          value={milestone.dueDate}
                          onChange={(event) =>
                            updateMilestone(
                              index,
                              "dueDate",
                              event.target.value,
                            )
                          }
                          disabled={isCurrentlySubmitting}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`milestone-description-${index}`}>
                        Description
                      </Label>
                      <Textarea
                        id={`milestone-description-${index}`}
                        placeholder="Submit project proposal"
                        value={milestone.description}
                        onChange={(event) =>
                          updateMilestone(
                            index,
                            "description",
                            event.target.value,
                          )
                        }
                        disabled={isCurrentlySubmitting}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Documents & Attachments (Optional)</Label>
                      
                      {/* Modern File Upload Dropzone styled input */}
                      <div className="relative flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl border-border bg-card/50 hover:bg-accent/50 transition-colors cursor-pointer overflow-hidden group">
                        <input
                          id={`milestone-file-${index}`}
                          type="file"
                          multiple
                          onChange={(e) => handleFileSelect(index, e)}
                          disabled={isCurrentlySubmitting}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                        />
                        <div className="flex flex-col items-center justify-center pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                          <UploadCloud className="w-6 h-6 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                          <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                            Click or drag files to upload
                          </p>
                        </div>
                      </div>

                      {/* Display Selected Local Files */}
                      {milestone.localFiles && milestone.localFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {milestone.localFiles.map((file, fileIndex) => {
                            const Icon = getFileIcon(file.name);
                            return (
                              <div 
                                key={`local-${file.name}-${fileIndex}`}
                                className="flex items-center gap-2 pl-2 pr-1 py-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full group"
                              >
                                <Icon className="w-3 h-3" />
                                <span className="max-w-[120px] truncate" title={file.name}>
                                  {file.name}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="w-5 h-5 p-0 rounded-full hover:bg-primary/20 text-primary"
                                  onClick={() => removeLocalFile(index, fileIndex)}
                                  disabled={isCurrentlySubmitting}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Display Already Uploaded Files as Modern Chips */}
                      {milestone.documentFiles && milestone.documentFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {milestone.documentFiles.map((file, fileIndex) => {
                            const Icon = getFileIcon(file.originalName);
                            return (
                              <div 
                                key={`${file.publicId}-${fileIndex}`}
                                className="flex items-center gap-2 pl-2 pr-1 py-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full group"
                              >
                                <Icon className="w-3 h-3" />
                                <button
                                  type="button"
                                  className="max-w-[120px] truncate text-left hover:underline"
                                  title={file.originalName}
                                  onClick={() => downloadCloudinaryFile(file.cloudinaryUrl, file.originalName)}
                                >
                                  {file.originalName}
                                </button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="w-5 h-5 p-0 rounded-full hover:bg-primary/20 text-primary"
                                  onClick={() => removeFile(index, file.publicId)}
                                  disabled={isCurrentlySubmitting}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {form.fypMilestones.length > 1 ? (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeMilestone(index)}
                          disabled={isCurrentlySubmitting}
                        >
                          <Trash2 className="size-4" />
                          Remove
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="flex w-full justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addMilestone}
                  disabled={isCurrentlySubmitting}
                >
                  <Plus className="size-4" />
                  Add Milestone
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                size="lg"
                disabled={!isFormValid || isCurrentlySubmitting}
              >
                {isCurrentlySubmitting ? "Saving..." : submitLabel}
              </Button>
              {onCancel ? (
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isCurrentlySubmitting}
                >
                  {cancelLabel}
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SessionForm;
