"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import styles from "./AuthPages.module.css";

export function OrganizationSetupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const response = await fetch("/api/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setLoading(false);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(typeof body.message === "string" ? body.message : "Creazione azienda non riuscita.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.field}>
        <label htmlFor="organization-name">Nome azienda</label>
        <input autoComplete="organization" id="organization-name" name="name" required type="text" />
      </div>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <button className={styles.primaryButton} disabled={loading} type="submit">
        {loading ? "Creazione in corso" : "Crea la tua azienda"}
      </button>
    </form>
  );
}
