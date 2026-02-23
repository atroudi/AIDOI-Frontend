import { LoadingSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-8">
      <LoadingSkeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <LoadingSkeleton className="h-24 rounded-xl" />
        <LoadingSkeleton className="h-24 rounded-xl" />
        <LoadingSkeleton className="h-24 rounded-xl" />
        <LoadingSkeleton className="h-24 rounded-xl" />
        <LoadingSkeleton className="h-24 rounded-xl" />
      </div>
      <TableSkeleton rows={5} cols={4} />
    </div>
  );
}
