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
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Alert variant="destructive">
          <IconAlertTriangle />
          <AlertTitle>Qualcosa è andato storto</AlertTitle>
          <AlertDescription>
            Si è verificato un errore imprevisto. Riprova più tardi o torna al
            catalogo.
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}>
            <IconRefresh />
            Riprova
          </Button>
          <Button render={<Link href="/" />}>Catalogo</Button>
        </div>
      </div>
    </div>
  );
}
