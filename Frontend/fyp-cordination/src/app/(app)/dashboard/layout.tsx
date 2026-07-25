import DashboardShell from "@/components/app/DashboardShell";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const refreshToken = (await cookies()).get("refreshToken")?.value;

  if (!accessToken && !refreshToken) {
    redirect("/login");
  }
  return <DashboardShell>{children}</DashboardShell>;
}
