import Link from "next/link";
import { IconMoodEmpty } from "@tabler/icons-react";
import { linkVariants } from "@qoovex/ui/components/link";
import { Card, CardContent } from "@qoovex/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from "@qoovex/ui/components/empty";
import { cn } from "@qoovex/ui/lib/utils";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconMoodEmpty aria-hidden="true" />
              </EmptyMedia>
              <h1 className="text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg">
                Pagina non trovata
              </h1>
              <EmptyDescription>
                La pagina che cerchi non esiste o è stata spostata.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
          <div className="mt-4 flex justify-center">
            <Link className={cn(linkVariants({ variant: "primary" }), "h-11")} href="/">
              Torna alla home
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
