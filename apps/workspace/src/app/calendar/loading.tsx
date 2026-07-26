import { Spinner } from "@qoovex/ui/components/spinner";

export default function CalendarLoading() {
  return (
    <div className="flex h-[60vh] items-center justify-center gap-2 text-muted-foreground" role="status">
      <Spinner />
      <span>Caricamento calendario…</span>
    </div>
  );
}
