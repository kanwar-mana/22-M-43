"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAllGroups } from "@/store/group/groupThunk";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Mail, BookOpen, Crown, Loader2, Users } from "lucide-react";

export default function SupervisorStudents() {
  const dispatch = useAppDispatch();
  const { allGroups, isLoading } = useAppSelector((state) => state.group);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(getAllGroups());
  }, [dispatch]);

  // Extract and deduplicate students from active groups
  const activeGroups = allGroups.filter((g) => g.status === "APPROVED" || g.status === "COMPLETED");
  
  const allStudents = activeGroups.flatMap((group) => {
    return group.members.map((member: any) => ({
      ...member,
      isLeader: member._id === group.leader._id,
      groupTitle: group.projectDetails.title,
      groupDomain: group.projectDetails.domain,
    }));
  });

  const filteredStudents = allStudents.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.groupTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name?: string) =>
    (name || "?").split(" ").map((w) => w[0] || "").join("").substring(0, 2).toUpperCase();

  return (
    <div className="container mx-auto space-y-6 md:p-6 mt-2">
      <div className="flex flex-col md:flex-row gap-4 md:items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
          <p className="text-muted-foreground mt-2">
            You are currently supervising {allStudents.length} students across {activeGroups.length} active projects.
          </p>
        </div>
        
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
      </div>

      {isLoading && allGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
          <p>Loading students directory...</p>
        </div>
      ) : allStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed rounded-xl bg-muted/10">
          <Users className="w-12 h-12 text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No students found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            You aren't supervising any approved students yet.
          </p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No students match your search query "{searchQuery}".
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStudents.map((student) => (
            <Card key={student._id} className="overflow-hidden border-border/60 bg-card/70 hover:bg-card transition-all hover:shadow-md hover:border-primary/20">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {getInitials(student.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  {student.isLeader && (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20 px-2 py-0 h-6 gap-1">
                      <Crown className="w-3 h-3" />
                      Leader
                    </Badge>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg leading-tight truncate">{student.fullName}</h3>
                  <a href={`mailto:${student.email}`} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 mt-1 truncate">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{student.email}</span>
                  </a>
                </div>
              </div>
              
              <div className="px-5 py-3 bg-muted/30 border-t border-border/50 text-xs">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <BookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary/70" />
                  <div>
                    <span className="font-medium text-foreground line-clamp-1">{student.groupTitle}</span>
                    <span className="text-[10px] uppercase tracking-wider">{student.groupDomain}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
