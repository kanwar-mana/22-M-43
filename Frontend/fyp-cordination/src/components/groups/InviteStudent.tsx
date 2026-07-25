"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/types/auth.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface InviteStudentProps {
  availableStudents: User[];
  onInvite: (studentId: string) => Promise<void>;
  isLoading?: boolean;
}

// Component for a group leader to select and invite available students
export default function InviteStudent({ availableStudents, onInvite, isLoading = false }: InviteStudentProps) {
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const handleInvite = async () => {
    if (!selectedStudentId) return;
    await onInvite(selectedStudentId);
    setSelectedStudentId(""); // Reset after invite
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite a Team Member</CardTitle>
        <CardDescription>Select a student from your department to join your group.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Student</Label>
          <Select onValueChange={setSelectedStudentId} value={selectedStudentId}>
            <SelectTrigger>
              <SelectValue placeholder="Browse available students" />
            </SelectTrigger>
            <SelectContent>
              {availableStudents.length === 0 ? (
                <SelectItem value="none" disabled>No students available</SelectItem>
              ) : (
                availableStudents.map((student) => (
                  <SelectItem key={student._id} value={student._id}>
                    {student.fullName} ({student.email})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleInvite} disabled={!selectedStudentId || isLoading}>
          {isLoading ? "Sending..." : "Send Invitation"}
        </Button>
      </CardContent>
    </Card>
  );
}
