import { auth } from "@shared/server/auth/config";
import { getInvitationPreview } from "@shared/server/organization-invitation-service";
import {
  InvitationAcceptancePageView,
  InvitationSignInPageView,
  InvitationUnavailablePageView,
} from "@/views/auth/InvitationPageView";

export const dynamic = "force-dynamic";

interface InvitationPageProps {
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function InvitationPage({ searchParams }: InvitationPageProps) {
  const value = (await searchParams).token;
  const token = typeof value === "string" ? value : "";
  const preview = await getInvitationPreview(token);
  if (!preview || preview.role === "OWNER") return <InvitationUnavailablePageView />;

  const session = await auth();
  if (!session?.user?.id) {
    return <InvitationSignInPageView token={token} organizationName={preview.organizationName} />;
  }

  return (
    <InvitationAcceptancePageView
      token={token}
      organizationName={preview.organizationName}
      role={preview.role}
      expiresAt={preview.expiresAt.toISOString()}
    />
  );
}
