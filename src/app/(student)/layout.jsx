"use client";
import { AppShell } from "@/components/layout/app-shell";

export default function StudentLayout({ children }) {
  return <AppShell allowedRoles={["student"]}>{children}</AppShell>;
}
