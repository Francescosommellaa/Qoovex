import { Skeleton } from "@qoovex/ui/components/skeleton";
import { WorkspacePage } from "@/views/workspace/WorkspacePrimitives";

export default function DashboardLoading() {
  return (
    <WorkspacePage>
      <div aria-busy="true" aria-label="Caricamento Panoramica" className="mx-auto grid w-full max-w-4xl gap-10">
        <div className="grid gap-3"><Skeleton className="h-9 w-44" /><Skeleton className="h-5 w-full max-w-xl" /></div>
        <div className="grid gap-3 border-y py-8"><Skeleton className="h-7 w-full max-w-lg" /><Skeleton className="h-4 w-full max-w-2xl" /></div>
        <div className="grid gap-4"><Skeleton className="h-7 w-56" /><Skeleton className="h-36 w-full" /><Skeleton className="h-36 w-full" /></div>
        <div className="grid gap-4"><Skeleton className="h-7 w-48" /><Skeleton className="h-24 w-full" /></div>
      </div>
    </WorkspacePage>
  );
}
