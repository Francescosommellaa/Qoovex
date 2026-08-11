import {
  IconCamera,
  IconCheck,
  IconClock,
  IconLock,
  IconPencil,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";

export function InteractiveAppMockup() {
  return (
    <div className="w-full text-foreground select-none font-sans">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl ring-1 ring-foreground/10">
        {/* Minimal Window Header */}
        <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div aria-hidden className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-foreground/15" />
              <span className="size-2.5 rounded-full bg-foreground/15" />
              <span className="size-2.5 rounded-full bg-foreground/15" />
            </div>
            <span className="font-semibold text-xs text-foreground">
              Residenza Via Roma 42 · Cronologia Cantiere
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[0.7rem] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Spazio Condiviso</span>
          </div>
        </div>

        {/* Minimal Stream Body with bottom fade to transparent */}
        <div
          className="relative max-h-[380px] overflow-hidden p-4 sm:p-6 space-y-3 bg-background"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 55%, rgba(0, 0, 0, 0.2) 80%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 55%, rgba(0, 0, 0, 0.2) 80%, transparent 100%)",
          }}
        >
          {/* Card 1: Photo update */}
          <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <IconCamera className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Impresa Bianchi</span>
                <span className="text-[0.68rem] text-muted-foreground font-normal">· Oggi 10:30</span>
              </div>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[0.65rem]">
                Condiviso
              </Badge>
            </div>
            <h3 className="font-semibold text-xs sm:text-sm text-foreground">
              Posa impianti idraulici e collaudo bagno padronale
            </h3>
            <div className="flex items-center gap-1 text-[0.68rem] text-emerald-600 dark:text-emerald-400 font-medium pt-1 border-t border-border/40">
              <IconCheck className="size-3.5" />
              <span>Visto dal cliente Marco C.</span>
            </div>
          </div>

          {/* Card 2: Change request */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <IconPencil className="size-4 text-amber-600 dark:text-amber-400" />
                <span>Variante d&apos;Opera #03</span>
              </div>
              <Badge variant="warning" className="text-[0.65rem]">
                In Attesa
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-xs sm:text-sm text-foreground">
                Punti luce LED soggiorno
              </h3>
              <span className="font-bold text-xs text-foreground">+ € 380,00</span>
            </div>
          </div>

          {/* Card 3: Internal Note */}
          <div className="rounded-xl border border-dashed bg-muted/30 p-3 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <IconLock className="size-3.5" /> Nota Interna Impresa
              </span>
              <span className="text-[0.65rem] border rounded px-1.5 py-0.5 bg-muted">
                🔒 Solo Impresa
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Verificare consegna materiale piastrelle entro giovedì.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
