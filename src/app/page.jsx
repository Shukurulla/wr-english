"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { PageLoader } from "@/components/ui/spinner";

export default function Home() {
  const { user, isLoading, init } = useAuthStore();
  const router = useRouter();

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.push("/login"); return; }
    const redirects = { student: "/dashboard", admin: "/admin/dashboard" };
    router.push(redirects[user.role] || "/dashboard");
  }, [user, isLoading, router]);

  return <PageLoader />;
}
