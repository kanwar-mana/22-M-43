"use client";

import { useAppSelector } from "@/store/hooks";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { hasRouteAccess } from "@/lib/rbac";

interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard = ({ children }: RouteGuardProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      return;
    }

    const hasAccess = hasRouteAccess(user.role, pathname);

    if (!hasAccess) {
      router.replace("/unauthorized");
    }
  }, [user, pathname, router]);

  // Show loading skeleton while checking

  return <>{children}</>;
};
