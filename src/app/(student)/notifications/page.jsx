"use client";

import { ArrowLeft, CheckCircle2, XCircle, Info, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, timeAgo } from "@/lib/utils";
import { useMyComplaints } from "@/lib/api-hooks";
import Link from "next/link";

function getNotifConfig(complaint) {
  if (complaint.status === "resolved") {
    return {
      icon: CheckCircle2,
      bg: "bg-[#ECFDF5]",
      color: "text-accent",
      border: "border-accent/30",
      title: "Your complaint was approved",
    };
  }
  if (complaint.status === "rejected") {
    return {
      icon: XCircle,
      bg: "bg-[#FEF2F2]",
      color: "text-[#B91C1C]",
      border: "border-line",
      title: "Complaint rejected",
    };
  }
  if (complaint.status === "in_review") {
    return {
      icon: Clock,
      bg: "bg-[#FFFBEB]",
      color: "text-[#B45309]",
      border: "border-line",
      title: "Complaint under review",
    };
  }
  // open
  return {
    icon: Info,
    bg: "bg-[#EFF6FF]",
    color: "text-[#1D4ED8]",
    border: "border-line",
    title: "Complaint submitted",
  };
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-2.5 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton h-24 rounded-2xl" />
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  const { data: complaints, isLoading, error } = useMyComplaints();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl hover:bg-mist transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-ink" />
        </Link>
        <h1 className="text-2xl font-bold text-ink">Notifications</h1>
      </div>

      {isLoading && <NotificationsSkeleton />}

      {error && (
        <div className="text-center py-12 text-muted text-sm">
          Failed to load notifications. Please try again later.
        </div>
      )}

      {/* Notification List */}
      {!isLoading && !error && (
        <div className="space-y-2.5">
          {(complaints || []).length === 0 && (
            <div className="text-center py-16 text-muted">
              <Info className="w-10 h-10 mx-auto mb-3 text-faint" />
              <p className="text-sm">No notifications yet</p>
            </div>
          )}

          {(complaints || []).map((complaint) => {
            const config = getNotifConfig(complaint);
            const IconComponent = config.icon;
            const timestamp = complaint.resolvedAt || complaint.createdAt;

            return (
              <div
                key={complaint._id}
                className={cn(
                  "bg-white border rounded-2xl p-4",
                  complaint.status === "resolved" ? config.border : "border-line"
                )}
              >
                <div className="flex gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      config.bg,
                      config.color
                    )}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">{config.title}</p>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      {complaint.reason}
                    </p>
                    {complaint.teacherComment && (
                      <p className="text-xs text-ink mt-1.5 bg-mist rounded-lg p-2 leading-relaxed">
                        <span className="font-semibold">Teacher: </span>
                        {complaint.teacherComment}
                      </p>
                    )}
                    {timestamp && (
                      <p className="text-[11px] text-faint mt-2">
                        {timeAgo(timestamp)}
                      </p>
                    )}
                  </div>
                </div>
                {complaint.status === "resolved" && complaint.submissionId && (
                  <Link href={`/tasks`} className="block mt-3">
                    <Button variant="accent" size="sm" icon={RotateCcw} className="w-full">
                      Retake test
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
