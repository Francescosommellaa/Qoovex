import type { SharedDocumentPackageResponse } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { getSharedDocumentPackage } from "@shared/server/shared-package-access-service";
import { SharedDocumentPackagePageView } from "@/views/shared/SharedDocumentPackagePageView";
import { WorkspaceAccessState } from "@/views/workspace/WorkspacePrimitives";

export const dynamic = "force-dynamic";

interface SharedDocumentPackagePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedDocumentPackagePage({ params }: SharedDocumentPackagePageProps) {
  const { token } = await params;
  try {
    const documentPackage = await getSharedDocumentPackage(token);
    const response: SharedDocumentPackageResponse = documentPackage;
    return <SharedDocumentPackagePageView token={token} documentPackage={response} />;
  } catch (error) {
    if (error instanceof AccessError) {
      return <WorkspaceAccessState title="Link non disponibile" description="Il link e scaduto, e stato revocato oppure non e valido." />;
    }
    throw error;
  }
}
