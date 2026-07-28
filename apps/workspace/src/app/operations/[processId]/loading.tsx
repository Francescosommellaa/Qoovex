import { Skeleton } from "@qoovex/ui/components/skeleton";
import { WorkspacePage } from "@/views/workspace/WorkspacePrimitives";

export default function OperationalProcessLoading() {
  return <WorkspacePage><Skeleton className="h-10 w-72 max-w-full" /><Skeleton className="h-5 w-full max-w-2xl" /><div className="grid gap-6 xl:grid-cols-2"><Skeleton className="h-80" /><Skeleton className="h-80" /></div></WorkspacePage>;
}
