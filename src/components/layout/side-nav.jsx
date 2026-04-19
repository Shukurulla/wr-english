"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";
import { useComplaints } from "@/lib/api-hooks";
import {
  Home,
  FileText,
  BarChart3,
  User,
  Bell,
  LayoutDashboard,
  Users,
  GraduationCap,
  MessageSquare,
  LogOut,
  Award,
  ClipboardList,
  Settings,
  ShieldAlert,
} from "lucide-react";

const studentLinks = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/tasks", label: "Tests", icon: FileText },
  { href: "/results", label: "Results", icon: BarChart3 },
  { href: "/grades", label: "Grades", icon: Award },
  { href: "/final-test", label: "Final Test", icon: ClipboardList },
  { href: "/complaints", label: "Complaints", icon: MessageSquare },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/groups", label: "Groups", icon: Users },
  { href: "/admin/students", label: "Students", icon: GraduationCap },
  { href: "/admin/tests", label: "Tests", icon: FileText },
  { href: "/admin/final-tests", label: "Final Tests", icon: ClipboardList },
  { href: "/admin/complaints", label: "Complaints", icon: MessageSquare, hasBadge: true },
  { href: "/admin/audit-logs", label: "Audit Log", icon: ShieldAlert },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const studentBottomTabs = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/tasks", label: "Tests", icon: FileText },
  { href: "/grades", label: "Grades", icon: Award },
  { href: "/profile", label: "Profile", icon: User },
];

const adminBottomTabs = [
  { href: "/admin/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/admin/groups", label: "Groups", icon: Users },
  { href: "/admin/complaints", label: "Complaints", icon: MessageSquare },
  { href: "/admin/students", label: "Students", icon: GraduationCap },
];

function LogoutConfirmModal({ open, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-6 h-6 text-[#B91C1C]" />
        </div>
        <h3 className="text-lg font-bold text-ink mb-2">Sign Out</h3>
        <p className="text-sm text-muted mb-6 leading-relaxed">
          You&apos;ll need to enter your email and password to sign back in.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-line text-sm font-semibold hover:bg-mist transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#B91C1C] text-white text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export function SideNav({ role }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showLogout, setShowLogout] = useState(false);
  const links = role === "admin" ? adminLinks : studentLinks;

  const shouldFetchComplaints = role === "admin";
  const { data: complaintsRes } = useComplaints(shouldFetchComplaints ? { status: "open" } : undefined);
  const openComplaintCount = shouldFetchComplaints ? (complaintsRes?.data?.length ?? 0) : 0;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      <nav className="w-60 shrink-0 border-r border-line bg-porcelain h-full py-6 px-4 hidden md:flex flex-col">
        <div className="px-3 pb-5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center text-porcelain font-display text-sm font-semibold">
            R
          </div>
          <span className="text-sm font-semibold tracking-tight">Reading &amp; Writing</span>
        </div>

        <div className="flex-1 space-y-0.5 overflow-y-auto">
          {links.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            const badgeCount = item.hasBadge ? openComplaintCount : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors",
                  active
                    ? "bg-ink text-porcelain"
                    : "text-zinc-600 hover:bg-mist"
                )}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  {item.label}
                </span>
                {badgeCount > 0 && (
                  <span className={cn(
                    "min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center",
                    active ? "bg-porcelain/20 text-porcelain" : "bg-red-500 text-white"
                  )}>
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="px-3 pt-4">
          <button
            onClick={() => setShowLogout(true)}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-mist hover:bg-line transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-400 flex items-center justify-center text-porcelain text-xs font-semibold">
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold truncate">{user?.fullName}</p>
              <p className="text-[11px] text-muted">{role === "admin" ? "Administrator" : "Student"}</p>
            </div>
            <LogOut className="w-4 h-4 text-muted" />
          </button>
        </div>
      </nav>

      <LogoutConfirmModal
        open={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}

export function BottomNav({ role }) {
  const pathname = usePathname();
  const tabs = role === "admin" ? adminBottomTabs : studentBottomTabs;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-porcelain/[0.88] backdrop-blur-xl border-t border-ink/[0.06] safe-area-bottom">
      <div className="flex items-start pt-2.5 pb-5">
        {tabs.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + "/");
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className={cn(
                  "w-11 h-7 rounded-full flex items-center justify-center",
                  active ? "bg-ink" : "bg-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    active ? "text-porcelain" : "text-zinc-400"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px]",
                  active ? "font-semibold text-ink" : "font-medium text-faint"
                )}
              >
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
