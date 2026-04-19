import { cn } from "@/lib/utils";

const variants = {
  success: "bg-accent-soft text-accent",
  warning: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-600",
  neutral: "bg-mist text-ink",
  info: "bg-mist text-ink",
  dark: "bg-ink text-porcelain",
};

export function Badge({ variant = "neutral", children, className }) {
  return (
    <span
      className={cn(
        "pill",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

const statusMap = {
  open: { variant: "info", label: "Ochiq" },
  upcoming: { variant: "neutral", label: "Kelajak" },
  closed: { variant: "error", label: "Yopilgan" },
  in_progress: { variant: "warning", label: "Jarayonda" },
  submitted: { variant: "info", label: "Yuborilgan" },
  auto_graded: { variant: "success", label: "Baholangan" },
  ai_graded: { variant: "success", label: "AI baholagan" },
  manual_review: { variant: "warning", label: "Tekshirilmoqda" },
  finalized: { variant: "success", label: "Tasdiqlangan" },
  resolved: { variant: "success", label: "Hal qilingan" },
  rejected: { variant: "error", label: "Rad etilgan" },
  graded: { variant: "success", label: "Baholangan" },
  pending: { variant: "warning", label: "Kutmoqda" },
};

export function StatusBadge({ status }) {
  const mapped = statusMap[status] || { variant: "neutral", label: status };
  return <Badge variant={mapped.variant}>{mapped.label}</Badge>;
}
