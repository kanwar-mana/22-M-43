"use client";

import { Group } from "@/types/group.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface GroupDetailsProps {
  group: Group;
}

// Component to display readonly group information
export default function GroupDetails({ group }: GroupDetailsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{group.projectDetails.title}</CardTitle>
            <CardDescription className="mt-2">
              {group.department} • {group.session.name}
            </CardDescription>
          </div>
          <Badge variant={group.status === "APPROVED" ? "default" : "secondary"}>
            {group.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Description</h3>
          <p className="text-muted-foreground">{group.projectDetails.description}</p>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="space-y-1">
            <p className="text-sm font-medium">Domain</p>
            <Badge variant="outline">{group.projectDetails.domain}</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Technologies</p>
            <div className="flex gap-2 flex-wrap">
              {group.projectDetails.technologies.map((tech, i) => (
                <Badge key={i} variant="secondary">{tech}</Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Team Members ({group.members.length}/{group.requiredMembers})</h3>
            <ul className="space-y-2">
              {group.members.map((member) => (
                <li key={member._id} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                  <div>
                    <p className="font-medium">{member.fullName}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  {member._id === group.leader._id && <Badge>Leader</Badge>}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Supervisor</h3>
            {group.supervisor ? (
              <div className="p-3 bg-muted/50 rounded-md">
                <p className="font-medium">{group.supervisor.fullName}</p>
                <p className="text-xs text-muted-foreground">{group.supervisor.email}</p>
              </div>
            ) : (
              <div className="p-3 border border-dashed rounded-md text-center text-muted-foreground">
                No supervisor assigned yet
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
