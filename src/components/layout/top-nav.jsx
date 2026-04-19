"use client";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function TopNav() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      <header className="h-14 border-b border-line bg-porcelain px-4 lg:px-6 flex items-center justify-between shrink-0">
        {/* Logo — mobile only */}
        <div className="flex items-center gap-2.5 md:hidden">
          <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center text-porcelain font-display text-sm font-semibold">
            R
          </div>
          <span className="text-sm font-semibold tracking-tight">RW Platform</span>
        </div>
        <div className="hidden md:block" />

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-400 flex items-center justify-center text-porcelain text-xs font-semibold">
              {user?.fullName?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <span className="text-[13px] font-semibold">{user?.fullName}</span>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            aria-label="Logout"
            className="p-2 rounded-lg hover:bg-mist text-muted hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Logout confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
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
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-line text-sm font-semibold hover:bg-mist transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#B91C1C] text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
