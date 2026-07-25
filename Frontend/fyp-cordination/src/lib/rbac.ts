// Role-Based Access Control Configuration
import type { UserRole } from "@/types/auth.types";

export type { UserRole };

export const routePermissions: Record<string, UserRole[]> = {
  "/dashboard": ["student", "supervisor", "coordinator"],
  "/dashboard/settings": ["student", "supervisor", "coordinator"],

  "/dashboard/teams": ["student"],
  "/dashboard/submissions": ["student"],
  "/dashboard/students": ["supervisor", "coordinator"],
  "/dashboard/supervisors": ["coordinator"],
  "/dashboard/projects": ["student", "supervisor", "coordinator"],
};

// Check if a role has access to a specific route
export const hasRouteAccess = (
  role: UserRole | undefined,
  pathname: string,
): boolean => {
  if (!role) return false;

  // Check exact match first
  if (routePermissions[pathname]) {
    return routePermissions[pathname].includes(role);
  }

  // Check for dynamic routes (e.g., /dashboard/projects/[id])
  const pathParts = pathname.split("/").filter(Boolean);
  let currentPath = "";

  for (const part of pathParts) {
    currentPath += `/${part}`;
    if (routePermissions[currentPath]) {
      if (routePermissions[currentPath].includes(role)) {
        return true;
      }
    }
  }

  return true;
};
