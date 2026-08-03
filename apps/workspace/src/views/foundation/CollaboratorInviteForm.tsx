"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@qoovex/ui/components/button";
import { Input } from "@qoovex/ui/components/input";
export function CollaboratorInviteForm() {
  const router = useRouter(); const [error, setError] = useState<string | null>(null); const [pending, setPending] = useState(false);
  async function submit(formData: FormData) {
    setPending(true); setError(null);
    const response = await fetch("/api/organization/invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: formData.get("email"), role: "COLLABORATOR", preset: "OPERATIONAL_COLLABORATION", scopeMode: "ASSIGNED" }) });
    if (!response.ok) { const body = await response.json().catch(() => null); setError(body?.message ?? "Invito non disponibile."); setPending(false); return; }
    router.push("/people/access"); router.refresh();
  }
  return <form action={submit} className="grid max-w-xl gap-4"><label className="grid gap-2 text-sm">Email Collaborator<Input name="email" required type="email" /></label>{error ? <p className="text-sm text-destructive">{error}</p> : null}<Button disabled={pending} type="submit">{pending ? "Invio…" : "Invia invito"}</Button></form>;
}
