import { cn } from "@/lib/utils";

type StatusType = "active" | "inactive" | "deleted" | "suspended" | "retired";

const statusStyles: Record<StatusType, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-yellow-100 text-yellow-700",
  deleted: "bg-red-100 text-red-700",
  suspended: "bg-orange-100 text-orange-700",
  retired: "bg-gray-100 text-gray-600",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase() as StatusType;
  const style = statusStyles[normalizedStatus] || statusStyles.inactive;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
