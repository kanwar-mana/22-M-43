"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateGroupPayload, ProjectDomain } from "@/types/group.types";
import { Session } from "@/types/session.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CreateGroupFormProps {
  sessions: Session[];
  onSubmit: (payload: CreateGroupPayload) => Promise<void>;
  isLoading?: boolean;
}

// Form component to create a new FYP group
export default function CreateGroupForm({ sessions, onSubmit, isLoading = false }: CreateGroupFormProps) {
  const [sessionId, setSessionId] = useState("");
  const [requiredMembers, setRequiredMembers] = useState(3);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState<ProjectDomain>("Web");
  const [techString, setTechString] = useState("");

  // Handles form submission by mapping local state to payload format
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return alert("Please select a session.");
    
    const technologies = techString.split(",").map((t) => t.trim()).filter(Boolean);
    
    await onSubmit({
      sessionId,
      requiredMembers,
      projectDetails: {
        title,
        description,
        domain,
        technologies,
      },
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Group</CardTitle>
        <CardDescription>Fill out the details below to initialize your Final Year Project group.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Session</Label>
              <Select onValueChange={setSessionId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {(sessions || []).map((s) => (
                    <SelectItem key={s._id} value={s._id || ""}>
                      {s.name} - {s.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Required Members</Label>
              <Input
                type="number"
                min={2}
                max={5}
                value={requiredMembers}
                onChange={(e) => setRequiredMembers(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Project Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g. Smart Traffic System" required />
          </div>

          <div className="space-y-2">
            <Label>Project Description</Label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Briefly describe what your project does..." 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Domain</Label>
              <Select onValueChange={(val) => setDomain(val as ProjectDomain)} defaultValue="Web">
                <SelectTrigger>
                  <SelectValue placeholder="Select Domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Web">Web</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Technologies (Comma separated)</Label>
              <Input 
                value={techString} 
                onChange={(e) => setTechString(e.target.value)} 
                placeholder="React, Node.js, Python" 
                required 
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Group..." : "Create Group"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
