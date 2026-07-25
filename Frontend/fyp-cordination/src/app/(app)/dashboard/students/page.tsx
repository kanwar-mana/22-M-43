"use client";

import { useAppSelector } from "@/store/hooks";
import { Users, Loader2 } from "lucide-react";
import SupervisorStudents from "@/components/app/supervisor/SupervisorStudents";
import CoordinatorStudents from "@/components/app/coordinator/CoordinatorStudents";

export default function StudentsPage() {
  const { user } = useAppSelector((state) => state.auth);

  if (user?.role === "supervisor") {
    return <SupervisorStudents />;
  }
  
  if (user?.role === "coordinator") {
    return <CoordinatorStudents />;
  }

  // Fallback for unauthorized
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
      <Users className="w-16 h-16 text-muted-foreground/30 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
      <p className="text-muted-foreground">You do not have access to the students directory.</p>
    </div>
  );
}
