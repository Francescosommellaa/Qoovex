import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Punto di ingresso `/`: evita 404 in locale e dopo login.
 * La home prodotto è la dashboard; senza sessione si va al sign-in.
 */
export default async function RootPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }
  redirect("/sign-in");
}
