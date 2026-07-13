const ORGANIZATION_INVITATION_ROUTE = "/invite";
const SHARED_DOCUMENT_PACKAGE_ROUTE = "/shared/document-packages";

export function buildOrganizationInvitationPath(token: string) {
  const search = new URLSearchParams({ token });
  return `${ORGANIZATION_INVITATION_ROUTE}?${search.toString()}`;
}

export function buildSharedDocumentPackagePath(token: string) {
  return `${SHARED_DOCUMENT_PACKAGE_ROUTE}/${encodeURIComponent(token)}`;
}

export function buildSharedDocumentPackageDownloadPath(token: string, itemId: string) {
  return `/api/shared/document-packages/${encodeURIComponent(token)}/items/${encodeURIComponent(itemId)}/download`;
}
