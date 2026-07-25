import { Flag, PauseCircle, FileIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Session } from "@/types/session.types";
import {
  formatDate,
  getDurationDays,
  getSessionLifecycle,
  getActivationState,
} from "@/lib/session.utils";
import { downloadCloudinaryFile } from "@/lib/utils";

interface SessionDetailsModalProps {
  session: Session | null;
  onClose: () => void;
}

export default function SessionDetailsModal({
  session,
  onClose,
}: SessionDetailsModalProps) {
  const isOpen = Boolean(session);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl!  border-border/70 p-0 sm:rounded-2xl">
        {session && (
          <>
            <div className="bg-muted/30 px-6 py-5">
              <DialogHeader>
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl tracking-tight">
                      {session.name}
                    </DialogTitle>
                    <DialogDescription>
                      {session.department || "Department not specified"}
                    </DialogDescription>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2 mt-6">
                    
                    <Badge
                      variant={getActivationState(session).variant}
                      className="h-6 gap-1.5"
                    >
                      {getActivationState(session).muted ? (
                        <PauseCircle className="size-3.5" />
                      ) : (
                        <Flag className="size-3.5" />
                      )}
                      {getActivationState(session).label}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "Start Date",
                    value: formatDate(session.startDate),
                  },
                  {
                    label: "End Date",
                    value: formatDate(session.endDate),
                  },
                  {
                    label: "Duration",
                    value: getDurationDays(session.startDate, session.endDate),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl border bg-background/80 p-3"
                  >
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <Card className="border-dashed shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Session Settings</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Min Group Size</p>
                    <p className="font-medium">
                      {session.settings?.minGroupSize ?? "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Max Group Size</p>
                    <p className="font-medium">
                      {session.settings?.maxGroupSize ?? "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Groups Per Supervisor
                    </p>
                    <p className="font-medium">
                      {session.settings?.groupsPerSupervisor ?? "-"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                <div className="flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur py-1 z-10">
                  <Flag className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold">Milestones</h3>
                </div>

                {(session.fypMilestones || []).length > 0 ? (
                  <div className="space-y-2">
                    {(session.fypMilestones || []).map((milestone, index) => (
                      <div
                        key={
                          milestone._id ||
                          milestone.id ||
                          `milestone-${index}`
                        }
                        className="rounded-xl border bg-background/80 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium">{milestone.title}</p>
                          <Badge variant="outline">
                            {formatDate(milestone.dueDate)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {milestone.description || "No description provided"}
                        </p>

                        {/* Display Multiple Uploaded Files with File Icon */}
                        {milestone.documentFiles && milestone.documentFiles.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {milestone.documentFiles.map((file, fileIndex) => (
                              <button
                                key={fileIndex}
                                type="button"
                                onClick={() => downloadCloudinaryFile(file.cloudinaryUrl, file.originalName)}
                                className="flex items-center gap-1.5 px-2 py-1 text-xs bg-primary/10 text-primary hover:bg-primary/20 hover:underline border border-primary/20 rounded-md transition-colors cursor-pointer text-left"
                                title={file.originalName}
                              >
                                <FileIcon className="w-3 h-3" />
                                <span className="max-w-[150px] truncate">{file.originalName}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    No milestones configured for this session.
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="border-t px-6 py-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
