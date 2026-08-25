import {
  IconAlertTriangle,
  IconCircleCheck,
  IconFileText,
  IconInfoCircle,
  IconLoader2,
  IconSettings,
  IconShieldCheck,
} from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { IconMotionProof } from "@/components/icon-motion-proof";
import { Button } from "@qoovex/ui/components/button";
import { IconButton } from "@qoovex/ui/components/icon-button";
import { Card, CardContent, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Separator } from "@qoovex/ui/components/separator";

const iconScale = [
  {
    id: "compact",
    label: "Compact",
    size: "14 px",
    token: "--icon-compact",
    className: "qv-icon-compact",
    use: "Metadata, testo xs/sm e densità controllata.",
  },
  {
    id: "default",
    label: "Default / control",
    size: "16 px",
    token: "--icon",
    className: "qv-icon-default",
    use: "Button, field, menu, navigation e testo base.",
  },
  {
    id: "emphasized",
    label: "Emphasized",
    size: "20 px",
    token: "--icon-emphasized",
    className: "qv-icon-emphasized",
    use: "Leading status con gerarchia maggiore.",
  },
  {
    id: "illustrative",
    label: "Illustrative",
    size: "28 px",
    token: "--icon-illustrative",
    className: "qv-icon-illustrative",
    use: "Empty state e marker focali in container dedicati.",
  },
] as const;

export default function IconFoundationPage() {
  return (
    <div className="mx-auto w-full max-w-6xl" data-icon-foundation>
      <PageHeader
        description="Scala, allineamento, semantica accessibile e lifecycle delle icone Qoovex, senza nascondere le API native Tabler."
        importPath="@tabler/icons-react · @qoovex/ui/styles/base.css"
        title="Icone"
      />

      <div className="flex flex-col gap-12">
        <section aria-labelledby="icon-scale-title">
          <div className="mb-5 max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="icon-scale-title">
              Scala semantica
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              La size descrive una responsabilità, non un’aggiustatura locale. Il tratto resta
              quello Tabler e il colore eredita sempre <code>currentColor</code>.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-icon-scale-grid>
            {iconScale.map((role) => (
              <Card data-icon-scale={role.id} key={role.id} size="sm">
                <CardHeader>
                  <div className="flex min-h-10 items-center justify-between gap-3">
                    <IconSettings
                      aria-hidden="true"
                      className={role.className}
                      data-icon-glyph
                    />
                    <span className="font-accent text-xs tabular-nums text-muted-foreground">
                      {role.size}
                    </span>
                  </div>
                  <CardTitle>{role.label}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 text-xs text-muted-foreground">
                  <code>{role.token}</code>
                  <p>{role.use}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            12 px resta un’eccezione interna dei controlli micro; 24 px non ha oggi un ruolo
            canonico; 32 px resta una decisione component-specific per container illustrativi.
          </p>
        </section>

        <Separator />

        <section aria-labelledby="icon-alignment-title">
          <div className="mb-5 max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="icon-alignment-title">
              Allineamento ottico
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              La griglia rende misurabili box, line box e centro del controllo. Solo il leading
              multilinea usa un offset locale verso la prima riga.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2" data-icon-alignment-grid>
            <Card data-icon-alignment="text" size="sm">
              <CardHeader><CardTitle>Icona + testo</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                {[
                  ["xs", "text-xs leading-4", "qv-icon-compact"],
                  ["sm", "text-sm leading-5", "qv-icon-default"],
                  ["base", "text-base leading-6", "qv-icon-default"],
                ].map(([label, textClass, iconClass]) => (
                  <div className={`inline-flex w-fit items-center gap-2 ${textClass}`} data-icon-text-row={label} key={label}>
                    <IconFileText aria-hidden="true" className={`${iconClass} shrink-0`} data-icon-glyph />
                    <span>Verbale operativo · {label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card data-icon-alignment="controls" size="sm">
              <CardHeader><CardTitle>Icon-only e multilinea</CardTitle></CardHeader>
              <CardContent className="grid gap-5">
                <div className="flex items-center gap-3">
                  <IconButton aria-label="Apri impostazioni icona" data-icon-only-control type="button" variant="outline">
                    <IconSettings aria-hidden="true" className="qv-icon-default" />
                  </IconButton>
                  <span className="text-sm text-muted-foreground">Focus, nome e hit area appartengono al button.</span>
                </div>
                <div className="flex max-w-md items-start gap-3" data-icon-leading-multiline>
                  <IconInfoCircle aria-hidden="true" className="qv-icon-emphasized mt-0.5 shrink-0 text-info" data-icon-glyph />
                  <p className="text-base leading-6 text-muted-foreground" data-icon-leading-copy>
                    Il leading icon segue il centro della prima line box anche quando il testo si
                    estende su più righe o usa il fallback font.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        <section aria-labelledby="icon-semantics-title">
          <div className="mb-5 max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="icon-semantics-title">
              Semantica e colore
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Decorative, icon-only e informative sono tre contratti distinti. Tema e forced
              colors funzionano perché il glyph eredita il colore del proprio owner.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card data-icon-accessibility="decorative" size="sm">
              <CardHeader><CardTitle>Decorative</CardTitle></CardHeader>
              <CardContent className="flex items-center gap-2 text-sm">
                <IconCircleCheck aria-hidden="true" className="qv-icon-default text-success" />
                <span>Documento verificato</span>
              </CardContent>
            </Card>
            <Card data-icon-accessibility="informative" size="sm">
              <CardHeader><CardTitle>Informative standalone</CardTitle></CardHeader>
              <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
                <IconShieldCheck
                  aria-label="Integrità verificata"
                  className="qv-icon-emphasized text-success"
                  data-informative-icon
                  role="img"
                />
                <span>L’icona possiede un nome perché comunica contenuto autonomo.</span>
              </CardContent>
            </Card>
            <Card data-icon-accessibility="status" size="sm">
              <CardHeader><CardTitle>Status + currentColor</CardTitle></CardHeader>
              <CardContent className="flex items-center gap-2 text-sm text-destructive">
                <IconAlertTriangle aria-hidden="true" className="qv-icon-emphasized" data-current-color-icon />
                <span className="text-foreground">Richiede attenzione</span>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        <section aria-labelledby="icon-loading-title">
          <div className="mb-5 max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="icon-loading-title">
              Loading
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Lo spinner è decorativo; il parent mantiene busy state e feedback testuale. In
              reduced motion la rotazione si ferma senza nascondere lo stato.
            </p>
          </div>
          <div
            aria-busy="true"
            aria-live="polite"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm"
            data-icon-loader-proof
          >
            <IconLoader2 aria-hidden="true" className="qv-icon-default animate-spin motion-reduce:animate-none" data-loader-icon />
            <span>Caricamento in corso</span>
          </div>
        </section>

        <Separator />

        <section aria-labelledby="icon-motion-title">
          <div className="mb-5 max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight" id="icon-motion-title">
              Lifecycle Motion
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Il button possiede semantica e activation; Motion governa soltanto la continuità
              open/close del chevron. Click ripetuti retargettano il valore corrente.
            </p>
          </div>
          <IconMotionProof />
        </section>
      </div>
    </div>
  );
}
