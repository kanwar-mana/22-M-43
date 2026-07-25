"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getSupervisors } from "@/store/user/userThunk";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Mail,
  Phone,
  Users,
  MoreVertical,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function SupervisorsPage() {
  const dispatch = useAppDispatch();
  const supervisors = useAppSelector((state: any) => state.user.supervisors);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    dispatch(getSupervisors())
      .unwrap()
      .finally(() => setLoading(false));
  }, [dispatch]);

  const filteredSupervisors = useMemo(() => {
    if (!searchQuery.trim()) return supervisors;
    return supervisors.filter(
      (sup: any) =>
        (sup.fullName || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (sup.email || "").toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [supervisors, searchQuery]);

  // Helper to extract initials like "Kanwer Abdull Rahman" -> "KAR"
  const getInitials = (fullName: string = "") => {
    if (!fullName) return "S";
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supervisors</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all registered supervisors.
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search supervisors..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-32" />
            </Card>
          ))}
        </div>
      ) : filteredSupervisors.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredSupervisors.map((supervisor: any) => (
            <Card
              key={supervisor._id}
              className="transition-all hover:shadow-md"
            >
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/10">
                      <AvatarImage
                        src={supervisor.profileImage}
                        alt={supervisor.fullName}
                      />
                      <AvatarFallback className="bg-primary/5 text-primary text-xl font-medium">
                        {getInitials(supervisor.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 overflow-hidden">
                      <h3 className="font-semibold text-lg truncate">
                        {supervisor.fullName}
                      </h3>
                      <Badge variant="secondary" className="font-normal">
                        Supervisor
                      </Badge>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="-mr-2 -mt-2"
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedSupervisor(supervisor);
                          setIsDetailsOpen(true);
                        }}
                      >
                        <Eye className="size-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive">
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">
                      {supervisor.email || "No email provided"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Groups Capacity</span>
                      <span>
                        {Math.min(
                          supervisor.supervisorProfile?.groups?.length || 0,
                          5,
                        )}{" "}
                        / 5
                      </span>
                    </div>
                    <Progress
                      value={
                        ((supervisor.supervisorProfile?.groups?.length || 0) /
                          5) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 border rounded-lg bg-card/50 border-dashed">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No supervisors found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery
              ? "Try adjusting your search query."
              : "No supervisors are currently registered in the system."}
          </p>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supervisor Details</DialogTitle>
            <DialogDescription>
              View detailed information and capacity metrics.
            </DialogDescription>
          </DialogHeader>

          {selectedSupervisor && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/10">
                  <AvatarImage src={selectedSupervisor.profileImage} />
                  <AvatarFallback className="bg-primary/5 text-primary text-xl font-medium">
                    {getInitials(selectedSupervisor.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-xl">
                    {selectedSupervisor.fullName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedSupervisor.department}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Contact Information</h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedSupervisor.email}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Groups Capacity</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Currently Supervising
                    </span>
                    <span className="font-medium">
                      {Math.min(
                        selectedSupervisor.supervisorProfile?.groups?.length ||
                          0,
                        5,
                      )}{" "}
                      / 5 Groups
                    </span>
                  </div>
                  <Progress
                    value={
                      ((selectedSupervisor.supervisorProfile?.groups?.length ||
                        0) /
                        5) *
                      100
                    }
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedSupervisor.supervisorProfile?.groups?.length >= 5
                      ? "This supervisor has reached maximum capacity."
                      : `Can accept ${5 - (selectedSupervisor.supervisorProfile?.groups?.length || 0)} more group(s).`}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
