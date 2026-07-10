import { SignInPageView } from "@/views/auth/SignInPageView";
import { sanitizeCallbackUrl } from "@/views/auth/auth-routing";
import { isDevAuthAllowed } from "@shared/server/dev-auth";

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const [{ callbackUrl }, showDevAuth] = await Promise.all([searchParams, isDevAuthAllowed()]);
  return <SignInPageView callbackUrl={sanitizeCallbackUrl(callbackUrl)} showDevAuth={showDevAuth} />;
}
