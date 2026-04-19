"use client";

import { useState, useRef } from "react";
import { useAuthStore } from "@/stores/auth";
import { useChangePassword } from "@/lib/api-hooks";
import api from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { toast } from "@/stores/toast";
import {
  User,
  Mail,
  ChevronRight,
  Lock,
  LogOut,
  Camera,
  Users,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function InfoRow({ icon: Icon, label, value, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-mist/50 transition-colors"
    >
      <div className="w-9 h-9 rounded-xl bg-mist flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-muted" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-[11px] text-faint uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-ink truncate">{value}</p>
      </div>
      {onClick && <ChevronRight className="w-4.5 h-4.5 text-faint shrink-0" />}
    </button>
  );
}

function ChangePasswordModal({ open, onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const changePasswordMutation = useChangePassword();

  const canSubmit =
    currentPassword.length >= 1 &&
    newPassword.length >= 6 &&
    newPassword === confirmPassword &&
    !changePasswordMutation.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success("Password changed successfully");
          onClose();
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (err) => {
          const msg =
            err?.response?.data?.error?.message ||
            err?.error?.message ||
            "Failed to change password";
          toast.error(msg);
        },
      }
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h3 className="text-lg font-bold text-ink">Change password</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-mist transition-colors">
            <X className="w-5 h-5 text-ink" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="text-sm font-semibold text-ink mb-1.5 block">Current password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-white border border-line rounded-xl px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-faint"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-ink mb-1.5 block">New password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white border border-line rounded-xl px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent pr-10"
                placeholder="Minimum 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-faint"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-ink mb-1.5 block">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white border border-line rounded-xl px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              placeholder="Repeat new password"
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-[#B91C1C] mt-1.5">Passwords do not match</p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-1"
              disabled={!canSubmit}
              loading={changePasswordMutation.isPending}
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LogoutConfirmModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-sm mx-4 p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-6 h-6 text-[#B91C1C]" />
        </div>
        <h3 className="text-lg font-bold text-ink">Sign Out</h3>
        <p className="text-sm text-muted mt-2 leading-relaxed">
          You&apos;ll need to enter your email and password to sign back in.
        </p>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" size="lg" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" size="lg" className="flex-1" onClick={onConfirm}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, init } = useAuthStore();
  const router = useRouter();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const displayName = user?.fullName || user?.name || "Student";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const groupName = user?.studentInfo?.groupId?.name || user?.studentInfo?.groupId || "";
  const avatarUrl = user?.avatar;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await api.post("/auth/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Re-init to refresh user data in store
      // Force re-fetch by clearing the init promise
      useAuthStore.setState({ user: { ...user, avatar: res.data?.avatar || res.avatar } });
      toast.success("Avatar updated!");
    } catch (err) {
      toast.error(err?.error?.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">Profile</h1>

      {/* Avatar Block */}
      <div className="flex flex-col items-center py-6">
        <div className="relative mb-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-ink text-porcelain flex items-center justify-center text-2xl font-display font-bold">
              {initials}
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-lg hover:bg-emerald-800 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
        <p className="text-lg font-bold text-ink">{displayName}</p>
        {groupName && (
          <p className="text-sm text-muted flex items-center gap-1.5 mt-1">
            <Users className="w-3.5 h-3.5" />
            {typeof groupName === "object" ? groupName.name : groupName}
          </p>
        )}
      </div>

      {/* Personal Info */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-faint px-4 mb-2">
          Personal information
        </p>
        <div className="bg-white border border-line rounded-2xl overflow-hidden divide-y divide-line">
          <InfoRow icon={User} label="Full name" value={displayName} />
          <InfoRow icon={Mail} label="Email" value={user?.email || "Not set"} />
        </div>
      </section>

      {/* Security */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-faint px-4 mb-2">
          Security
        </p>
        <div className="bg-white border border-line rounded-2xl overflow-hidden divide-y divide-line">
          <InfoRow
            icon={Lock}
            label="Password"
            value="Change password"
            onClick={() => setPasswordModalOpen(true)}
          />
          <button
            onClick={() => setLogoutModalOpen(true)}
            className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-[#FEF2F2] transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] flex items-center justify-center shrink-0">
              <LogOut className="w-4.5 h-4.5 text-[#B91C1C]" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-[#B91C1C]">Logout</p>
            </div>
          </button>
        </div>
      </section>

      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />

      <LogoutConfirmModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
