import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Group, ProjectDomain } from "@/types/group.types";
import { useAppDispatch } from "@/store/hooks";
import { updateGroupDetails } from "@/store/group/groupThunk";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PencilLine, Loader2 } from "lucide-react";

export function EditGroupDialog({ group }: { group: Group }) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState(group.projectDetails.title);
  const [description, setDescription] = useState(group.projectDetails.description);
  const [domain, setDomain] = useState<ProjectDomain>(group.projectDetails.domain || "Web");
  const [techString, setTechString] = useState(group.projectDetails.technologies.join(", "));
  const [requiredMembers, setRequiredMembers] = useState(group.requiredMembers);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const technologies = techString.split(",").map((t) => t.trim()).filter(Boolean);
    
    try {
      await dispatch(
        updateGroupDetails({
          groupId: group._id,
          title,
          description,
          domain,
          technologies,
          requiredMembers,
        })
      ).unwrap();
      setOpen(false);
    } catch (err) {
      // Error handled by thunk/toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs gap-1.5 shrink-0"
        >
          <PencilLine className="w-3.5 h-3.5" />
          Edit Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Group Details</DialogTitle>
          <DialogDescription>
            Update your project information and required members.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Project Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Project Description</Label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Domain</Label>
              <Select onValueChange={(val) => setDomain(val as ProjectDomain)} value={domain}>
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
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Required Members (Max 5)</Label>
            <Input
              type="number"
              min={Math.max(2, group.members.length)}
              max={5}
              value={requiredMembers}
              onChange={(e) => setRequiredMembers(Number(e.target.value))}
              required
            />
            <p className="text-xs text-muted-foreground">
              Cannot be less than the current number of members ({group.members.length}).
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
