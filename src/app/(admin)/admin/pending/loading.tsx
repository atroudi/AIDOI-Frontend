import { LoadingSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function PendingLoading() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton className="h-8 w-48" />
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}
