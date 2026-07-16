import { IconAlertTriangle, IconChevronDown, IconDots, IconInfoCircle, IconPlus, IconSearch } from "@tabler/icons-react";
import { SiteHeader } from "@/components/site-header";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@qoovex/ui/components/avatar";
import { Badge } from "@qoovex/ui/components/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@qoovex/ui/components/breadcrumb";
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Checkbox } from "@qoovex/ui/components/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@qoovex/ui/components/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@qoovex/ui/components/dropdown-menu";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import { Separator } from "@qoovex/ui/components/separator";
import { Skeleton } from "@qoovex/ui/components/skeleton";
import { Spinner } from "@qoovex/ui/components/spinner";
import { Switch } from "@qoovex/ui/components/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@qoovex/ui/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@qoovex/ui/components/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@qoovex/ui/components/tooltip";

const swatches = [
  ["Background", "bg-background"], ["Foreground", "bg-foreground"], ["Card", "bg-card"], ["Muted", "bg-muted"],
  ["Primary", "bg-primary"], ["Secondary", "bg-secondary"], ["Accent", "bg-accent"], ["Destructive", "bg-destructive"],
] as const;

const catalogSections = [
  { id: "catalogo", label: "Introduzione" },
  { id: "fondazioni", label: "Fondazioni" },
  { id: "componenti", label: "Componenti" },
];

export default function CatalogPage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader action={false} brand="sirio" sections={catalogSections} />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid scroll-mt-24 gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end" id="catalogo">
          <div><Badge variant="outline">Sirio</Badge><h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Fondazioni e componenti.</h1></div>
          <div className="max-w-2xl"><p className="text-lg leading-8 text-muted-foreground">Catalogo integrato del design system canonico Qoovex condiviso con marketing e workspace, basato su shadcn base-nova, Base UI, Tabler Icons e tema Vercel.</p><div className="mt-5 flex flex-wrap gap-2"><a className={buttonVariants()} href="/marketing">Vedi il marketing</a><a className={buttonVariants({ variant: "outline" })} href="/dashboard">Vedi la dashboard</a></div></div>
        </section>

        <Separator className="my-10" />
        <section aria-labelledby="foundations-title" className="scroll-mt-24" id="fondazioni">
          <div><p className="text-sm font-medium text-muted-foreground">Fondazioni</p><h2 id="foundations-title" className="mt-2 text-2xl font-semibold tracking-tight">Colore, tipo, forma e profondità</h2></div>
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <Card><CardHeader><CardTitle>Palette semantica</CardTitle><CardDescription>Gli stessi ruoli rispondono a light, dark e preferenza di sistema.</CardDescription></CardHeader><CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">{swatches.map(([name, color]) => <figure key={name}><div className={`h-20 rounded-lg border ${color}`} /><figcaption className="mt-2 text-xs text-muted-foreground">{name}</figcaption></figure>)}</CardContent></Card>
            <Card><CardHeader><CardTitle>Geist e Geist Mono</CardTitle><CardDescription>Una famiglia compatta per marketing e prodotto.</CardDescription></CardHeader><CardContent className="grid gap-4"><p className="text-3xl font-semibold tracking-tight">Qoovex organizza il lavoro.</p><p className="text-sm leading-6 text-muted-foreground">Testo operativo leggibile anche con contenuti estesi e densità maggiore.</p><code className="rounded-lg bg-muted p-3 font-mono text-sm">documento_2026_07.pdf</code></CardContent></Card>
            <Card><CardHeader><CardTitle>Raggi</CardTitle><CardDescription>Base 0.5rem con scala coerente.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-4"><div className="size-20 rounded-sm border bg-muted" /><div className="size-20 rounded-md border bg-muted" /><div className="size-20 rounded-lg border bg-muted" /><div className="size-20 rounded-xl border bg-muted" /></CardContent></Card>
            <Card><CardHeader><CardTitle>Ombre</CardTitle><CardDescription>Profondità contenuta per menu, overlay e superfici elevate.</CardDescription></CardHeader><CardContent className="grid grid-cols-2 gap-4"><div className="h-20 rounded-lg border bg-card shadow-sm" /><div className="h-20 rounded-lg border bg-card shadow-xl" /></CardContent></Card>
            <Card className="xl:col-span-2"><CardHeader><CardTitle>Sottolineatura semantica</CardTitle><CardDescription>Il trattamento dipende dal ruolo del link, non dalla singola pagina.</CardDescription></CardHeader><CardContent className="grid gap-5 md:grid-cols-3"><div><p className="text-xs font-medium text-muted-foreground">Nel testo</p><p className="mt-2 text-sm leading-6">Un link come <a data-link="inline" href="#componenti">componenti condivisi</a> resta sempre riconoscibile.</p></div><div><p className="text-xs font-medium text-muted-foreground">Autonomo</p><p className="mt-2 text-sm leading-6"><a data-link="quiet" href="/marketing">Apri la superficie marketing</a> mostra la linea su hover e focus.</p></div><div><p className="text-xs font-medium text-muted-foreground">Navigazione e CTA</p><div className="mt-2 flex flex-wrap gap-2"><a className={buttonVariants({ size: "sm" })} href="/dashboard">Apri dashboard</a><a className="rounded-md px-2 py-1 text-sm font-medium hover:bg-muted" data-link="plain" href="#fondazioni">Torna alle fondazioni</a></div></div></CardContent></Card>
            <Card className="xl:col-span-2">
              <CardHeader><CardTitle>Scrollbar contestuale</CardTitle><CardDescription>Sottile e invisibile a riposo; emerge durante scroll, hover, focus o vicino al bordo della viewport.</CardDescription></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div aria-label="Prova scrollbar verticale" className="h-36 overflow-y-auto rounded-lg border bg-muted/20 p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" data-scrollbar-proof="vertical" tabIndex={0}>
                  <div className="grid gap-2">{["Situazioni aperte", "Contenuti presenti", "Da verificare", "In scadenza", "Pacchetti pronti", "Revisioni recenti"].map((item) => <div className="rounded-md border bg-background px-3 py-2 text-sm" key={item}>{item}</div>)}</div>
                </div>
                <div aria-label="Prova scrollbar orizzontale" className="overflow-x-auto rounded-lg border bg-muted/20 outline-none focus-visible:ring-2 focus-visible:ring-ring" data-scrollbar-proof="horizontal" tabIndex={0}>
                  <div className="grid w-[42rem] grid-cols-4 gap-3 p-3">{["Documento", "Contesto", "Stato", "Prossima azione"].map((item) => <div className="rounded-md border bg-background px-3 py-6 text-center text-sm font-medium" key={item}>{item}</div>)}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12" />
        <section aria-labelledby="components-title" className="scroll-mt-24" id="componenti">
          <p className="text-sm font-medium text-muted-foreground">Componenti</p><h2 id="components-title" className="mt-2 text-2xl font-semibold tracking-tight">Controlli e composizioni</h2>
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <Card><CardHeader><CardTitle>Azioni</CardTitle><CardDescription>Varianti, focus, disabled e loading composto.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2"><Button>Salva</Button><Button variant="secondary">Secondaria</Button><Button variant="outline">Contorno</Button><Button variant="ghost">Discreta</Button><Button variant="destructive">Elimina</Button><Button disabled><Spinner />Salvataggio</Button><Button disabled>Non disponibile</Button><Tooltip><TooltipTrigger render={<Button aria-label="Aggiungi elemento" size="icon" variant="outline" />}><IconPlus /></TooltipTrigger><TooltipContent>Aggiungi elemento</TooltipContent></Tooltip></CardContent></Card>

            <Card><CardHeader><CardTitle>Stati semantici</CardTitle><CardDescription>Il testo conserva il significato oltre al colore.</CardDescription></CardHeader><CardContent className="grid gap-3"><Alert><IconInfoCircle /><AlertTitle>Informazioni da verificare</AlertTitle><AlertDescription>Il contenuto è presente, ma richiede un controllo.</AlertDescription></Alert><Alert variant="destructive"><IconAlertTriangle /><AlertTitle>Recupero non completato</AlertTitle><AlertDescription>Riprova oppure torna alla sezione precedente.</AlertDescription></Alert><div className="flex flex-wrap gap-2"><Badge>Predefinito</Badge><Badge variant="secondary">Secondario</Badge><Badge variant="outline">Da verificare</Badge><Badge variant="destructive">Mancante</Badge></div></CardContent></Card>

            <Card><CardHeader><CardTitle>Campi</CardTitle><CardDescription>Label, aiuto, errore e controlli di selezione.</CardDescription></CardHeader><CardContent><FieldGroup><Field><FieldLabel htmlFor="catalog-search">Ricerca</FieldLabel><div className="relative"><IconSearch className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-8" id="catalog-search" placeholder="Cerca un documento" /></div><FieldDescription>Il contenuto lungo resta leggibile.</FieldDescription></Field><Field data-invalid><FieldLabel htmlFor="catalog-code">Codice riferimento</FieldLabel><Input aria-invalid id="catalog-code" value="Riferimento non riconosciuto" readOnly /><FieldError>Controlla il valore e riprova.</FieldError></Field><Field><FieldLabel>Contesto</FieldLabel><Select defaultValue="aurora"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectLabel>Cantieri</SelectLabel><SelectItem value="aurora">Cantiere Aurora</SelectItem><SelectItem value="naviglio">Cantiere Naviglio</SelectItem></SelectGroup></SelectContent></Select></Field><Field orientation="horizontal"><Checkbox defaultChecked id="catalog-confirm" /><FieldLabel htmlFor="catalog-confirm">Conferma richiesta</FieldLabel></Field><Field orientation="horizontal"><Switch defaultChecked id="catalog-updates" /><FieldLabel htmlFor="catalog-updates">Aggiornamenti attivi</FieldLabel></Field></FieldGroup></CardContent></Card>

            <Card><CardHeader><CardTitle>Navigazione e menu</CardTitle><CardDescription>Breadcrumb, avatar, menu e contenuto collassabile.</CardDescription></CardHeader><CardContent className="grid gap-5"><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/">Sirio</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Catalogo</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb><div className="flex flex-wrap items-center justify-between gap-4"><AvatarGroup><Avatar><AvatarFallback>MR</AvatarFallback></Avatar><Avatar><AvatarFallback>EC</AvatarFallback></Avatar><AvatarGroupCount>+3</AvatarGroupCount></AvatarGroup><DropdownMenu><DropdownMenuTrigger render={<Button variant="outline" />}>Azioni <IconDots data-icon="inline-end" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuGroup><DropdownMenuLabel>Documento</DropdownMenuLabel><DropdownMenuItem>Apri</DropdownMenuItem><DropdownMenuItem>Scarica</DropdownMenuItem></DropdownMenuGroup><DropdownMenuSeparator /><DropdownMenuItem variant="destructive">Rimuovi</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div><Collapsible><CollapsibleTrigger render={<Button className="group/collapsible w-full justify-between" variant="secondary" />}>Dettagli aggiuntivi <IconChevronDown className="transition-transform duration-200 group-data-panel-open/collapsible:rotate-180" /></CollapsibleTrigger><CollapsibleContent className="pt-3 text-sm leading-6 text-muted-foreground">Il contenuto collassabile mantiene una destinazione tastiera e comunica il cambio di stato ruotando lâ€™indicatore.</CollapsibleContent></Collapsible></CardContent></Card>

            <Card className="xl:col-span-2"><CardHeader><CardTitle>Dati e stati di caricamento</CardTitle><CardDescription>Tabs, tabella con overflow orizzontale e skeleton.</CardDescription><CardAction><Badge variant="outline">Responsive</Badge></CardAction></CardHeader><CardContent><Tabs defaultValue="table"><TabsList><TabsTrigger value="table">Tabella</TabsTrigger><TabsTrigger value="loading">Loading</TabsTrigger></TabsList><TabsContent className="pt-4" value="table"><Table><TableHeader><TableRow><TableHead>Elemento</TableHead><TableHead>Contesto</TableHead><TableHead>Stato</TableHead><TableHead className="text-right">Aggiornamento</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell className="font-medium">Visura aziendale con denominazione estesa</TableCell><TableCell>Cantiere Aurora</TableCell><TableCell><Badge variant="outline">Da verificare</Badge></TableCell><TableCell className="text-right font-mono">15/07/2026</TableCell></TableRow><TableRow><TableCell className="font-medium">Pacchetto accesso lavoratori</TableCell><TableCell>Cantiere Naviglio</TableCell><TableCell><Badge variant="secondary">Pronto</Badge></TableCell><TableCell className="text-right font-mono">14/07/2026</TableCell></TableRow></TableBody></Table></TabsContent><TabsContent className="pt-4" value="loading"><div aria-busy="true" aria-label="Caricamento catalogo" className="grid gap-3 sm:grid-cols-3"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div></TabsContent></Tabs></CardContent><CardFooter className="text-xs text-muted-foreground">I valori sono dimostrativi e non provengono dal runtime prodotto.</CardFooter></Card>
          </div>
        </section>
      </main>
    </div>
  );
}
