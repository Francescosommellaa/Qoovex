import { SignInPageView } from "@/views/auth/SignInPageView";
import { sanitizeCallbackUrl } from "@/views/auth/auth-routing";

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callbackUrl } = await searchParams;
  return <SignInPageView callbackUrl={sanitizeCallbackUrl(callbackUrl)} />;
}
