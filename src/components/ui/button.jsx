import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-ink text-porcelain hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500",
  secondary:
    "bg-white border border-line text-ink hover:bg-mist",
  danger:
    "bg-red-600 text-white hover:bg-red-700",
  ghost:
    "text-ink hover:bg-mist",
  accent:
    "bg-accent text-white hover:bg-emerald-800",
};

const sizes = {
  sm: "h-8 px-3 text-[13px] rounded-[10px]",
  md: "h-10 px-4 text-[13px] rounded-[10px]",
  lg: "h-12 px-6 text-[15px] rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  icon: Icon,
  children,
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        Icon && <Icon className="w-4 h-4" />
      )}
      {children}
    </button>
  );
}
