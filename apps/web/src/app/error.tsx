"use client";

import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Alert variant="destructive">
          <IconAlertTriangle aria-hidden="true" />
          <AlertTitle>
            <h1>Qualcosa è andato storto</h1>
          </AlertTitle>
          <AlertDescription>
            Si è verificato un errore imprevisto. Riprova più tardi o torna alla
            home.
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}>
            <IconRefresh aria-hidden="true" />
            Riprova
          </Button>
          <Button render={<Link href="/" />}>Home</Button>
        </div>
      </div>
    </main>
  );
}
