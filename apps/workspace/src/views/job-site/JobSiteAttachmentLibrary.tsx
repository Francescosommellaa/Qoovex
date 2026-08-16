import { buttonVariants } from "@qoovex/ui/components/button";
import type { AttachmentCategory } from "@qoovex/db";
import type { TimelineAudience } from "@qoovex/types";
import { formatDateTime, formatFileSize, presentProposalVersion } from "@shared/lib/product-metadata-presentation";
import { presentAttachmentCategory, presentTimelineAudience } from "@shared/lib/product-state-presentation";
import { jobSiteNotificationTargetId } from "@shared/lib/job-site-notification-destination";

export interface JobSiteAttachmentListItem {
  id: string;
  category: AttachmentCategory;
  sourceId: string | null;
  originalFileName: string;
  size: number;
  createdAt: Date | string;
}

export interface JobSiteAttachmentContextReferences {
  requests: readonly { id: string; title: string }[];
  proposals: readonly { id: string; version: number | null | undefined }[];
  payments: readonly { id: string; reason: string }[];
  disputes: readonly { id: string; title: string }[];
}

const sourceLabels: Partial<Record<AttachmentCategory, string>> = {
  REQUEST: "Richiesta",
  PROPOSAL: "Proposta",
  PAYMENT_RECEIPT: "Pagamento",
  DISPUTE: "Disaccordo",
};

export function presentAttachmentContext(
  attachment: Pick<JobSiteAttachmentListItem, "category" | "sourceId">,
  references: JobSiteAttachmentContextReferences,
): string {
  if (!attachment.sourceId) return "File del cantiere";

  if (attachment.category === "REQUEST") {
    const request = references.requests.find((item) => item.id === attachment.sourceId);
    return request ? `Richiesta: ${request.title}` : "Collegato a una richiesta";
  }

  if (attachment.category === "PROPOSAL") {
    const proposal = references.proposals.find((item) => item.id === attachment.sourceId);
    return proposal ? `Proposta: ${presentProposalVersion(proposal.version)}` : "Collegato a una proposta";
  }

  if (attachment.category === "PAYMENT_RECEIPT") {
    const payment = references.payments.find((item) => item.id === attachment.sourceId);
    return payment ? `Pagamento: ${payment.reason}` : "Collegato a un pagamento";
  }

  if (attachment.category === "DISPUTE") {
    const dispute = references.disputes.find((item) => item.id === attachment.sourceId);
    return dispute ? `Disaccordo: ${dispute.title}` : "Collegato a un disaccordo";
  }

  return sourceLabels[attachment.category] ? `Collegato a ${sourceLabels[attachment.category]?.toLowerCase()}` : "Collegato a un elemento del cantiere";
}

export function createAttachmentContextReferences(input: JobSiteAttachmentContextReferences): JobSiteAttachmentContextReferences {
  return input;
}

export function JobSiteAttachmentList<TAttachment extends JobSiteAttachmentListItem>({
  attachments,
  base,
  contextReferences,
  exposeNotificationTargets = true,
  title,
  visibilityForAttachment,
}: {
  attachments: readonly TAttachment[];
  base: string;
  contextReferences: JobSiteAttachmentContextReferences;
  exposeNotificationTargets?: boolean;
  title?: string;
  visibilityForAttachment: (attachment: TAttachment) => TimelineAudience;
}) {
  if (!attachments.length) return null;

  return <div className={title ? "mt-3" : undefined}>
    {title ? <h3 className="text-sm font-medium">{title}</h3> : null}
    <ul className={title ? "mt-2 divide-y" : "divide-y"}>
      {attachments.map((attachment) => {
        const visibility = presentTimelineAudience(visibilityForAttachment(attachment));
        return <li className="flex scroll-mt-24 flex-wrap items-start justify-between gap-3 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" id={exposeNotificationTargets ? jobSiteNotificationTargetId("attachment", attachment.id) : undefined} key={attachment.id}>
          <div className="min-w-0">
            <strong className="break-words">{attachment.originalFileName}</strong>
            <dl className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <div><dt className="sr-only">Contesto</dt><dd>{presentAttachmentContext(attachment, contextReferences)}</dd></div>
              <div><dt className="sr-only">Tipo di file</dt><dd>{presentAttachmentCategory(attachment.category).label}</dd></div>
              <div><dt className="sr-only">Visibilità</dt><dd>Visibilità: {visibility.label}</dd></div>
              <div><dt className="sr-only">Data di caricamento</dt><dd>Caricato il {formatDateTime(attachment.createdAt)}</dd></div>
              <div><dt className="sr-only">Dimensione</dt><dd>{formatFileSize(attachment.size)}</dd></div>
            </dl>
          </div>
          <a aria-label={`Scarica ${attachment.originalFileName}`} className={buttonVariants({ variant: "outline", size: "sm" })} href={`${base}/attachments/${attachment.id}/download`}>Scarica</a>
        </li>;
      })}
    </ul>
  </div>;
}
