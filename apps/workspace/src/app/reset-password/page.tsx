import { ResetPasswordPageView } from "@/views/auth/ResetPasswordPageView";
import { sanitizeCallbackUrl } from "@/views/auth/auth-routing";

interface ResetPasswordPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { callbackUrl } = await searchParams;
  return <ResetPasswordPageView callbackUrl={sanitizeCallbackUrl(callbackUrl)} />;
}
