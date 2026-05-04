import Image from "next/image";
import Link from "next/link";
import { Badge, Button, Card, CardBody, CardFooter, CardHeader } from "@qoovex/ui";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4 py-6 text-text">
      <Card
        variant="panel"
        tone="neutral"
        className="w-full max-w-120 text-center"
        aria-labelledby="not-found-title"
      >
        <CardHeader className="items-center gap-3">
          <Image
            src="/logo-icon/qoovex-icona-nera-sfondo-quadrato.svg"
            alt="Qoovex"
            width={48}
            height={48}
            priority
            className="rounded-lg"
          />
          <Badge variant="soft" tone="warning" size="sm">
            Errore 404
          </Badge>
        </CardHeader>

        <CardBody className="items-center gap-3">
          <h1 id="not-found-title" className="font-display text-(length:--text-xl) font-semibold">
            Pagina non trovata
          </h1>
          <p className="m-0 text-sm leading-relaxed text-text-muted">
            L&apos;indirizzo richiesto non corrisponde a nessuna pagina del workspace.
            Torna a un percorso sicuro per continuare.
          </p>
        </CardBody>

        <CardFooter className="flex flex-wrap justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="primary" size="md">Vai al workspace</Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="secondary" size="md">Accedi</Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
