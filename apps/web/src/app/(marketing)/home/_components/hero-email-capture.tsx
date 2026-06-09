"use client";

import * as React from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { Button, Icon, Input } from "@qoovex/ui";
import { workspaceSignUpHref } from "@/shared/workspace-url";

export function HeroEmailCapture() {
  const [email, setEmail] = React.useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const destination = new URL(workspaceSignUpHref);
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail) {
      destination.searchParams.set("email", normalizedEmail);
    }

    window.location.assign(destination.toString());
  }

  return (
    <form
      className="grid w-full max-w-[35rem] gap-(--spacing-2) sm:grid-cols-[minmax(0,1fr)_auto]"
      onSubmit={handleSubmit}
    >
      <Input
        type="email"
        inputMode="email"
        autoComplete="email"
        label="Email professionale"
        srOnlyLabel
        placeholder="La tua email professionale"
        size="lg"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Button
        type="submit"
        size="lg"
        iconRight={<Icon icon={ArrowRight} size="sm" weight="bold" />}
      >
        Inizia gratis
      </Button>
    </form>
  );
}
