import { LoadingSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function OrganizationsLoading() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton className="h-8 w-48" />
      <LoadingSkeleton className="h-10 w-full max-w-sm rounded-lg" />
      <TableSkeleton rows={8} cols={6} />
    </div>
  );
}
