"use client";
import type { ReactNode } from "react";
import { IconArrowRight, IconInfoCircle } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { buttonVariants } from "@qoovex/ui/components/button";
import { FloatingNavigation, type FloatingNavigationSection } from "@qoovex/ui/components/floating-navigation";
import { BrandMark } from "@/components/brand-mark";
import { contactEmail, contactHref, legalLinks, primaryCtaLabel, workspaceUrl } from "./site-config";
type SiteShellProps = { children: ReactNode; sections?: FloatingNavigationSection[] };
type LegalPageProps = { children: ReactNode; eyebrow?: string; intro: string; title: string };
const mainLinks = [{ href: "/", label: "Direzione vNext" }, { href: "/contattaci", label: "Contattaci" }];
export function SiteHeader({ sections = [] }: { sections?: FloatingNavigationSection[] }) { const pathname = usePathname(); return <FloatingNavigation action={<span className="hidden sm:contents"><a className={buttonVariants()} href={workspaceUrl}>{primaryCtaLabel}<IconArrowRight data-icon="inline-end" /></a></span>} activeHref={pathname} brand={(compact) => <BrandMark compact={compact} />} homeHref="/" sections={sections} surfaceLabel="Pagine" surfaceLinks={mainLinks} />; }
export function SiteFooter() { return <footer className="border-t bg-card"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6"><div><BrandMark /><p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">La build corrente è una foundation tecnica. Qoovex vNext è una direzione prodotto approvata e non ancora implementata.</p><a className="mt-3 inline-block text-sm text-muted-foreground hover:text-foreground" href={contactHref}>{contactEmail}</a></div><nav className="flex flex-wrap gap-4 text-sm" aria-label="Link legali">{legalLinks.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}</nav><p className="text-xs text-muted-foreground">© 2026 Qoovex. Nessuna capacità vNext è presentata come disponibile.</p></div></footer>; }
export function SiteShell({ children, sections = [] }: SiteShellProps) { return <div className="min-h-dvh bg-background"><SiteHeader sections={sections} /><main>{children}</main><SiteFooter /></div>; }
export function LegalPage({ children, eyebrow = "Bozza da validare", intro, title }: LegalPageProps) { return <SiteShell><section className="border-b"><div className="mx-auto max-w-4xl px-4 py-14 sm:px-6"><p className="text-sm font-medium text-muted-foreground">{eyebrow}</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">{title}</h1><p className="mt-5 text-lg text-muted-foreground">{intro}</p></div></section><div className="mx-auto max-w-4xl px-4 sm:px-6"><Alert className="mt-8"><IconInfoCircle /><AlertTitle>Contenuto da validare</AlertTitle><AlertDescription>Questa traccia richiede verifica qualificata prima dell’uso commerciale.</AlertDescription></Alert><div className="legal-content">{children}</div></div></SiteShell>; }
export function LegalSection({ children, title }: { children: ReactNode; title: string }) { return <section className="legal-section"><h2>{title}</h2>{children}</section>; }
