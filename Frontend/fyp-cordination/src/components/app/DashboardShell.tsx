"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppShell } from "./AppShell";
import { checkAuth } from "@/store/auth/authThunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import {
  FileText,
  FolderGit2,
  LayoutDashboard,
  Settings,
  Users,
  MessageSquare,
} from "lucide-react";
import { ChatbotWidget } from "@/components/app/student/ChatbotWidget";

const studentNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: FolderGit2 },
  { label: "Submissions", href: "/dashboard/submissions", icon: FileText },
  { label: "Teams", href: "/dashboard/teams", icon: Users },
  { label: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const supervisorNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: FolderGit2 },
  { label: "Evaluations", href: "/dashboard/evaluations", icon: FileText },
  { label: "Students", href: "/dashboard/students", icon: Users },
  { label: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const coordinatorNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/projects", icon: FolderGit2 },
  { label: "Supervisors", href: "/dashboard/supervisors", icon: Users },
  { label: "Students", href: "/dashboard/students", icon: Users },
  { label: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAppSelector((state) => state.auth);

  let navItems = studentNavItems;
  if (user?.role === "supervisor") {
    navItems = supervisorNavItems;
  } else if (user?.role === "coordinator") {
    navItems = coordinatorNavItems;
  }
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  const isStudent = user?.role === "student";

  return (
    <SidebarProvider>
      <AppShell navItems={navItems}>
        <RouteGuard>{children}</RouteGuard>
        {isStudent && <ChatbotWidget />}
      </AppShell>
    </SidebarProvider>
  );
}
