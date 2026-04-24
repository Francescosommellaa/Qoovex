"use client";

import type { ReactNode } from "react";
import {
  ChefHat,
  ClockCountdown,
  Flame,
  Info,
  Leaf,
  Lightning,
  Star,
  Tag,
  UsersThree,
} from "@phosphor-icons/react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardMedia,
} from "@qoovex/ui";
import type { CardTone } from "@qoovex/ui";
import { SectionHeader } from "../app/sirio-content";

interface ShowcaseBlockProps {
  label: string;
  description: string;
  children: ReactNode;
  className?: string;
}

interface RecipePreview {
  title: string;
  category: string;
  time: string;
  station: string;
  description: string;
  tone: CardTone;
  starred?: boolean;
}

const RECIPE_PREVIEWS: RecipePreview[] = [
  {
    title: "Cacio e pepe",
    category: "Primo",
    time: "18 min",
    station: "Primi",
    description: "Pecorino, pepe tostato e acqua di cottura gestita al grammo.",
    tone: "primary",
    starred: true,
  },
  {
    title: "Ossobuco",
    category: "Secondo",
    time: "90 min",
    station: "Linea calda",
    description: "Cottura lenta, fondo filtrato e gremolada pronta al servizio.",
    tone: "warning",
  },
  {
    title: "Panna cotta",
    category: "Dolce",
    time: "20 min",
    station: "Pasticceria",
    description: "Base pronta, abbattimento controllato e topping separato.",
    tone: "success",
    starred: true,
  },
];

const handleDemoCardClick = () => undefined;

function ShowcaseBlock({
  label,
  description,
  children,
  className,
}: ShowcaseBlockProps) {
  return (
    <div className="mb-[var(--spacing-10)]">
      <div className="mb-[var(--spacing-4)] max-w-3xl">
        <p className="sirio-row__label">{label}</p>
        <p className="sirio-preview-text">{description}</p>
      </div>
      <div
        className={
          className ??
          "grid grid-cols-1 gap-[var(--spacing-4)] md:grid-cols-2 xl:grid-cols-4"
        }
      >
        {children}
      </div>
    </div>
  );
}

function AccentIcon({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--card-accent-border)] bg-[var(--card-accent-soft)] text-[var(--card-accent)]">
      {children}
    </span>
  );
}

function MetaPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface-offset px-[var(--spacing-2)] py-[var(--spacing-1)] text-[length:var(--text-xs)] text-text-muted">
      {children}
    </span>
  );
}

function RecipeCard({ recipe }: { recipe: RecipePreview }) {
  return (
    <Card
      variant="panel"
      tone={recipe.tone}
      interactive
      onCardClick={handleDemoCardClick}
    >
      <CardHeader className="justify-between">
        <div className="flex min-w-0 items-center gap-[var(--spacing-3)]">
          <AccentIcon>
            <ChefHat size={16} aria-hidden="true" />
          </AccentIcon>
          <div className="min-w-0">
            <p className="text-[length:var(--text-xs)] font-medium uppercase tracking-[0.08em] text-text-faint">
              {recipe.category}
            </p>
            <h3 className="truncate font-display text-[length:var(--text-base)] font-semibold text-text">
              {recipe.title}
            </h3>
          </div>
        </div>
        {recipe.starred ? (
          <Star
            size={15}
            weight="fill"
            className="shrink-0 text-warning"
            aria-hidden="true"
          />
        ) : null}
      </CardHeader>
      <CardBody className="flex flex-col gap-[var(--spacing-5)]">
        <p className="sirio-preview-text">{recipe.description}</p>
        <div className="mt-auto flex flex-wrap gap-[var(--spacing-2)] pt-[var(--spacing-2)]">
          <MetaPill>{recipe.time}</MetaPill>
          <MetaPill>{recipe.station}</MetaPill>
        </div>
      </CardBody>
    </Card>
  );
}

function MediaPlaceholder({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-[10rem] items-center justify-center bg-[var(--card-accent-soft)] text-[var(--card-accent)]">
      {children}
    </div>
  );
}

export function SezioneCard() {
  return (
    <section id="card" className="sirio-section">
      <SectionHeader label="Card" id="card" />

      <ShowcaseBlock
        label="Superfici"
        description="La variante descrive il ruolo della superficie, non un effetto visivo isolato."
      >
        <Card variant="surface">
          <CardBody className="flex flex-col gap-[var(--spacing-3)]">
            <p className="sirio-token-label">surface</p>
            <h3 className="font-display text-[length:var(--text-base)] font-semibold text-text">
              Contenuto standard
            </h3>
            <p className="sirio-preview-text">
              Base per liste, riepiloghi e contenuti che non devono dominare la
              pagina.
            </p>
          </CardBody>
        </Card>

        <Card variant="panel">
          <CardBody className="flex flex-col gap-[var(--spacing-3)]">
            <p className="sirio-token-label">panel</p>
            <h3 className="font-display text-[length:var(--text-base)] font-semibold text-text">
              Pannello operativo
            </h3>
            <p className="sirio-preview-text">
              Superficie piu` presente per dashboard, form compatti e blocchi di
              controllo.
            </p>
          </CardBody>
        </Card>

        <Card variant="bento" tone="primary">
          <CardBody className="flex flex-col gap-[var(--spacing-3)]">
            <p className="sirio-token-label">bento</p>
            <h3 className="font-display text-[length:var(--text-base)] font-semibold text-text">
              Blocco editoriale
            </h3>
            <p className="sirio-preview-text">
              Pensata per griglie bento, feature card e preview con gerarchia
              forte.
            </p>
          </CardBody>
        </Card>

        <Card variant="quiet">
          <CardBody className="flex flex-col gap-[var(--spacing-3)]">
            <p className="sirio-token-label">quiet</p>
            <h3 className="font-display text-[length:var(--text-base)] font-semibold text-text">
              Wrapper silenzioso
            </h3>
            <p className="sirio-preview-text">
              Per comporre contenuti senza aggiungere peso visivo o bordi non
              necessari.
            </p>
          </CardBody>
        </Card>
      </ShowcaseBlock>

      <ShowcaseBlock
        label="Card ricetta"
        description="Interattiva solo quando serve davvero: hover, focus e tastiera vengono attivati con `interactive` e `onCardClick`."
        className="grid grid-cols-1 gap-[var(--spacing-4)] lg:grid-cols-3"
      >
        {RECIPE_PREVIEWS.map((recipe) => (
          <RecipeCard key={recipe.title} recipe={recipe} />
        ))}
      </ShowcaseBlock>

      <ShowcaseBlock
        label="Bento layout"
        description="La prop `span` aiuta le card a vivere dentro griglie bento senza classi locali ripetute."
        className="grid auto-rows-[minmax(15rem,auto)] grid-cols-1 gap-[var(--spacing-4)] md:grid-cols-2 2xl:grid-cols-4"
      >
        <Card
          variant="bento"
          tone="primary"
          span="featured"
          interactive
          onCardClick={handleDemoCardClick}
        >
          <CardBody className="gap-[var(--spacing-6)]">
            <div className="flex items-center justify-between gap-[var(--spacing-3)]">
              <AccentIcon>
                <ChefHat size={18} aria-hidden="true" />
              </AccentIcon>
              <MetaPill>Qoovex Workspace</MetaPill>
            </div>
            <div className="mt-auto max-w-lg">
              <p className="sirio-token-label">featured</p>
              <h3 className="font-display text-[length:var(--text-xl)] font-semibold leading-tight text-text">
                Ricette, menu e piano di lavoro in una sola superficie.
              </h3>
              <p className="mt-[var(--spacing-3)] text-[length:var(--text-sm)] leading-7 text-text-muted">
                Card editoriale per hero interni, overview di feature e stati
                importanti del prodotto.
              </p>
            </div>
          </CardBody>
        </Card>

        <Card variant="bento" tone="warning" span="tall">
          <CardHeader className="justify-between">
            <AccentIcon>
              <ClockCountdown size={17} aria-hidden="true" />
            </AccentIcon>
            <span className="text-[length:var(--text-xs)] text-text-faint">
              18:00
            </span>
          </CardHeader>
          <CardBody className="gap-[var(--spacing-3)]">
            <p className="sirio-token-label">tall</p>
            <h3 className="font-display text-[length:var(--text-lg)] font-semibold text-text">
              Servizio serale
            </h3>
            <p className="sirio-preview-text">
              12 task aperti, 4 chef assegnati e due preparazioni critiche da
              chiudere prima della linea.
            </p>
            <div className="mt-auto grid grid-cols-2 gap-[var(--spacing-3)]">
              <div>
                <p className="font-display text-[length:var(--text-lg)] text-text">
                  12
                </p>
                <p className="text-[length:var(--text-xs)] text-text-faint">
                  task
                </p>
              </div>
              <div>
                <p className="font-display text-[length:var(--text-lg)] text-text">
                  4
                </p>
                <p className="text-[length:var(--text-xs)] text-text-faint">
                  chef
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="bento" tone="success">
          <CardBody className="gap-[var(--spacing-4)]">
            <AccentIcon>
              <Leaf size={17} weight="bold" aria-hidden="true" />
            </AccentIcon>
            <div className="mt-auto">
              <p className="sirio-token-label">auto</p>
              <h3 className="font-display text-[length:var(--text-base)] font-semibold text-text">
                Allergeni chiari
              </h3>
              <p className="sirio-preview-text">
                Evidenza semantica senza creare varianti dedicate a ogni caso.
              </p>
            </div>
          </CardBody>
        </Card>

        <Card variant="bento" tone="neutral" span="wide">
          <CardBody className="gap-[var(--spacing-4)]">
            <div className="flex items-start justify-between gap-[var(--spacing-3)]">
              <div>
                <p className="sirio-token-label">wide</p>
                <h3 className="font-display text-[length:var(--text-lg)] font-semibold text-text">
                  Menu digitale
                </h3>
              </div>
              <AccentIcon>
                <Tag size={17} aria-hidden="true" />
              </AccentIcon>
            </div>
            <p className="sirio-preview-text">
              Spazio orizzontale per KPI, preview QR o dettagli compatti del
              menu.
            </p>
            <div className="mt-auto flex flex-wrap gap-[var(--spacing-2)]">
              <MetaPill>6 portate</MetaPill>
              <MetaPill>QR attivo</MetaPill>
              <MetaPill>3 allergeni</MetaPill>
            </div>
          </CardBody>
        </Card>
      </ShowcaseBlock>

      <ShowcaseBlock
        label="Media e azioni"
        description="Gli slot restano semplici: media full-bleed, header compatto, body e footer con azioni."
        className="grid grid-cols-1 gap-[var(--spacing-4)] lg:grid-cols-2"
      >
        <Card variant="panel" tone="primary" padding="lg">
          <CardMedia ratio="wide">
            <MediaPlaceholder>
              <Flame size={38} aria-hidden="true" />
            </MediaPlaceholder>
          </CardMedia>
          <CardHeader className="justify-between">
            <div className="flex items-center gap-[var(--spacing-3)]">
              <AccentIcon>
                <ChefHat size={16} aria-hidden="true" />
              </AccentIcon>
              <span className="font-display text-[length:var(--text-base)] font-semibold text-text">
                Risotto al tartufo
              </span>
            </div>
            <MetaPill>Primo</MetaPill>
          </CardHeader>
          <CardBody className="flex flex-col gap-[var(--spacing-3)]">
            <p className="sirio-preview-text">
              Carnaroli, tartufo nero e burro di bufala. Lo slot media non
              forza contenuti business, ma rende la composizione pronta per le
              ricette.
            </p>
          </CardBody>
          <CardFooter className="justify-between">
            <Button size="sm" variant="ghost">
              Annulla
            </Button>
            <Button size="sm" variant="primary">
              Salva ricetta
            </Button>
          </CardFooter>
        </Card>

        <Card variant="surface" tone="success">
          <CardHeader className="justify-between">
            <div className="flex items-center gap-[var(--spacing-3)]">
              <AccentIcon>
                <UsersThree size={16} aria-hidden="true" />
              </AccentIcon>
              <span className="font-display text-[length:var(--text-base)] font-semibold text-text">
                Piano del giorno
              </span>
            </div>
            <MetaPill>Oggi</MetaPill>
          </CardHeader>
          <CardBody className="flex flex-col gap-[var(--spacing-4)]">
            <p className="sirio-preview-text">
              3 task completati su 7. Prep serale da avviare alle 17:00.
            </p>
            <div className="grid grid-cols-3 gap-[var(--spacing-3)]">
              <div className="rounded-[var(--radius-lg)] border border-border bg-surface-2 p-[var(--spacing-3)]">
                <p className="font-display text-[length:var(--text-lg)] text-text">
                  3
                </p>
                <p className="text-[length:var(--text-xs)] text-text-faint">
                  fatti
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-border bg-surface-2 p-[var(--spacing-3)]">
                <p className="font-display text-[length:var(--text-lg)] text-text">
                  7
                </p>
                <p className="text-[length:var(--text-xs)] text-text-faint">
                  task
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-border bg-surface-2 p-[var(--spacing-3)]">
                <p className="font-display text-[length:var(--text-lg)] text-text">
                  4
                </p>
                <p className="text-[length:var(--text-xs)] text-text-faint">
                  membri
                </p>
              </div>
            </div>
          </CardBody>
          <CardFooter className="justify-between text-[length:var(--text-xs)] text-text-faint">
            <span className="inline-flex items-center gap-[var(--spacing-2)]">
              <ClockCountdown size={14} aria-hidden="true" />
              Aggiornato 12:45
            </span>
            <span>Start</span>
          </CardFooter>
        </Card>
      </ShowcaseBlock>

      <ShowcaseBlock
        label="Toni semantici"
        description="Il tono controlla accento, bordo e highlight; non serve creare varianti nuove per ogni stato."
        className="grid grid-cols-1 gap-[var(--spacing-4)] md:grid-cols-2 xl:grid-cols-4"
      >
        <Card variant="surface" tone="primary">
          <CardBody className="flex gap-[var(--spacing-3)]">
            <AccentIcon>
              <Info size={16} weight="bold" aria-hidden="true" />
            </AccentIcon>
            <div>
              <p className="font-display text-[length:var(--text-base)] font-semibold text-text">
                Suggerimento
              </p>
              <p className="sirio-preview-text">
                Questo menu ha 3 allergeni sovrapposti.
              </p>
            </div>
          </CardBody>
        </Card>

        <Card variant="surface" tone="warning">
          <CardBody className="flex gap-[var(--spacing-3)]">
            <AccentIcon>
              <Lightning size={16} weight="bold" aria-hidden="true" />
            </AccentIcon>
            <div>
              <p className="font-display text-[length:var(--text-base)] font-semibold text-text">
                Preparazione critica
              </p>
              <p className="sirio-preview-text">
                Avviare il fondo entro 15 minuti.
              </p>
            </div>
          </CardBody>
        </Card>

        <Card variant="surface" tone="success">
          <CardBody className="flex gap-[var(--spacing-3)]">
            <AccentIcon>
              <Leaf size={16} weight="bold" aria-hidden="true" />
            </AccentIcon>
            <div>
              <p className="font-display text-[length:var(--text-base)] font-semibold text-text">
                Vegetariano
              </p>
              <p className="sirio-preview-text">
                Ricetta pronta per filtro menu.
              </p>
            </div>
          </CardBody>
        </Card>

        <Card variant="surface" tone="error">
          <CardBody className="flex gap-[var(--spacing-3)]">
            <AccentIcon>
              <Flame size={16} weight="bold" aria-hidden="true" />
            </AccentIcon>
            <div>
              <p className="font-display text-[length:var(--text-base)] font-semibold text-text">
                Stock insufficiente
              </p>
              <p className="sirio-preview-text">
                Manca una materia prima per il servizio.
              </p>
            </div>
          </CardBody>
        </Card>
      </ShowcaseBlock>
    </section>
  );
}
