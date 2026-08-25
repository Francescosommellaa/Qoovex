import Link from "next/link";
import { IconMoodEmpty } from "@tabler/icons-react";
import { linkVariants } from "@qoovex/ui/components/link";
import { Card, CardContent } from "@qoovex/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@qoovex/ui/components/empty";
import { cn } from "@qoovex/ui/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconMoodEmpty />
              </EmptyMedia>
              <EmptyTitle>Pagina non trovata</EmptyTitle>
              <EmptyDescription>
                La pagina che cerchi non esiste o è stata spostata.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
          <div className="mt-4 flex justify-center">
            <Link className={cn(linkVariants({ variant: "primary" }), "h-11")} href="/">
              Torna al workspace
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
