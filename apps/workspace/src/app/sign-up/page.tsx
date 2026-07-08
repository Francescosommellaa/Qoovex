import { SignUpPageView } from "@/views/auth/SignUpPageView";
import { sanitizeCallbackUrl } from "@/views/auth/auth-routing";

interface SignUpPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { callbackUrl } = await searchParams;
  return <SignUpPageView callbackUrl={sanitizeCallbackUrl(callbackUrl)} />;
}
