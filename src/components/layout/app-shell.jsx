"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { TopNav } from "./top-nav";
import { SideNav, BottomNav } from "./side-nav";
import { PageLoader } from "@/components/ui/spinner";

export function AppShell({ children, allowedRoles }) {
  const { user, isLoading, init } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      const redirects = {
        student: "/dashboard",
        admin: "/admin/dashboard",
      };
      router.push(redirects[user.role] || "/login");
    }
  }, [isLoading, user, allowedRoles, router]);

  if (isLoading) return <PageLoader />;
  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-porcelain">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <SideNav role={user.role} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto page-enter">
            {children}
          </div>
        </main>
      </div>
      <BottomNav role={user.role} />
    </div>
  );
}
