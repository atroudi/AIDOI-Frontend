import { LoadingSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function OrgAdminsLoading() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton className="h-8 w-48" />
      <LoadingSkeleton className="h-10 w-full max-w-sm rounded-lg" />
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}
