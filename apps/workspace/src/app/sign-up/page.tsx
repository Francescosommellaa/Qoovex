import { SignUpPageView } from "@/views/auth/SignUpPageView";
import { sanitizeCallbackUrl } from "@/views/auth/auth-routing";
import { getVerifiedSignupEmailFromCookie } from "@shared/server/signup-session-service";

interface SignUpPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const [{ callbackUrl }, verifiedEmail] = await Promise.all([
    searchParams,
    getVerifiedSignupEmailFromCookie(),
  ]);
  return <SignUpPageView callbackUrl={sanitizeCallbackUrl(callbackUrl)} verifiedEmail={verifiedEmail} />;
}
