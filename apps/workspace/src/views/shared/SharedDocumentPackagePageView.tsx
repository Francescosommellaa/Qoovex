import type {
  DocumentPackageItemType,
  DocumentStatus,
  EvidenceType,
  RecordStatus,
  SharedDocumentPackageResponse,
} from "@qoovex/types";
import {
  WorkspaceEmptyState,
  WorkspacePage,
  WorkspacePageHeader,
  WorkspacePanel,
  WorkspaceState,
} from "@/views/workspace/WorkspacePrimitives";
import {
  documentPackageItemTypeLabels,
  documentStatusLabels,
  evidenceTypeLabels,
  fileSizeLabel,
  formatDate,
  recordStatusLabels,
  statusTone,
} from "@/views/workspace/workspace-format";
import { buildSharedDocumentPackageDownloadPath } from "@shared/lib/workspace-link-routes";
import styles from "@/views/admin-core/AdminCore.module.css";

function statusLabel(status?: string | null) {
  if (!status) return null;
  if (status in documentStatusLabels) return documentStatusLabels[status as DocumentStatus];
  if (status in evidenceTypeLabels) return evidenceTypeLabels[status as EvidenceType];
  if (status in recordStatusLabels) return recordStatusLabels[status as RecordStatus];
  return null;
}

function itemTitle(item: SharedDocumentPackageResponse["items"][number]) {
  if (item.title) return item.title;
  if (item.note) return item.note;
  return documentPackageItemTypeLabels[item.itemType as DocumentPackageItemType];
}

export function SharedDocumentPackagePageView({ token, documentPackage }: { token: string; documentPackage: SharedDocumentPackageResponse }) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title={documentPackage.title}
        description={documentPackage.description || "Pacchetto condiviso in sola lettura."}
      />
      <WorkspacePanel
        title="Contenuto condiviso"
        description={`Aggiornato: ${formatDate(documentPackage.updatedAt)}. Il link mostra solo gli elementi inclusi nel pacchetto.`}
      >
        {documentPackage.items.length ? (
          <div className={styles.list}>
            {documentPackage.items.map((item) => {
              const label = statusLabel(item.status);
              return (
                <article className={styles.record} key={item.id}>
                  <div className={styles.recordMain}>
                    <small>{documentPackageItemTypeLabels[item.itemType]}</small>
                    <strong>{itemTitle(item)}</strong>
                    {item.originalFileName ? <span>{item.originalFileName}{item.size != null ? ` - ${fileSizeLabel(item.size)}` : ""}</span> : null}
                  </div>
                  <div className={styles.actions}>
                    {label ? <WorkspaceState label={label} tone={statusTone(item.status ?? "")} /> : null}
                    {item.hasFile ? (
                      <a className={styles.linkButton} href={buildSharedDocumentPackageDownloadPath(token, item.id)}>
                        Scarica file
                      </a>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <WorkspaceEmptyState title="Nessun elemento disponibile" description="Il pacchetto non contiene elementi condivisibili." />
        )}
      </WorkspacePanel>
    </WorkspacePage>
  );
}
