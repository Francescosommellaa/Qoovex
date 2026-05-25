import { Suspense } from "react";
import { SignInForm } from "../ui";
import { isDevAuthAllowed } from "@shared/server/dev-auth";

export default async function SignInPage() {
  const devAuthEnabled = await isDevAuthAllowed();
  const DevAuthEntry = devAuthEnabled && process.env.NODE_ENV === "development"
    ? (await import("../ui/dev-auth-entry")).DevAuthEntry
    : null;
  const googleAuthEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );

  return (
    <Suspense fallback={null}>
      <SignInForm
        googleAuthEnabled={googleAuthEnabled}
      />
      {DevAuthEntry ? <DevAuthEntry /> : null}
    </Suspense>
  );
}
