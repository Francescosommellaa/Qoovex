"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@qoovex/ui/components/button";
import { Input } from "@qoovex/ui/components/input";
import { Textarea } from "@qoovex/ui/components/textarea";

export function WorkerCreateForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(formData: FormData) {
    setPending(true); setError(null);
    try {
      const response = await fetch("/api/workers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName: formData.get("displayName"), roleLabel: formData.get("roleLabel"), notes: formData.get("notes") }) });
      const value = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(value?.message ?? "Operazione non disponibile.");
      router.push("/workers"); router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Operazione non disponibile."); }
    finally { setPending(false); }
  }
  return <form action={submit} className="grid max-w-2xl gap-4"><label className="grid gap-2 text-sm">Nome<Input name="displayName" required /></label><label className="grid gap-2 text-sm">Ruolo operativo<Input name="roleLabel" /></label><label className="grid gap-2 text-sm">Note<Textarea name="notes" /></label>{error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}<Button disabled={pending} type="submit">{pending ? "Salvataggio…" : "Salva"}</Button></form>;
}
