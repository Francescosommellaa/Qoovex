import type { PaymentRequestStatus } from "@qoovex/types";
import { formatEuroFromMinorUnits } from "@shared/lib/money";
import { formatDateTime } from "@shared/lib/product-metadata-presentation";
import { presentPaymentRequestStatus } from "@shared/lib/product-state-presentation";
import { WorkspaceState } from "@/views/workspace/WorkspacePrimitives";

type PaymentViewer = "ORGANIZATION" | "CLIENT";

export interface PaymentRequestSummaryInput {
  status: PaymentRequestStatus;
  amountMinor: bigint | string;
  reason: string;
  requestedAt: Date | string | null;
  createdAt: Date | string;
  dueAt: Date | string | null;
  confirmedAt: Date | string | null;
  requestedByParticipant: {
    publicRoleLabel: string | null;
    user: { firstName: string | null; lastName: string | null };
  } | null;
}

export function presentPaymentRequester(requester: PaymentRequestSummaryInput["requestedByParticipant"]): string {
  if (!requester) return "Azienda";
  const name = [requester.user.firstName, requester.user.lastName].filter(Boolean).join(" ");
  return name || requester.publicRoleLabel || "Azienda";
}

export function presentPaymentNextAction(status: PaymentRequestStatus, viewer: PaymentViewer): string {
  switch (status) {
    case "REQUESTED":
      return viewer === "CLIENT"
        ? "Prossimo passo: se hai disposto il pagamento fuori da Qoovex, dichiarane l'invio."
        : "Prossimo passo: attendi la dichiarazione di invio del cliente.";
    case "TRANSFER_DECLARED":
      return viewer === "ORGANIZATION"
        ? "Prossimo passo: registra l'esito della ricezione dichiarata dal cliente."
        : "Prossimo passo: l'Azienda deve registrare un esito sulla tua dichiarazione.";
    case "UNDER_REVIEW":
      return viewer === "ORGANIZATION"
        ? "Prossimo passo: completa la revisione della dichiarazione quando hai le informazioni necessarie."
        : "Prossimo passo: l'Azienda aggiornerà l'esito dopo la revisione della dichiarazione.";
    case "CONFIRMED":
      return "Nessuna azione richiesta. La ricezione è stata registrata dall'Azienda.";
    case "DISPUTED":
      return "È necessario chiarire la dichiarazione con l'altra parte nel cantiere.";
    case "DRAFT":
      return "La richiesta non è ancora stata inviata.";
    case "CANCELLED":
      return "Nessuna azione richiesta. La richiesta è stata annullata.";
  }
}

export function PaymentRequestSummary({ payment, viewer }: { payment: PaymentRequestSummaryInput; viewer: PaymentViewer }) {
  const requestedAt = payment.requestedAt ?? payment.createdAt;

  return <div className="space-y-3">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold">Richiesta di pagamento</h3>
        <p className="mt-1 text-sm text-muted-foreground">{payment.reason}</p>
      </div>
      <WorkspaceState state={presentPaymentRequestStatus(payment.status)} />
    </div>
    <dl className="grid gap-2 text-sm sm:grid-cols-2">
      <div><dt className="text-muted-foreground">Importo richiesto</dt><dd className="font-medium">{formatEuroFromMinorUnits(payment.amountMinor)}</dd></div>
      <div><dt className="text-muted-foreground">Richiesta da</dt><dd>{presentPaymentRequester(payment.requestedByParticipant)}</dd></div>
      <div><dt className="text-muted-foreground">Data della richiesta</dt><dd>{formatDateTime(requestedAt)}</dd></div>
      {payment.dueAt ? <div><dt className="text-muted-foreground">Scadenza indicata</dt><dd>{formatDateTime(payment.dueAt)}</dd></div> : null}
      {payment.confirmedAt ? <div><dt className="text-muted-foreground">Ricezione registrata il</dt><dd>{formatDateTime(payment.confirmedAt)}</dd></div> : null}
    </dl>
    <p className="text-sm text-muted-foreground">{presentPaymentNextAction(payment.status, viewer)}</p>
  </div>;
}
