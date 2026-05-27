import { redirect } from "next/navigation";

/** Punto di ingresso `/` - redirect gestito da `src/proxy.ts`. */
export default function RootPage() {
  redirect("/sign-up");
}
