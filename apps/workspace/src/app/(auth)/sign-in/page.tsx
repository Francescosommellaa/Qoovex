import { Suspense } from "react";
import { SignInForm } from "../ui";
import { isDevAuthAllowed } from "@shared/server/dev-auth";

export default async function SignInPage() {
  const devAuthEnabled = await isDevAuthAllowed();
  const googleAuthEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );

  return (
    <Suspense fallback={null}>
      <SignInForm
        devAuthEnabled={devAuthEnabled && process.env.NODE_ENV === "development"}
        googleAuthEnabled={googleAuthEnabled}
      />
    </Suspense>
  );
}
