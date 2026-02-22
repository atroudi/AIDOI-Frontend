import { LoadingSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function InstitutionsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <LoadingSkeleton className="h-8 w-48" />
        <LoadingSkeleton className="h-10 w-40 rounded-lg" />
      </div>
      <TableSkeleton rows={5} cols={5} />
    </div>
  );
}
