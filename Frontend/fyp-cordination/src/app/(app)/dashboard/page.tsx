"use client";
import StudentDashboard from "@/components/app/student/StudentDashboard";
import CoordinatorDashboard from "@/components/app/coordinator/CoordinatorDashboard";
import SupervisorDashboard from "@/components/app/supervisor/SupervisorDashboard";
import { useAppSelector } from "@/store/hooks";
import { DashboardSkeleton } from "@/components/app/skeleton/DashboardSkeleton";
import type { User } from "@/types/auth.types";

const renderDashboardByRole = (user: User) => {
  switch (user.role) {
    case "student":
      return <StudentDashboard user={user} />;
    case "supervisor":
      return <SupervisorDashboard user={user} />;
    case "coordinator":
      return <CoordinatorDashboard user={user} />;
    default:
      return <DashboardSkeleton />;
  }
};

const DashboardPage = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return (
      <div className="container mx-auto">
        <DashboardSkeleton />
      </div>
    );
  }

  return <div className="container mx-auto">{renderDashboardByRole(user)}</div>;
};
export default DashboardPage;
