import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  label: string;
  count: number;
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function AdminStatCard({
  label,
  count,
  icon: Icon,
  iconColor = "text-primary",
  className,
}: AdminStatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center gap-4",
        className
      )}
    >
      <div
        className={cn(
          "h-12 w-12 rounded-lg flex items-center justify-center bg-gray-50",
          iconColor
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{count.toLocaleString()}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
