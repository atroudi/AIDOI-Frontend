import { LoadingSkeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="max-w-2xl space-y-6">
      <LoadingSkeleton className="h-8 w-48" />
      <LoadingSkeleton className="h-48 rounded-xl" />
      <LoadingSkeleton className="h-48 rounded-xl" />
      <LoadingSkeleton className="h-48 rounded-xl" />
    </div>
  );
}
