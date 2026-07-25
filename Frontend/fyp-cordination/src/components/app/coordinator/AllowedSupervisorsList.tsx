"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAllowedSupervisors, allowSupervisor, removeAllowedSupervisor } from "@/store/user/userThunk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Plus, Trash2, Mail, CheckCircle2, UserPlus, Loader2 } from "lucide-react";

export default function AllowedSupervisorsList() {
  const dispatch = useAppDispatch();
  const { allowedSupervisors } = useAppSelector((state) => state.user);
  
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getAllowedSupervisors());
  }, [dispatch]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    try {
      await dispatch(allowSupervisor(email.trim())).unwrap();
      setEmail("");
    } catch (err) {
      // toast already shown by thunk
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await dispatch(removeAllowedSupervisor(id)).unwrap();
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ShieldCheck className="size-5 text-primary" />
          Supervisor Whitelist
        </CardTitle>
        <CardDescription>
          Only email addresses listed here will be able to register as a supervisor in your department.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row sm:items-center gap-3 w-full max-w-md">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="supervisor@uettaxila.edu.pk"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" disabled={isSubmitting || !email.trim()}>
            {isSubmitting ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="size-4 mr-2" />
            )}
            Allow Email
          </Button>
        </form>

        <div className="rounded-md border bg-card">
          {allowedSupervisors.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No emails have been whitelisted yet.
            </div>
          ) : (
            <div className="divide-y">
              {allowedSupervisors.map((item: any) => (
                <div key={item._id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-sm flex items-center gap-2">
                      {item.email}
                      {item.used && (
                        <Badge variant="outline" className="h-5 text-[10px] bg-green-500/10 text-green-600 border-green-500/20 gap-1 px-1.5">
                          <CheckCircle2 className="size-3" /> Registered
                        </Badge>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Added on {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={removingId === item._id}
                    onClick={() => handleRemove(item._id)}
                  >
                    {removingId === item._id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
