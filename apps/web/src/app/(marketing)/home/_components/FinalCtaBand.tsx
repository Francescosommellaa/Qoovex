"use client";

import { Badge, Button, Card, CardBody } from "@qoovex/ui";
import { ArrowRight, RocketLaunch } from "@phosphor-icons/react";
import Link from "next/link";

const WORKSPACE_SIGN_UP = "https://app.qoovex.com/sign-up";

export function FinalCtaBand() {
  return (
    <section className="relative pb-16 pt-10 md:pb-24 md:pt-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-divider),transparent)]"
      />
      <Card
        variant="bento"
        tone="primary"
        padding="lg"
        className="relative overflow-hidden shadow-[--shadow-card-bento]"
      >
        <CardBody className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-xl flex-col gap-3">
            <Badge
              variant="soft"
              tone="primary"
              size="sm"
              iconLeft={<RocketLaunch weight="bold" />}
            >
              Qoovex Workspace
            </Badge>
            <h2 className="font-display text-(length:--text-xl) font-semibold leading-[1.12] tracking-[-0.02em] text-text">
              Passa dal caos allo stack digitale della cucina.
            </h2>
            <p className="m-0 max-w-[52ch] text-(length:--text-base) leading-relaxed text-text-muted">
              Piano gratuito per iniziare: ricette, menu con QR, allergeni e valori nutrizionali,
              più piani di lavoro quando ti serve coordinare il team.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3 lg:flex-col lg:items-stretch">
            <Link href={WORKSPACE_SIGN_UP} style={{ textDecoration: "none" }}>
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center sm:w-auto lg:w-full"
                iconRight={<ArrowRight weight="bold" />}
              >
                Apri il workspace
              </Button>
            </Link>
            <Link href="/pricing" style={{ textDecoration: "none" }}>
              <Button variant="ghost" size="md" className="w-full justify-center sm:w-auto lg:w-full">
                Confronta i piani
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
