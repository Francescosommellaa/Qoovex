"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Badge, Button } from "@qoovex/ui";
import { ArrowRight, LockSimple, QrCode, ShieldCheck, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";

import { AppMockup } from "@/shared/mockup";

const WORKSPACE_URL = "https://app.qoovex.com";

const TRUST_POINTS: { label: string; icon: typeof ShieldCheck }[] = [
  { label: "Allergeni e nutrizione aggiornati", icon: ShieldCheck },
  { label: "Menu digitali con QR sempre aggiornato", icon: QrCode },
  { label: "Piani di lavoro con snapshot ricetta", icon: LockSimple },
];

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-item]",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.72,
          stagger: 0.08,
          ease: "power3.out",
          delay: 0.12,
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden pt-14 pb-16 md:pt-20 md:pb-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_72%_58%_at_14%_42%,var(--color-primary-highlight)_0%,transparent_70%)]"
      />

      <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
        <div className="flex max-w-2xl flex-col items-start gap-6">
          <div data-hero-item style={{ opacity: 0 }}>
            <Badge
              variant="soft"
              tone="primary"
              size="md"
              iconLeft={<Sparkle weight="bold" />}
            >
              Workspace per chef professionisti
            </Badge>
          </div>

          <h1
            data-hero-item
            style={{ opacity: 0 }}
            className="font-display text-(length:--text-2xl) font-semibold leading-[1.08] tracking-[-0.025em] text-text"
          >
            La cucina professionale
            <br />
            <span className="text-primary">merita un tool serio.</span>
          </h1>

          <p
            data-hero-item
            style={{ opacity: 0 }}
            className="max-w-[52ch] text-(length:--text-base) leading-relaxed text-text-muted"
          >
            Ricette, menu digitali, allergeni automatici, valori nutrizionali e piani di lavoro
            collaborativi — tutto in un unico workspace pensato per chi lavora davvero in cucina.
          </p>

          <div data-hero-item style={{ opacity: 0 }} className="flex flex-wrap items-center gap-3">
            <Link href={`${WORKSPACE_URL}/sign-up`} style={{ textDecoration: "none" }}>
              <Button variant="primary" size="md" iconRight={<ArrowRight weight="bold" />}>
                Inizia gratis
              </Button>
            </Link>
            <Link href="/pricing" style={{ textDecoration: "none" }}>
              <Button variant="ghost" size="md">
                Vedi i piani
              </Button>
            </Link>
          </div>

          <ul
            data-hero-item
            style={{ opacity: 0 }}
            className="m-0 flex list-none flex-col gap-2.5 p-0 pt-1"
          >
            {TRUST_POINTS.map(({ label, icon: Icon }) => (
              <li
                key={label}
                className="flex items-start gap-2 text-(length:--text-sm) leading-snug text-text-muted"
              >
                <Icon
                  weight="bold"
                  className="mt-0.5 size-[1em] shrink-0 text-primary"
                  aria-hidden
                />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div
          data-hero-item
          style={{ opacity: 0 }}
          className="relative mx-auto flex w-full max-w-[min(100%,460px)] justify-center lg:mx-0 lg:justify-end"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 rounded-[--radius-2xl] bg-[linear-gradient(145deg,var(--color-surface-2),var(--color-surface))] opacity-90 blur-2xl"
          />
          <AppMockup activeScreen="recipes" />
        </div>
      </div>
    </section>
  );
}
