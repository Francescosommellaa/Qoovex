"use client";

import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import Link from "next/link";

export function RouteError({
  reset,
  backHref = "/contexts",
  backLabel = "Dashboard",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Alert variant="destructive">
          <IconAlertTriangle />
          <AlertTitle>Errore in questa sezione</AlertTitle>
          <AlertDescription>
            Si è verificato un errore. Riprova oppure torna alla pagina
            precedente.
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}>
            <IconRefresh />
            Riprova
          </Button>
          <Button render={<Link href={backHref} />}>{backLabel}</Button>
        </div>
      </div>
    </div>
  );
}
