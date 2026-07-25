"use client";

import { useState } from "react";
import { Group } from "@/types/group.types";
import { User } from "@/types/auth.types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, FolderGit2, Users, ChevronDown, UserCheck, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch } from "@/store/hooks";
import { assignInternalEvaluator } from "@/store/group/groupThunk";
import { Loader2 } from "lucide-react";

interface AllGroupsTableProps {
  groups: Group[];
  supervisors?: User[];
  onDeleteGroup: (groupId: string) => Promise<void>;
  isDeleting?: string | null;
}

export default function AllGroupsTable({ groups, supervisors = [], onDeleteGroup, isDeleting = null }: AllGroupsTableProps) {
  const dispatch = useAppDispatch();
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const handleAssignEvaluator = async (groupId: string, evaluatorId: string | null) => {
    setAssigningId(groupId);
    await dispatch(assignInternalEvaluator({ groupId, internalEvaluatorId: evaluatorId }));
    setAssigningId(null);
  };

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No groups have been created in your department yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 bg-linear-to-br from-card via-card to-primary/5 shadow-lg/10">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FolderGit2 className="size-5 text-primary" />
            Department Groups
          </CardTitle>
          <CardDescription>
            A complete overview of all FYP groups in your department.
          </CardDescription>
          <Badge variant="secondary" className="w-fit mt-2">
            {groups.length} {groups.length === 1 ? "Group" : "Groups"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Title</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>Internal Evaluator</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => {
                const availableEvaluators = supervisors.filter(s => s._id !== group.supervisor?._id);
                
                return (
                  <TableRow key={group._id}>
                    <TableCell className="font-medium">{group.projectDetails.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{group.projectDetails.domain}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="size-3.5 text-muted-foreground" />
                        {group.members.length} / {group.requiredMembers}
                      </div>
                    </TableCell>
                    <TableCell>
                      {group.supervisor?.fullName ? (
                        <span className="text-sm font-medium">{group.supervisor.fullName}</span>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground bg-muted/20">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <AssignEvaluatorDropdown 
                        group={group}
                        availableEvaluators={availableEvaluators}
                        assigningId={assigningId}
                        handleAssignEvaluator={handleAssignEvaluator}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant={group.status === "APPROVED" ? "default" : "secondary"}>
                        {group.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => onDeleteGroup(group._id)}
                        disabled={isDeleting === group._id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {isDeleting === group._id ? "Deleting..." : "Delete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function AssignEvaluatorDropdown({ group, availableEvaluators, assigningId, handleAssignEvaluator }: any) {
  const [search, setSearch] = useState("");

  const filteredEvaluators = availableEvaluators.filter((e: any) =>
    e.fullName.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DropdownMenu onOpenChange={(open) => { if (!open) setSearch("") }}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs" disabled={assigningId === group._id || availableEvaluators.length === 0}>
          {assigningId === group._id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : group.internalEvaluator? <UserCheck className="w-3 h-3 mr-1 text-chart-3" /> : <UserCheck className="w-3 h-3 mr-1" />}
          {group.internalEvaluator ? group.internalEvaluator.fullName : "Assign"}
          <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px] flex flex-col p-0">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search evaluator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-7 text-xs bg-muted/40"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <div className="overflow-y-auto max-h-[250px] p-1">
          {filteredEvaluators.length === 0 ? (
            <div className="p-3 text-center text-xs text-muted-foreground">No evaluators found.</div>
          ) : (
            filteredEvaluators.map((evaluator: any) => (
              <DropdownMenuItem
                key={evaluator._id}
                onClick={() => handleAssignEvaluator(group._id, evaluator._id)}
                disabled={group.internalEvaluator?._id === evaluator._id}
              >
                {evaluator.fullName}
              </DropdownMenuItem>
            ))
          )}
          {group.internalEvaluator && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleAssignEvaluator(group._id, null)}
              >
                Remove Evaluator
              </DropdownMenuItem>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
