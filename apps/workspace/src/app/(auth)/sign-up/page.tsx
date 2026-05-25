import { Suspense } from "react";
import { SignUpEmailForm } from "../ui";

export default async function SignUpPage() {
  const googleAuthEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );

  return (
    <Suspense fallback={null}>
      <SignUpEmailForm googleAuthEnabled={googleAuthEnabled} />
    </Suspense>
  );
}
