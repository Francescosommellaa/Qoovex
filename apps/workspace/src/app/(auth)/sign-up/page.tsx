import { Suspense } from "react";
import { SignInForm } from "../ui";
import { isDevAuthAllowed } from "@shared/server/dev-auth";

export default async function SignUpPage() {
  const devAuthEnabled = await isDevAuthAllowed();

  return (
    <Suspense fallback={null}>
      <SignInForm mode="sign-up" devAuthEnabled={devAuthEnabled} />
    </Suspense>
  );
}
