"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@qoovex/ui/components/button";
import { Input } from "@qoovex/ui/components/input";
import { Textarea } from "@qoovex/ui/components/textarea";

type Kind = "worker" | "job-site" | "document" | "evidence";

async function payload(response: Response) {
  const value = await response.json().catch(() => null);
  if (!response.ok) throw new Error(value?.message ?? "Operazione non disponibile.");
  return value;
}

export function FoundationCreateForm({ kind }: { kind: Kind }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(formData: FormData) {
    setPending(true); setError(null);
    try {
      if (kind === "worker") {
        await payload(await fetch("/api/workers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName: formData.get("title"), roleLabel: formData.get("role"), notes: formData.get("notes") }) }));
        router.push("/workers");
      } else if (kind === "job-site") {
        const value = await payload(await fetch("/api/job-sites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: formData.get("title"), address: formData.get("address"), notes: formData.get("notes") }) }));
        router.push(`/job-sites/${value.id}`);
      } else if (kind === "document") {
        const document = await payload(await fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ownerType: "ORGANIZATION", title: formData.get("title"), notes: formData.get("notes") }) }));
        const file = formData.get("file");
        if (file instanceof File && file.size) {
          const upload = new FormData(); upload.set("file", file);
          await payload(await fetch(`/api/documents/${document.id}/versions`, { method: "POST", body: upload }));
        }
        router.push(`/documents/${document.id}`);
      } else {
        const file = formData.get("file");
        if (file instanceof File && file.size) {
          const upload = new FormData(); upload.set("file", file); upload.set("type", "FILE"); upload.set("title", String(formData.get("title") ?? "")); upload.set("description", String(formData.get("notes") ?? ""));
          await payload(await fetch("/api/evidence", { method: "POST", body: upload }));
        } else {
          await payload(await fetch("/api/evidence", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "NOTE", title: formData.get("title"), description: formData.get("notes") }) }));
        }
        router.push("/evidence");
      }
      router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Operazione non disponibile."); }
    finally { setPending(false); }
  }
  return <form action={submit} className="grid max-w-2xl gap-4">
    <label className="grid gap-2 text-sm">{kind === "worker" ? "Nome" : "Titolo"}<Input name="title" required /></label>
    {kind === "worker" ? <label className="grid gap-2 text-sm">Ruolo operativo<Input name="role" /></label> : null}
    {kind === "job-site" ? <label className="grid gap-2 text-sm">Indirizzo<Input name="address" /></label> : null}
    {kind === "document" || kind === "evidence" ? <label className="grid gap-2 text-sm">File {kind === "evidence" ? "(opzionale)" : ""}<Input name="file" type="file" /></label> : null}
    <label className="grid gap-2 text-sm">Note<Textarea name="notes" /></label>
    {error ? <p className="text-sm text-destructive">{error}</p> : null}
    <Button disabled={pending} type="submit">{pending ? "Salvataggio…" : "Salva"}</Button>
  </form>;
}
