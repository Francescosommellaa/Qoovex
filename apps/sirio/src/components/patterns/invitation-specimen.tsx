"use client";

import { useState } from "react";
import {
  IconAlertCircle,
  IconBuilding,
  IconCircleCheck,
  IconClock,
  IconMail,
  IconRefresh,
} from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@qoovex/ui/components/dialog";

type InvitationStateExample = {
  id: string;
  title: string;
  description: string;
  action: string;
  actionNote: string;
  variant: "info" | "success" | "warning" | "destructive";
  Icon: typeof IconAlertCircle;
};

const stateExamples = [
  {
    id: "already-accepted",
    title: "Invito già accettato",
    description: "L’account attuale ha già accesso al lavoro.",
    action: "Apri il lavoro",
    actionNote: "Disponibile soltanto quando l’accesso è ancora valido.",
    variant: "success",
    Icon: IconCircleCheck,
  },
  {
    id: "expired",
    title: "Invito scaduto",
    description: "Questo invito non è più utilizzabile.",
    action: "Nessuna CTA diretta",
    actionNote: "Chiedi all’Azienda di inviare un nuovo invito.",
    variant: "warning",
    Icon: IconClock,
  },
  {
    id: "revoked",
    title: "Invito revocato",
    description: "L’Azienda ha annullato questo invito.",
    action: "Nessuna CTA diretta",
    actionNote: "Se serve ancora l’accesso, contatta l’Azienda.",
    variant: "warning",
    Icon: IconAlertCircle,
  },
  {
    id: "wrong-account",
    title: "Accedi con l’email invitata",
    description: "L’account corrente usa un indirizzo diverso da quello che ha ricevuto l’invito.",
    action: "Cambia account",
    actionNote: "La recovery reale chiude la sessione e conserva il ritorno all’invito.",
    variant: "warning",
    Icon: IconMail,
  },
  {
    id: "recoverable-error",
    title: "Situazione del lavoro aggiornata",
    description: "Il lavoro è cambiato mentre l’invito veniva accettato.",
    action: "Aggiorna e riprova",
    actionNote: "Ricarica lo stato prima di tentare una nuova accettazione.",
    variant: "destructive",
    Icon: IconRefresh,
  },
] as const satisfies readonly InvitationStateExample[];

function ValidInvitationSpecimen() {
  const [open, setOpen] = useState(false);

  return (
    <Card aria-labelledby="valid-invitation-title" role="article">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle><h3 id="valid-invitation-title">Invito a un lavoro</h3></CardTitle>
          <Badge variant="info"><IconMail aria-hidden="true" />Invito disponibile</Badge>
        </div>
        <CardDescription>Il contesto precede l’unica azione primaria.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Azienda invitante</dt>
            <dd className="mt-1 font-medium">Edilizia Aurora</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Lavoro</dt>
            <dd className="mt-1 font-medium">Ristrutturazione via Roma</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Indirizzo del lavoro</dt>
            <dd className="mt-1 font-medium">Via Roma 12, Milano</dd>
          </div>
        </dl>

        <p className="mt-5 max-w-3xl text-sm leading-6 text-muted-foreground">
          Accettando, aprirai questo lavoro in Qoovex come cliente principale. Prima che diventi operativo,
          l’Azienda pubblicherà il riepilogo iniziale da consultare e confermare.
        </p>

        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger render={<Button className="mt-5" type="button" />}>Accetta e apri il lavoro</DialogTrigger>
          <DialogContent size="sm">
            <DialogHeader>
              <DialogTitle>Accetta l’invito a Ristrutturazione via Roma</DialogTitle>
              <DialogDescription>
                Stai accettando l’invito di Edilizia Aurora come cliente principale per questo lavoro. Dopo il
                successo Qoovex aprirà direttamente il lavoro corretto.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border bg-muted/20 p-4 text-sm">
              <p className="font-medium">Ristrutturazione via Roma</p>
              <p className="mt-1 text-muted-foreground">Via Roma 12, Milano</p>
            </div>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>Annulla</DialogClose>
              <Button onClick={() => setOpen(false)} type="button">Accetta e apri il lavoro</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function PendingInvitationSpecimen() {
  return (
    <Card aria-busy="true" aria-labelledby="pending-invitation-title" role="article" variant="outline">
      <CardHeader>
        <CardTitle><h3 id="pending-invitation-title">Accettazione in corso</h3></CardTitle>
        <CardDescription>Contesto e decisione restano visibili mentre l’invio è protetto da doppie attivazioni.</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert role="status" variant="info">
          <IconClock aria-hidden="true" />
          <div>
            <AlertTitle>Stiamo registrando l’accettazione</AlertTitle>
            <AlertDescription>Attendi prima di chiudere la pagina. Il lavoro si aprirà soltanto dopo il successo.</AlertDescription>
          </div>
        </Alert>
        <Button className="mt-4" disabled loading>Accettazione in corso</Button>
      </CardContent>
    </Card>
  );
}

function InvitationStateCard({ example }: { example: InvitationStateExample }) {
  const StateIcon = example.Icon;
  return (
    <Card aria-labelledby={`invitation-state-${example.id}`} role="article" size="sm" variant="outline">
      <CardHeader>
        <CardTitle>
          <h3 id={`invitation-state-${example.id}`}>{example.title}</h3>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert role="status" variant={example.variant}>
          <StateIcon aria-hidden="true" />
          <div>
            <AlertTitle>Stato dell’invito</AlertTitle>
            <AlertDescription>{example.description}</AlertDescription>
          </div>
        </Alert>
        <dl className="text-sm">
          <div>
            <dt className="font-medium text-foreground">Azione disponibile</dt>
            <dd className="mt-1 text-muted-foreground">{example.action}</dd>
          </div>
          <div className="mt-3">
            <dt className="font-medium text-foreground">Cosa spiegare</dt>
            <dd className="mt-1 leading-6 text-muted-foreground">{example.actionNote}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

export function InvitationSpecimens() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <ValidInvitationSpecimen />
        <PendingInvitationSpecimen />
      </div>

      <section aria-labelledby="invitation-limit-states-title">
        <div className="max-w-3xl">
          <h3 className="text-lg font-semibold tracking-tight" id="invitation-limit-states-title">Stati limite e recovery</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Ogni stato dice cosa è successo e cosa può fare ora l’utente. Se non esiste una recovery diretta, non viene simulata una CTA.
          </p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stateExamples.map((example) => <InvitationStateCard example={example} key={example.title} />)}
        </div>
      </section>

      <section aria-labelledby="invitation-destination-title" className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <IconBuilding aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold tracking-tight" id="invitation-destination-title">Destinazione dopo il successo</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              L’accettazione Cliente restituisce il lavoro associato: la navigazione sostituisce la pagina dell’invito
              con quel dettaglio, senza passare dalla home. Se lo stesso account riapre un invito già accettato e ha
              ancora accesso, vede “Apri il lavoro”.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
