import { SignInPageView } from "@/views/auth/SignInPageView";
import { isClientInvitationCallbackUrl, sanitizeCallbackUrl } from "@/views/auth/auth-routing";
import { isDevAuthAllowed } from "@shared/server/dev-auth";

interface SignInPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
    verified?: string;
    created?: string;
    passwordReset?: string;
  }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const [params, showDevAuth] = await Promise.all([searchParams, isDevAuthAllowed()]);
  const callbackUrl = sanitizeCallbackUrl(params.callbackUrl);
  const statusMessage = params.passwordReset === "1"
    ? "Password aggiornata. Ora puoi accedere."
    : params.created === "1"
      ? "Account creato. Accedi con le nuove credenziali."
      : params.verified === "1"
        ? "Email verificata. Ora puoi accedere o recuperare la password."
        : null;
  return (
    <SignInPageView
      callbackUrl={callbackUrl}
      clientInvitation={isClientInvitationCallbackUrl(callbackUrl)}
      showDevAuth={showDevAuth}
      statusMessage={statusMessage}
    />
  );
}
