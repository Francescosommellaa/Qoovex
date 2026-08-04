"use client";

import * as React from "react";
import {
  IconSearch,
  IconPlus,
  IconDots,
  IconTrash,
  IconCheck,
  IconAlertTriangle,
  IconInfoCircle,
  IconBuildingStore,
  IconUser,
  IconLock,
  IconChevronDown,
  IconSend,
  IconFilter,
  IconCalendar,
  IconShare,
  IconClock,
  IconShield,
  IconArrowRight,
  IconFileText,
  IconSparkles,
} from "@tabler/icons-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

import { Button, buttonVariants } from "@qoovex/ui/components/button";
import { Input } from "@qoovex/ui/components/input";
import { PasswordInput } from "@qoovex/ui/components/password-input";
import { OtpInput } from "@qoovex/ui/components/otp-input";
import { SearchField } from "@qoovex/ui/components/search-field";
import { Textarea } from "@qoovex/ui/components/textarea";
import { Checkbox } from "@qoovex/ui/components/checkbox";
import { Switch } from "@qoovex/ui/components/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import { Label } from "@qoovex/ui/components/label";
import { Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldContent } from "@qoovex/ui/components/field";
import { Badge } from "@qoovex/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@qoovex/ui/components/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@qoovex/ui/components/collapsible";
import { Separator } from "@qoovex/ui/components/separator";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@qoovex/ui/components/empty";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@qoovex/ui/components/dialog";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@qoovex/ui/components/sheet";
import { Tooltip, TooltipTrigger, TooltipContent } from "@qoovex/ui/components/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuShortcut } from "@qoovex/ui/components/dropdown-menu";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@qoovex/ui/components/breadcrumb";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@qoovex/ui/components/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@qoovex/ui/components/table";
import { ChartContainer, type ChartConfig } from "@qoovex/ui/components/chart";
import { Timeline, TimelineEntry, TimelineMarker, TimelineContent, TimelineActor, TimelineDateSeparator, TimelineTransition } from "@qoovex/ui/components/timeline";
import { WorkQueueItem, WorkQueueItemContent, WorkQueueItemActions } from "@qoovex/ui/components/work-queue-item";
import { Alert, AlertTitle, AlertDescription } from "@qoovex/ui/components/alert";
import { Spinner } from "@qoovex/ui/components/spinner";
import { Skeleton } from "@qoovex/ui/components/skeleton";
import { ThemeToggle } from "@qoovex/ui/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";

const chartData = [
  { month: "Gen", progress: 40, cantiere: 24 },
  { month: "Feb", progress: 65, cantiere: 35 },
  { month: "Mar", progress: 50, cantiere: 45 },
  { month: "Apr", progress: 85, cantiere: 60 },
  { month: "Mag", progress: 92, cantiere: 78 },
];

const chartConfig: ChartConfig = {
  progress: { label: "Avanzamento Lavori (%)", color: "var(--chart-1)" },
  cantiere: { label: "Materiali Impegnati", color: "var(--chart-2)" },
};

export function ComponentsCatalog() {
  const [searchFilter, setSearchFilter] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");

  const matchesSearch = (title: string, category: string) => {
    if (selectedCategory !== "all" && selectedCategory !== category) return false;
    if (!searchFilter.trim()) return true;
    return title.toLowerCase().includes(searchFilter.toLowerCase());
  };

  return (
    <div id="components" className="space-y-10">
      {/* Header & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Catalogo Primitive UI Canonico</h2>
            <p className="text-sm text-muted-foreground">
              Tutte le 37 primitive visuali di <code className="font-mono text-xs">@qoovex/ui</code> verificate e operative.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SearchField
              placeholder="Filtra componente..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all", label: "Tutti (37)" },
            { id: "form", label: "Form & Controlli" },
            { id: "buttons", label: "Pulsanti & Badges" },
            { id: "cards", label: "Card & Struttura" },
            { id: "overlays", label: "Modali & Overlays" },
            { id: "navigation", label: "Navigazione" },
            { id: "data", label: "Dati & Analytics" },
            { id: "feedback", label: "Feedback & Loaders" },
          ].map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="xs"
              onClick={() => setSelectedCategory(cat.id)}
              className="rounded-full"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        {/* CATEGORY 1: FORM CONTROLS & INPUTS */}
        {matchesSearch("Form Controlli Input Select", "form") && (
          <section className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-lg font-bold text-foreground">1. Form & Controlli di Input</h3>
              <p className="text-xs text-muted-foreground">Input, Password, OTP, Textarea, Select, Checkbox, Switch e Field wrapper.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Standard Input & Label */}
              <Card className="border p-4 space-y-4">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">Input & Label</Badge>
                  <CardTitle className="text-sm font-semibold">Input di Testo Standard</CardTitle>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="demo-input">Nome Cantiere</Label>
                  <Input id="demo-input" placeholder="Es. Residenza Parco Nord" />
                </div>
              </Card>

              {/* Password Input */}
              <Card className="border p-4 space-y-4">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">PasswordInput</Badge>
                  <CardTitle className="text-sm font-semibold">Input Password con Toggle</CardTitle>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="demo-pass">Chiave di Accesso</Label>
                  <PasswordInput id="demo-pass" defaultValue="SecretQoovex2026!" />
                </div>
              </Card>

              {/* OTP Input */}
              <Card className="border p-4 space-y-4">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">OtpInput</Badge>
                  <CardTitle className="text-sm font-semibold">Codice di Verifica 2FA OTP</CardTitle>
                </div>
                <div className="space-y-2">
                  <Label>Codice a 6 Cifre</Label>
                  <OtpInput length={6} defaultValue="849201" />
                </div>
              </Card>

              {/* Textarea */}
              <Card className="border p-4 space-y-4">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">Textarea</Badge>
                  <CardTitle className="text-sm font-semibold">Area di Testo Multilinea</CardTitle>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="demo-text">Relazione Tecnica</Label>
                  <Textarea id="demo-text" rows={3} placeholder="Inserisci i dettagli operativi del cantiere..." />
                </div>
              </Card>

              {/* Select */}
              <Card className="border p-4 space-y-4">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">Select</Badge>
                  <CardTitle className="text-sm font-semibold">Menu di Selezione Singola</CardTitle>
                </div>
                <div className="space-y-2">
                  <Label>Stato del Progetto</Label>
                  <Select defaultValue="in-corso">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleziona stato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pianificato">Pianificato</SelectItem>
                      <SelectItem value="in-corso">In Corso</SelectItem>
                      <SelectItem value="completato">Completato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              {/* Checkbox & Switch */}
              <Card className="border p-4 space-y-4">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">Checkbox & Switch</Badge>
                  <CardTitle className="text-sm font-semibold">Toggles & Selezioni Booleane</CardTitle>
                </div>
                <div className="space-y-3 pt-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" defaultChecked />
                    <Label htmlFor="terms" className="text-xs">Accetta direttive di cantiere</Label>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notif-switch" className="text-xs">Notifiche push istantanee</Label>
                    <Switch id="notif-switch" defaultChecked />
                  </div>
                </div>
              </Card>

              {/* Field Wrapper with Error & Helper */}
              <Card className="border p-4 space-y-4 md:col-span-2 lg:col-span-3">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">Field (Wrapper Complesso)</Badge>
                  <CardTitle className="text-sm font-semibold">Field con Validazione & Helper Text</CardTitle>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel>Email Direttore Lavori</FieldLabel>
                    <Input placeholder="direttore@qoovex.it" defaultValue="direttore@qoovex.it" />
                    <FieldDescription>Inserire un indirizzo aziendale verificato.</FieldDescription>
                  </Field>

                  <Field data-invalid="true">
                    <FieldLabel>Budget Assegnato (€)</FieldLabel>
                    <Input placeholder="0.00" defaultValue="-1500" aria-invalid="true" />
                    <FieldError>Il budget non può assumere un valore negativo.</FieldError>
                  </Field>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* CATEGORY 2: BUTTONS, BADGES & AVATARS */}
        {matchesSearch("Pulsanti Buttons Badges Avatar", "buttons") && (
          <section className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-lg font-bold text-foreground">2. Pulsanti, Badges & Avatars</h3>
              <p className="text-xs text-muted-foreground">Varianti di azione, tag semantici, loghi di brand e avatar utente.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Buttons Showcase */}
              <Card className="border p-4 space-y-4">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">Button & Variants</Badge>
                  <CardTitle className="text-sm font-semibold">Varianti di Pulsante</CardTitle>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="link">Link</Button>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                  <Button size="xs">Size XS</Button>
                  <Button size="sm">Size SM</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Size LG</Button>
                  <Button size="icon" variant="outline"><IconPlus className="size-4" /></Button>
                  <Button size="sm" className="gap-1.5"><Spinner className="size-3" /> Caricamento...</Button>
                </div>
              </Card>

              {/* Badges Showcase */}
              <Card className="border p-4 space-y-4">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">Badge (9 Varianti)</Badge>
                  <CardTitle className="text-sm font-semibold">Tag Semantici & Informativi</CardTitle>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="ghost">Ghost</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="link">Link Badge</Badge>
                </div>
              </Card>

              {/* Avatars & BrandMark */}
              <Card className="border p-4 space-y-4 md:col-span-2">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">Avatar & BrandMark</Badge>
                  <CardTitle className="text-sm font-semibold">Identità Utente & Loghi Canonici</CardTitle>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="User" />
                      <AvatarFallback>FS</AvatarFallback>
                    </Avatar>
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-primary text-primary-foreground font-medium">QO</AvatarFallback>
                    </Avatar>
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-info/20 text-info text-xs">DL</AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex items-center gap-6 border-l pl-6">
                    <BrandMark variant="sirio" />
                    <BrandMark variant="marketing" />
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* CATEGORY 3: CARDS & STRUCTURE */}
        {matchesSearch("Card Collapsible Separator Empty", "cards") && (
          <section className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-lg font-bold text-foreground">3. Card & Struttura</h3>
              <p className="text-xs text-muted-foreground">Contenitori strutturali, sezioni espandibili e stati vuoti.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Card Example */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Card di Gestione Cantiere</CardTitle>
                    <Badge variant="success">Attivo</Badge>
                  </div>
                  <CardDescription>Residenza Milano Est - Lotto B</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <p>Avanzamento strutturale completato all'85%. Ispezione tecnica fissata per venerdì.</p>
                  <Separator />
                  <div className="flex justify-between font-mono text-[0.7rem] text-foreground">
                    <span>Responsabile: Ing. Rossi</span>
                    <span>Budget: €450,000</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">Dettagli</Button>
                  <Button size="sm">Aggiorna Stato</Button>
                </CardFooter>
              </Card>

              {/* Collapsible Accordion */}
              <Card className="p-4 space-y-3">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">Collapsible</Badge>
                  <CardTitle className="text-sm font-semibold">Sezione Espandibile Accordion</CardTitle>
                </div>
                <Collapsible className="border rounded-xl p-3 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Specifiche Certificazione ISO 9001</span>
                    <CollapsibleTrigger render={<Button variant="ghost" size="xs" />}>
                      <IconChevronDown className="size-4" />
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="text-xs text-muted-foreground pt-2 border-t space-y-1">
                    <p>Tutti i processi di cantiere sono conformi al sistema di qualità ISO 9001:2026.</p>
                    <p className="font-mono text-[0.7rem]">Ultimo audit: 12 Gennaio 2026</p>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* Empty State */}
              <Card className="md:col-span-2 p-6">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <IconFileText className="size-5 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>Nessuna segnalazione di cantiere</EmptyTitle>
                    <EmptyDescription>Tutti i registri di sicurezza risultano regolari. Non ci sono anomalie da gestire.</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Button size="sm" variant="outline">Importa Registro</Button>
                      <Button size="sm" className="gap-1.5"><IconPlus className="size-3.5" /> Nuova Nota</Button>
                    </div>
                  </EmptyContent>
                </Empty>
              </Card>
            </div>
          </section>
        )}

        {/* CATEGORY 4: OVERLAYS & MODALS */}
        {matchesSearch("Modali Dialog Sheet Tooltip Dropdown", "overlays") && (
          <section className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-lg font-bold text-foreground">4. Modali, Overlays & Dialoghi</h3>
              <p className="text-xs text-muted-foreground">Dialoghi modali Base UI, pannelli laterali (Sheet), Tooltip e Dropdown Menu.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Dialog Modal */}
              <Card className="border p-4 space-y-3">
                <Badge variant="outline" className="font-mono text-[0.7rem]">Dialog</Badge>
                <CardTitle className="text-sm font-semibold">Modale di Conferma</CardTitle>
                <Dialog>
                  <DialogTrigger render={<Button className="w-full" />}>
                    Apri Modale Dialog
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Conferma Chiusura Cantiere</DialogTitle>
                      <DialogDescription>
                        Questa operazione contrassegnerà il cantiere come completato ed emetterà il verbale finale.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2 text-xs">
                      <Label>Note di Chiusura</Label>
                      <Input placeholder="Note opzionali..." />
                    </div>
                    <DialogFooter>
                      <DialogClose render={<Button variant="outline" />}>
                        Annulla
                      </DialogClose>
                      <Button variant="default">Conferma Operazione</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Card>

              {/* Sheet Drawer */}
              <Card className="border p-4 space-y-3">
                <Badge variant="outline" className="font-mono text-[0.7rem]">Sheet</Badge>
                <CardTitle className="text-sm font-semibold">Drawer Laterale (Sheet)</CardTitle>
                <Sheet>
                  <SheetTrigger render={<Button variant="secondary" className="w-full" />}>
                    Apri Pannello Sheet
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filtri Avanzati Cantiere</SheetTitle>
                      <SheetDescription>Configura le preferenze di visualizzazione della vista corrente.</SheetDescription>
                    </SheetHeader>
                    <div className="py-6 space-y-4 text-xs">
                      <div className="space-y-2">
                        <Label>Regione Operativa</Label>
                        <Select defaultValue="lombardia">
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lombardia">Lombardia</SelectItem>
                            <SelectItem value="lazio">Lazio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between border-t pt-3">
                        <span>Solo cantieri critici</span>
                        <Switch />
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </Card>

              {/* Tooltip */}
              <Card className="border p-4 space-y-3">
                <Badge variant="outline" className="font-mono text-[0.7rem]">Tooltip</Badge>
                <CardTitle className="text-sm font-semibold">Hover Informatorio</CardTitle>
                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" className="w-full gap-2" />}>
                    <IconInfoCircle className="size-4 text-info" /> Hover per Tooltip
                  </TooltipTrigger>
                  <TooltipContent>
                    Contratto di garanzia decennale attivo.
                  </TooltipContent>
                </Tooltip>
              </Card>

              {/* Dropdown Menu */}
              <Card className="border p-4 space-y-3">
                <Badge variant="outline" className="font-mono text-[0.7rem]">DropdownMenu</Badge>
                <CardTitle className="text-sm font-semibold">Menu Contestuale Action</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="outline" className="w-full justify-between" />}>
                    Azioni Rapide <IconChevronDown className="size-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuItem className="gap-2">
                      <IconFileText className="size-3.5" /> Genera PDF
                      <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <IconShare className="size-3.5" /> Condividi
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 text-destructive">
                      <IconTrash className="size-3.5" /> Elimina
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Card>
            </div>
          </section>
        )}

        {/* CATEGORY 5: NAVIGATION & APP BAR */}
        {matchesSearch("Navigazione Breadcrumb Tabs FloatingNavigation", "navigation") && (
          <section className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-lg font-bold text-foreground">5. Navigazione & App Layout</h3>
              <p className="text-xs text-muted-foreground">Breadcrumbs, schede (Tabs) e percorsi d'interfaccia.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Breadcrumbs */}
              <Card className="border p-4 space-y-4">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">Breadcrumb</Badge>
                  <CardTitle className="text-sm font-semibold">Percorso di Navigazione (Breadcrumbs)</CardTitle>
                </div>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/">Qoovex</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/dashboard">Cantieri</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Residenza Milano Est</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </Card>

              {/* Tabs Switcher */}
              <Card className="border p-4 space-y-4">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">Tabs</Badge>
                  <CardTitle className="text-sm font-semibold">Pannelli a Schede (Tabs)</CardTitle>
                </div>
                <Tabs defaultValue="panoramica" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="panoramica">Panoramica</TabsTrigger>
                    <TabsTrigger value="documenti">Documenti</TabsTrigger>
                  </TabsList>
                  <TabsContent value="panoramica" className="p-3 text-xs text-muted-foreground">
                    Panoramica sintetica degli avanzamenti di cantiere.
                  </TabsContent>
                  <TabsContent value="documenti" className="p-3 text-xs text-muted-foreground">
                    3 documenti e relazioni allegate.
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </section>
        )}

        {/* CATEGORY 6: DATA & VISUALIZATIONS */}
        {matchesSearch("Dati Tabelle Grafici Timeline WorkQueue", "data") && (
          <section className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-lg font-bold text-foreground">6. Dati, Tabelle & Recharts Analytics</h3>
              <p className="text-xs text-muted-foreground">Data Grid responsive, grafici OKLCH Recharts, cronologia (Timeline) e code di lavoro.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Interactive Table */}
              <Card className="p-4 space-y-3">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">Table</Badge>
                  <CardTitle className="text-sm font-semibold">Griglia Dati (Table Component)</CardTitle>
                </div>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Codice</TableHead>
                        <TableHead>Cantiere</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead className="text-right">Importo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-xs">CNT-0192</TableCell>
                        <TableCell className="font-medium text-xs">Torre San Siro</TableCell>
                        <TableCell><Badge variant="success">Attivo</Badge></TableCell>
                        <TableCell className="text-right font-mono text-xs">€1,240,000</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">CNT-0193</TableCell>
                        <TableCell className="font-medium text-xs">Polo Logistico Sud</TableCell>
                        <TableCell><Badge variant="warning">In Revisione</Badge></TableCell>
                        <TableCell className="text-right font-mono text-xs">€890,000</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">CNT-0194</TableCell>
                        <TableCell className="font-medium text-xs">Campus Innovazione</TableCell>
                        <TableCell><Badge variant="info">Pianificato</Badge></TableCell>
                        <TableCell className="text-right font-mono text-xs">€2,100,000</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* Chart Showcase */}
              <Card className="p-4 space-y-3">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">Chart (Recharts + OKLCH)</Badge>
                  <CardTitle className="text-sm font-semibold">Grafico di Avanzamento e Metric</CardTitle>
                </div>
                <ChartContainer config={chartConfig} className="h-48 w-full">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="progress" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} />
                  </AreaChart>
                </ChartContainer>
              </Card>

              {/* Timeline */}
              <Card className="p-4 space-y-3">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">Timeline</Badge>
                  <CardTitle className="text-sm font-semibold">Cronologia Eventi & Audit Log</CardTitle>
                </div>
                <Timeline>
                  <TimelineDateSeparator>Oggi — 4 Agosto 2026</TimelineDateSeparator>
                  <TimelineEntry>
                    <TimelineMarker className="bg-success text-success-foreground">✓</TimelineMarker>
                    <TimelineContent>
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span>Approvazione Collaudo Strutturale</span>
                        <TimelineActor>Ing. Bianchi</TimelineActor>
                      </div>
                      <p className="text-[0.75rem] text-muted-foreground mt-1">Superata verifica sismica di livello 4.</p>
                      <TimelineTransition from="In Verifiche" to="Approvato" />
                    </TimelineContent>
                  </TimelineEntry>
                </Timeline>
              </Card>

              {/* WorkQueueItem */}
              <Card className="p-4 space-y-3">
                <div className="space-y-1">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">WorkQueueItem</Badge>
                  <CardTitle className="text-sm font-semibold">Elemento Coda di Lavoro (Priorità)</CardTitle>
                </div>
                <div className="space-y-2">
                  <WorkQueueItem priority="blocking">
                    <WorkQueueItemContent>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">Bloccante</Badge>
                        <span className="text-xs font-semibold">Permesso di Costruire Scaduto</span>
                      </div>
                      <p className="text-[0.75rem] text-muted-foreground">Richiesta estensione immediata allo Sportello Unico.</p>
                    </WorkQueueItemContent>
                    <WorkQueueItemActions>
                      <Button size="xs" variant="destructive">Rinnova Ora</Button>
                    </WorkQueueItemActions>
                  </WorkQueueItem>

                  <WorkQueueItem priority="attention">
                    <WorkQueueItemContent>
                      <div className="flex items-center gap-2">
                        <Badge variant="warning">Attenzione</Badge>
                        <span className="text-xs font-semibold">Fornitura Calcestruzzo in Ritardo</span>
                      </div>
                    </WorkQueueItemContent>
                    <WorkQueueItemActions>
                      <Button size="xs" variant="outline">Sollecita</Button>
                    </WorkQueueItemActions>
                  </WorkQueueItem>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* CATEGORY 7: FEEDBACK & LOADERS */}
        {matchesSearch("Alert Spinner Skeleton Feedback", "feedback") && (
          <section className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-lg font-bold text-foreground">7. Feedback, Avvisi & Loaders</h3>
              <p className="text-xs text-muted-foreground">Alert semantici (5 varianti), Spinner di caricamento e Skeleton placeholders.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Alerts */}
              <div className="space-y-3">
                <Alert variant="default">
                  <IconInfoCircle className="size-4" />
                  <AlertTitle>Aggiornamento di Sistema</AlertTitle>
                  <AlertDescription>Nuova versione della piattaforma v2.0 rilasciata.</AlertDescription>
                </Alert>

                <Alert variant="info">
                  <IconInfoCircle className="size-4" />
                  <AlertTitle>Informazione Cantiere</AlertTitle>
                  <AlertDescription>Ispezione programmata per lunedì ore 09:00.</AlertDescription>
                </Alert>

                <Alert variant="success">
                  <IconCheck className="size-4" />
                  <AlertTitle>Operazione Completata</AlertTitle>
                  <AlertDescription>Verbale inviato correttamente ai tecnici.</AlertDescription>
                </Alert>

                <Alert variant="warning">
                  <IconAlertTriangle className="size-4" />
                  <AlertTitle>Attenzione Condizioni Meteo</AlertTitle>
                  <AlertDescription>Preiste forti piogge nella zona di cantiere.</AlertDescription>
                </Alert>

                <Alert variant="destructive">
                  <IconAlertTriangle className="size-4" />
                  <AlertTitle>Errore Imprevisto</AlertTitle>
                  <AlertDescription>Impossibile sincronizzare la scheda con il server.</AlertDescription>
                </Alert>
              </div>

              {/* Loaders & Skeletons */}
              <Card className="p-4 space-y-6">
                <div className="space-y-2">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">Spinner Loaders</Badge>
                  <CardTitle className="text-sm font-semibold">Indicatori di Caricamento</CardTitle>
                  <div className="flex items-center gap-4 pt-2">
                    <Spinner className="size-3" />
                    <Spinner className="size-4" />
                    <Spinner className="size-6" />
                    <Spinner className="size-8" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Badge variant="outline" className="font-mono text-[0.7rem]">Skeleton Placeholders</Badge>
                  <CardTitle className="text-sm font-semibold">Stati di Caricamento Scheda</CardTitle>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
