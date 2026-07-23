import type { MissingDocumentRequirementItem } from "@qoovex/types";
import { documentCategoryRegistry } from "@qoovex/types";
import { Badge } from "@qoovex/ui/components/badge";
import { buttonVariants } from "@qoovex/ui/components/button";
import Link from "next/link";
import { documentDetailsHref } from "@shared/lib/document-routes";
import { WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { documentStatusLabels, formatDate, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceDocumentRecord } from "@/views/workspace/workspace-records";

export function DocumentCategoryList({ documents, missing = [] }: { documents: WorkspaceDocumentRecord[]; missing?: MissingDocumentRequirementItem[] }) {
  const categoryKeys = [...new Set([...documents.map((document) => document.categoryKey), ...missing.map((item) => item.categoryKey)])];
  if (!categoryKeys.length) return <p className="py-6 text-center text-sm text-muted-foreground">Nessun documento o elemento mancante configurato per questo contesto.</p>;

  return <div className="grid gap-3">{categoryKeys.map((categoryKey) => {
    const category = documentCategoryRegistry[categoryKey];
    const categoryDocuments = documents.filter((document) => document.categoryKey === categoryKey);
    const categoryMissing = missing.filter((item) => item.categoryKey === categoryKey);
    return <section aria-labelledby={`document-category-${categoryKey}`} className="rounded-lg border p-3" key={categoryKey}>
      <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-sm font-medium" id={`document-category-${categoryKey}`}>{category.label}</h3><p className="mt-1 text-xs text-muted-foreground">{category.description}</p></div><Badge variant="outline">{categoryDocuments.length} presenti · {categoryMissing.length} mancanti</Badge></div>
      <div className="mt-3 grid gap-2">
        {categoryDocuments.map((document) => <article className="flex min-w-0 flex-col gap-3 rounded-md bg-muted/45 p-3 sm:flex-row sm:items-center sm:justify-between" key={document.id}><div className="min-w-0"><div className="flex flex-wrap gap-2"><WorkspaceState label={documentStatusLabels[document.status]} tone={statusTone(document.status)} /><Badge variant="outline">{document.documentTypeName ?? "Da classificare"}</Badge></div><strong className="mt-2 block [overflow-wrap:anywhere] text-sm font-medium">{document.title}</strong><span className="mt-1 block text-xs text-muted-foreground">Scadenza registrata: {formatDate(document.expiryDate)}</span></div><Link className={buttonVariants({ variant: "outline", size: "sm" })} href={documentDetailsHref(document)}>Apri documento</Link></article>)}
        {categoryMissing.map((item) => <article className="rounded-md border border-dashed p-3" key={item.id}><WorkspaceState label="Mancante" tone="danger" /><strong className="mt-2 block text-sm font-medium">{item.documentTypeName}</strong><span className="mt-1 block text-xs text-muted-foreground">Requisito configurato: {item.requirementName}</span></article>)}
      </div>
    </section>;
  })}</div>;
}
