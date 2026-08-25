"use client";

import Link from "next/link";
import { IconChevronRight, IconSearch } from "@tabler/icons-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@qoovex/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@qoovex/ui/components/dialog";
import { Field, FieldDescription, FieldLabel } from "@qoovex/ui/components/field";
import { SearchField, SearchResults } from "@qoovex/ui/components/search-field";
import { presentSearchResultDetail, presentSearchResultType } from "@shared/lib/product-state-presentation";

interface JobSiteSearchResult {
  id?: unknown;
  resultType?: unknown;
  title?: unknown;
  originalFileName?: unknown;
  type?: unknown;
  status?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface PresentedJobSiteSearchResult {
  date: string | null;
  detail: string | null;
  href: string;
  title: string;
  typeLabel: string;
}

const resultSectionTargets = {
  attachment: "file",
  payment: "pagamenti",
  proposal: "modifiche",
  request: "richieste",
  step: "step",
  timeline: "timeline",
} as const;

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function formatResultDate(value: unknown) {
  const source = stringValue(value);
  if (!source) return null;
  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" }).format(parsed);
}

export function presentJobSiteSearchResult(
  item: JobSiteSearchResult,
  { fileSectionId, jobSitePath }: { fileSectionId: "documenti" | "file"; jobSitePath: string },
): PresentedJobSiteSearchResult {
  const resultType = stringValue(item.resultType) ?? "";
  const typeLabel = presentSearchResultType(resultType).label;
  const title = resultType === "request" || resultType === "step"
    ? stringValue(item.title) ?? typeLabel
    : resultType === "attachment"
      ? stringValue(item.originalFileName) ?? typeLabel
      : typeLabel;
  const detailValue = resultType === "timeline" ? item.type : item.status;
  const presentedDetail = presentSearchResultDetail(resultType, detailValue);
  const detail = presentedDetail === "Risultato" || presentedDetail === title ? null : presentedDetail;
  const target = resultType === "attachment"
    ? fileSectionId
    : resultSectionTargets[resultType as keyof typeof resultSectionTargets] ?? "riepilogo";

  return {
    date: formatResultDate(item.updatedAt ?? item.createdAt),
    detail,
    href: `${jobSitePath}#${target}`,
    title,
    typeLabel,
  };
}

export function JobSiteSearch({
  endpoint,
  fileSectionId,
  jobSiteName,
  jobSitePath,
}: {
  endpoint: string;
  fileSectionId: "documenti" | "file";
  jobSiteName: string;
  jobSitePath: string;
}) {
  const queryId = useId();
  const queryDescriptionId = useId();
  const requestRef = useRef<AbortController | null>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<{
    error: string | null;
    items: JobSiteSearchResult[];
    pending: boolean;
    query: string | null;
  }>({ error: null, items: [], pending: false, query: null });

  useEffect(() => () => requestRef.current?.abort(), []);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) return;
    requestRef.current?.abort();
    requestRef.current = null;
    setState((current) => ({ ...current, pending: false }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get("query") ?? "").trim();
    if (query.length < 2) return;

    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setState({ error: null, items: [], pending: true, query });

    try {
      const response = await fetch(`${endpoint}?q=${encodeURIComponent(query)}`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => ({})) as { items?: JobSiteSearchResult[] };
      if (controller.signal.aborted) return;
      setState(response.ok
        ? { error: null, items: payload.items ?? [], pending: false, query }
        : { error: "La ricerca non è disponibile. Riprova.", items: [], pending: false, query });
    } catch {
      if (controller.signal.aborted) return;
      setState({ error: "La ricerca non è disponibile. Controlla la connessione e riprova.", items: [], pending: false, query });
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  }

  return <Dialog onOpenChange={handleOpenChange} open={open}>
    <DialogTrigger render={<Button type="button" variant="outline" />}>
      <IconSearch aria-hidden="true" />
      Cerca nel lavoro
    </DialogTrigger>
    <DialogContent aria-busy={state.pending} closeButtonProps={{ "aria-label": "Chiudi ricerca nel lavoro" }} size="lg">
      <DialogHeader>
        <DialogTitle>Cerca in {jobSiteName}</DialogTitle>
        <DialogDescription>Trova aggiornamenti, richieste, proposte, pagamenti e file che puoi consultare in questo lavoro.</DialogDescription>
      </DialogHeader>
      <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={submit}>
        <Field className="min-w-0 flex-1">
          <FieldLabel htmlFor={queryId}>Cosa stai cercando?</FieldLabel>
          <SearchField aria-describedby={queryDescriptionId} autoComplete="off" id={queryId} minLength={2} name="query" placeholder="Per esempio: acconto o sopralluogo" required />
          <FieldDescription id={queryDescriptionId}>Inserisci almeno 2 caratteri.</FieldDescription>
        </Field>
        <Button disabled={state.pending} type="submit">{state.pending ? "Ricerca…" : "Cerca"}</Button>
      </form>
      <SearchResults aria-busy={state.pending} aria-live={state.error ? "off" : "polite"}>
        {state.pending ? <p className="text-sm text-muted-foreground">Ricerca in corso…</p> : null}
        {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
        {!state.pending && !state.error && state.query && state.items.length === 0 ? <p className="text-sm text-muted-foreground">Nessun risultato per “{state.query}”. Prova con un altro termine.</p> : null}
        {!state.pending && !state.error && state.items.length > 0 ? <>
          <p className="text-sm text-muted-foreground">{state.items.length === 1 ? "1 risultato" : `${state.items.length} risultati`}</p>
          <ul aria-label="Risultati della ricerca" className="divide-y">
            {state.items.map((item, index) => {
              const result = presentJobSiteSearchResult(item, { fileSectionId, jobSitePath });
              return <li key={`${String(item.id ?? "result")}-${index}`}>
                <Link
                  aria-label={`Apri ${result.title} in ${result.typeLabel}`}
                  className="group flex min-h-11 items-center justify-between gap-3 rounded-sm py-3 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  href={result.href}
                  onClick={() => setOpen(false)}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">{result.title}</span>
                    <span className="block text-sm text-muted-foreground">{[result.typeLabel, result.detail, result.date].filter(Boolean).join(" · ")}</span>
                  </span>
                  <IconChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                </Link>
              </li>;
            })}
          </ul>
        </> : null}
      </SearchResults>
    </DialogContent>
  </Dialog>;
}
