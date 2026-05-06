"use client";

import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Badge, Card, CardBody, Divider } from "@qoovex/ui";
import { Stack } from "@phosphor-icons/react";
import { AppMockup, type AppScreen } from "@/shared/mockup";

gsap.registerPlugin(ScrollTrigger);

// ── Feature data ────────────────────────────────────────────────────────────

interface Feature {
  id: string;
  screen: AppScreen;
  badgeTone: "primary" | "success" | "warning" | "neutral";
  eyebrow: string;
  title: string;
  body: string;
}

const FEATURES: Feature[] = [
  {
    id: "recipes",
    screen: "recipes",
    badgeTone: "primary",
    eyebrow: "Ricette",
    title: "Ogni ricetta. Sempre in ordine.",
    body: "Crea e organizza ricette con ingredienti, procedimento e valori nutrizionali calcolati in automatico. Gli allergeni si aggiornano ad ogni modifica, senza sforzo.",
  },
  {
    id: "menus",
    screen: "menus",
    badgeTone: "success",
    eyebrow: "Menu digitali",
    title: "Dal piatto al tavolo, in minuti.",
    body: "Componi menu digitali partendo dalle tue ricette. Ogni variazione si riflette automaticamente. Genera un QR code e il cliente ha sempre la versione aggiornata.",
  },
  {
    id: "workplan",
    screen: "workplan",
    badgeTone: "warning",
    eyebrow: "Piano di lavoro",
    title: "Il team sempre allineato.",
    body: "Piani di lavoro collaborativi con task assegnabili. Collega ogni compito a una ricetta — anche privata, protetta da snapshot immutabile. Notifica automatica al completamento.",
  },
  {
    id: "explore",
    screen: "explore",
    badgeTone: "neutral",
    eyebrow: "Esplora",
    title: "Ispirati dalla community.",
    body: "Sfoglia ricette e menu pubblici di altri professionisti. Importa quello che ti ispira nel tuo workspace con un click. La tua copia è tua — modificabile liberamente.",
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export function ShowcaseSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const stickyRef   = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // ── GSAP ScrollTrigger pin ────────────────────────────────────────────────
  useEffect(() => {
    const section  = sectionRef.current;
    const sticky   = stickyRef.current;
    const features = featuresRef.current;
    if (!section || !sticky || !features) return;

    const ctx = gsap.context(() => {
      // Pin the mockup column while the features column scrolls
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        pin: sticky,
        pinSpacing: false,
      });

      // Per-feature intersection → update activeIndex
      featureRefs.current.forEach((el, i) => {
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 45%",
          onEnter: () => setActiveIndex(i),
          onEnterBack: () => setActiveIndex(i),
        });
      });

      // Fade-in each feature block on scroll
      featureRefs.current.forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              once: true,
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative border-t border-border pt-16 md:pt-20"
      style={{ minHeight: `calc(${FEATURES.length} * 70vh)` }}
    >
      <header className="mx-auto mb-14 max-w-[1200px] space-y-4">
        <Badge variant="soft" tone="primary" size="md" iconLeft={<Stack weight="bold" />}>
          Nel workspace
        </Badge>
        <div className="space-y-3">
          <h2 className="font-display text-(length:--text-xl) font-semibold leading-[1.12] tracking-[-0.02em] text-text">
            Tutto ciò che serve al pass, in un&apos;unica interfaccia.
          </h2>
          <p className="m-0 max-w-[62ch] text-(length:--text-base) leading-relaxed text-text-muted">
            Scorri le funzioni principali: l&apos;anteprima resta fissa mentre leggi come Qoovex
            riduce errori, copie e versioni sparse tra fogli e chat.
          </p>
        </div>
      </header>

      <div
        className="
        grid max-w-[1200px] mx-auto gap-16
        grid-cols-1 lg:grid-cols-2
        items-start
      "
      >
        {/* ── Sticky col — mockup ─────────────────────────────────── */}
        <div
          ref={stickyRef}
          className="
            flex h-screen items-center justify-center
            lg:sticky lg:top-0
          "
          aria-hidden="true"
        >
          <div className="w-full max-w-[460px]">
            <AppMockup activeScreen={FEATURES[activeIndex].screen} />
          </div>
        </div>

        {/* ── Features col ────────────────────────────────────────── */}
        <div
          ref={featuresRef}
          className="flex flex-col gap-4 py-[30vh]"
        >
          {FEATURES.map((feature, i) => (
            <div
              key={feature.id}
              ref={(el) => { featureRefs.current[i] = el; }}
              style={{ opacity: 0 }} // GSAP animerà da 0
            >
              <Card
                variant={activeIndex === i ? "panel" : "quiet"}
                tone={activeIndex === i ? "neutral" : "neutral"}
                padding="lg"
                className={`
                  transition-[background,border-color,box-shadow]
                  duration-[--duration-slow] ease-[--ease-qoovex]
                  ${activeIndex === i ? "" : "border-transparent shadow-none"}
                `}
              >
                <CardBody>
                  <div className="flex flex-col gap-4">
                    <Badge variant="soft" tone={feature.badgeTone} size="sm">
                      {feature.eyebrow}
                    </Badge>

                    <h3
                      className={`
                        font-display text-(length:--text-xl) font-semibold
                        leading-[1.12] tracking-[-0.018em]
                        transition-colors duration-[--duration-slow] ease-[--ease-qoovex]
                        ${activeIndex === i ? "text-text" : "text-text-faint"}
                      `}
                    >
                      {feature.title}
                    </h3>

                    <p
                      className={`
                        max-w-[52ch] font-body text-(length:--text-base) leading-relaxed
                        transition-[opacity,transform,color] duration-[--duration-slow] ease-[--ease-qoovex]
                        ${activeIndex === i
                          ? "text-text-muted opacity-100 translate-y-0"
                          : "text-text-faint opacity-55 translate-y-1 md:opacity-70"
                        }
                      `}
                    >
                      {feature.body}
                    </p>

                    {/* Progress bar */}
                    {activeIndex === i && (
                      <div className="h-px overflow-hidden rounded-full bg-border">
                        <div
                          className="
                            h-full origin-left rounded-full
                            bg-primary
                            animate-[grow-x_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards]
                          "
                        />
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {i < FEATURES.length - 1 && (
                <Divider spacing="sm" tone="neutral" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}