import { redirect } from "next/navigation";

/**
 * Punto di ingresso `/`.
 * La decisione sessione vive in `src/proxy.ts`; qui non chiamare Clerk per
 * evitare errori Server Components se l'interception non gira ancora.
 */
export default function RootPage() {
  redirect("/sign-up");
}
