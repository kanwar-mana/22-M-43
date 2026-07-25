"use client";
import StudentSettings from "@/components/app/student/StudentSettings";
import CoordinatorSettings from "@/components/app/coordinator/CoordinatorSettings";
import SupervisorSettings from "@/components/app/supervisor/SupervisorSettings";
import { useAppSelector } from "@/store/hooks";
import { SettingsSkeleton } from "@/components/app/skeleton/SettingsSkeleton";

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return (
      <div className="container mx-auto md:p-6">
        <SettingsSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto md:p-6">
      {user.role === "student" ? (
        <StudentSettings />
      ) : user.role === "supervisor" ? (
        <SupervisorSettings />
      ) : user.role === "coordinator" ? (
        <CoordinatorSettings />
      ) : (
        <SettingsSkeleton />
      )}
    </div>
  );
}
