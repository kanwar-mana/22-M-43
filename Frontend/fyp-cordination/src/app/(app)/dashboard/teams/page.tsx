"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, UsersRound } from "lucide-react";
import { useAppSelector } from "@/store/hooks";

export default function Team() {
  const { currentGroup } = useAppSelector((s) => s.group);

  if (!currentGroup) {
    return (
      <div className="container mx-auto h-[60vh] flex flex-col items-center justify-center text-muted-foreground">
        <UsersRound className="w-16 h-16 mb-4 text-muted/40" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No Team Found</h2>
        <p className="text-sm">You are not part of any project group yet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto pb-10">
      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Team Members</h2>
          </div>
          <div className="text-xs text-muted-foreground">
            {currentGroup.members.length} / {currentGroup.requiredMembers} Members
          </div>
        </div>
        
        {currentGroup.members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <UsersRound className="w-12 h-12 mb-4 text-muted/40" />
            <p className="text-sm">No members in this team.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentGroup.members.map((member: any) => {
              const isLeader = member._id === currentGroup.leader?._id || member._id === currentGroup.leader;
              return (
                <div
                  key={member._id}
                  className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold uppercase">
                      {member.fullName
                        ? member.fullName
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .substring(0, 2)
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{member.fullName}</p>
                    <p className="text-sm text-primary">{isLeader ? "Team Lead" : "Member"}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
