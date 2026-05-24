import { redirect } from "next/navigation";

/** Punto di ingresso `/` — redirect gestito da `src/middleware.ts`. */
export default function RootPage() {
  redirect("/sign-up");
}
