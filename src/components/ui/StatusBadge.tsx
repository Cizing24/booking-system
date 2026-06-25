import type { ReactNode } from "react";
import { cn } from "@/src/lib/cn";

type StatusBadgeVariant =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "active"
  | "inactive";

type StatusBadgeProps = {
  children: ReactNode;
  variant: StatusBadgeVariant;
  className?: string;
};

const variantClasses: Record<StatusBadgeVariant, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-700",
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-slate-100 text-slate-600",
};

export function StatusBadge({
  children,
  variant,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}