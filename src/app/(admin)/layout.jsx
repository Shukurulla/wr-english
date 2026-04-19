"use client";
import { AppShell } from "@/components/layout/app-shell";

export default function AdminLayout({ children }) {
  return <AppShell allowedRoles={["admin"]}>{children}</AppShell>;
}
