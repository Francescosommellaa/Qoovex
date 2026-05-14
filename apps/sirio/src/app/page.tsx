"use client";

import * as React from "react";
import Image from "next/image";
import {
  Avatar,
  BackToTop,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  CtaBand,
  Divider,
  EmptyState,
  FeatureShowcase,
  Form,
  FormActions,
  FormContent,
  FormControl,
  FormDescription,
  FormField,
  FormHeader,
  FormTitle,
  HeroSection,
  Icon,
  Input,
  LoadingState,
  Modal,
  ModalBody,
  ModalFooter,
  OtpInput,
  PhoneNumberField,
  ProductPreviewFrame,
  Radio,
  SearchBar,
  Select,
  Skeleton,
  SmartSearchBar,
  Stack,
  Text,
  Textarea,
  ThemeToggle,
  Toast,
  Toggle,
} from "@qoovex/ui";
import {
  ArrowRight,
  BookOpen,
  BracketsCurly,
  CheckCircle,
  CursorClick,
  Database,
  Palette,
  Selection,
  SquaresFour,
  TextT,
  WarningCircle,
} from "@phosphor-icons/react";

const tokenGroups = [
  {
    id: "tokens-colors",
    name: "Colori",
    value: "--color-*",
    body: "Palette semantica per dark e white theme, surface, text, border e stati.",
  },
  {
    id: "tokens-spacing",
    name: "Spacing",
    value: "--spacing-*",
    body: "Scala modulare ufficiale per padding, margin, gap e ritmo verticale.",
  },
  {
    id: "tokens-type",
    name: "Tipografia",
    value: "--text-*",
    body: "Satoshi per UI, Cabinet Grotesk per display e pesi coerenti con il prodotto.",
  },
  {
    id: "tokens-radius",
    name: "Radius",
    value: "--radius-*",
    body: "Da sm a full. Nessun raggio libero nelle app o nei pattern.",
  },
  {
    id: "tokens-motion",
    name: "Motion",
    value: "--duration-*",
    body: "Durate ed easing ufficiali per microinterazioni e transizioni.",
  },
  {
    id: "tokens-effects",
    name: "Effects",
    value: "--shadow-*",
    body: "Ombre, blur, overlay e focus ring calibrati sui temi.",
  },
];

const navGroups = [
  {
    title: "Fondamenta",
    items: [
      { id: "overview", label: "Overview" },
      { id: "tokens", label: "Tokens" },
      { id: "primitives", label: "Primitives" },
    ],
  },
  {
    title: "Componenti",
    items: [
      { id: "button", label: "Button" },
      { id: "input", label: "Input" },
      { id: "textarea", label: "Textarea" },
      { id: "select", label: "Select" },
      { id: "search", label: "Search" },
      { id: "badge", label: "Badge" },
      { id: "card", label: "Card" },
      { id: "avatar", label: "Avatar" },
      { id: "choice", label: "Choice controls" },
      { id: "form", label: "Form" },
      { id: "modal", label: "Modal" },
      { id: "otp-phone", label: "Otp e Phone" },
      { id: "skeleton-toast", label: "Skeleton e Toast" },
    ],
  },
  {
    title: "Pattern",
    items: [
      { id: "patterns", label: "Pattern index" },
      { id: "hero-pattern", label: "HeroSection" },
      { id: "feature-pattern", label: "FeatureShowcase" },
      { id: "state-patterns", label: "Empty e Loading" },
      { id: "cta-pattern", label: "CtaBand" },
    ],
  },
];

const primitiveItems = [
  {
    title: "Box",
    body: "Contenitore token-safe per surface, border, radius, padding e shadow.",
    icon: SquaresFour,
  },
  {
    title: "Stack",
    body: "Flow verticale o orizzontale con gap vincolato alla scala spacing.",
    icon: Selection,
  },
  {
    title: "Text",
    body: "Unico ingresso per heading, body copy, label e microcopy.",
    icon: TextT,
  },
  {
    title: "Icon",
    body: "Wrapper Phosphor con size, tone e peso coerenti con il DS.",
    icon: Palette,
  },
];

const selectOptions = [
  { value: "recipes", label: "Ricette" },
  { value: "menus", label: "Menu" },
  { value: "orders", label: "Ordini" },
  { value: "team", label: "Team" },
];

const extendedSelectOptions = [
  ...selectOptions,
  { value: "suppliers", label: "Fornitori" },
  { value: "analytics", label: "Analisi" },
];

const smartSearchResults = [
  {
    id: "recent-recipes",
    category: "recent" as const,
    label: "Ricette recenti",
    description: "Ultima area aperta",
    badge: "Recenti",
  },
  {
    id: "recipe-risotto",
    category: "recipe" as const,
    label: "Risotto al limone",
    description: "Scheda ricetta completa",
    badge: "Ricetta",
  },
  {
    id: "menu-spring",
    category: "menu" as const,
    label: "Menu primavera",
    description: "Menu in preparazione",
    badge: "Menu",
  },
  {
    id: "action-create",
    category: "action" as const,
    label: "Crea nuova ricetta",
    description: "Azione rapida",
    badge: "Azione",
  },
];

const featurePatternItems = [
  {
    label: "PageSection",
    tone: "primary" as const,
    title: "Ritmo di pagina",
    body: "Header, copy, larghezza e spacing verticale sono gia definiti.",
    icon: <Icon icon={SquaresFour} size="sm" weight="bold" />,
  },
  {
    label: "HeroSection",
    tone: "success" as const,
    title: "Primo viewport",
    body: "Titolo, testo, CTA e visuale usano primitives e Button.",
    icon: <Icon icon={Palette} size="sm" weight="bold" />,
  },
  {
    label: "ProductPreviewFrame",
    tone: "warning" as const,
    title: "Preview prodotto",
    body: "Mockup condiviso tra sito, docs e pagine pubbliche.",
    icon: <Icon icon={BookOpen} size="sm" weight="bold" />,
  },
  {
    label: "AuthShell",
    tone: "neutral" as const,
    title: "Flussi auth",
    body: "Shell coerente per login, registrazione e recovery.",
    icon: <Icon icon={BracketsCurly} size="sm" weight="bold" />,
  },
];

function anchor(id: string) {
  return `#${id}`;
}

function CodePill({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="outline" tone="neutral" size="sm">
      {children}
    </Badge>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="soft" tone="primary" size="sm">
      {children}
    </Badge>
  );
}

function DocsSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Stack
      as="section"
      id={id}
      gap="6"
      className="sirio-doc-anchor"
    >
      <Stack gap="3" className="max-w-(--measure-copy)">
        <Text as="h2" family="display" size="xl" weight="semibold" leading="tight">
          {title}
        </Text>
        <Text size="base" tone="muted" leading="relaxed">
          {description}
        </Text>
      </Stack>
      {children}
    </Stack>
  );
}

function ComponentDoc({
  id,
  title,
  description,
  api,
  tokens,
  previewReserve = "none",
  children,
}: {
  id: string;
  title: string;
  description: string;
  api: string[];
  tokens: string[];
  previewReserve?: "none" | "dropdown";
  children: React.ReactNode;
}) {
  const previewReserveClass =
    previewReserve === "dropdown"
      ? "sirio-preview-reserve-dropdown"
      : undefined;

  return (
    <Stack as="section" id={id} gap="5" className="sirio-doc-anchor">
      <Card
        variant="panel"
        tone="neutral"
        padding="lg"
        overflow="visible"
      >
        <CardHeader>
          <Stack gap="3">
            <Stack direction="row" align="center" justify="between" gap="3" wrap>
              <Stack direction="row" align="center" gap="3" wrap>
                <SectionEyebrow>Component</SectionEyebrow>
                <Text as="h2" family="display" size="xl" weight="semibold">
                  {title}
                </Text>
              </Stack>
              <CodePill>@qoovex/ui</CodePill>
            </Stack>
            <Text size="sm" tone="muted" leading="relaxed">
              {description}
            </Text>
          </Stack>
        </CardHeader>
        <CardBody>
          <Stack gap="5">
            <Card variant="surface" tone="neutral" padding="lg" overflow="visible">
              <CardBody className={previewReserveClass}>{children}</CardBody>
            </Card>
            <Box className="grid grid-cols-1 gap-(--spacing-4) lg:grid-cols-2">
              <Stack gap="3">
                <Text as="h3" family="display" size="base" weight="semibold">
                  Props principali
                </Text>
                <Stack direction="row" gap="2" wrap>
                  {api.map((item) => (
                    <CodePill key={item}>{item}</CodePill>
                  ))}
                </Stack>
              </Stack>
              <Stack gap="3">
                <Text as="h3" family="display" size="base" weight="semibold">
                  Token usati
                </Text>
                <Stack direction="row" gap="2" wrap>
                  {tokens.map((item) => (
                    <CodePill key={item}>{item}</CodePill>
                  ))}
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}

function Sidebar() {
  return (
    <Box as="aside" className="lg:sticky lg:top-(--sirio-sidebar-top) lg:self-start">
      <Card
        variant="panel"
        tone="neutral"
        padding="md"
        className="lg:max-h-(--sirio-sidebar-max-height)"
      >
        <CardHeader>
          <Stack gap="2">
            <Text as="h2" family="display" size="base" weight="semibold">
              Index
            </Text>
            <Text size="xs" tone="muted">
              Navigazione pubblica del design system.
            </Text>
          </Stack>
        </CardHeader>
        <CardBody className="min-h-0 overflow-y-auto">
          <Stack gap="5">
            {navGroups.map((group) => (
              <Stack key={group.title} gap="2">
                <Text size="xs" tone="faint" weight="semibold" className="uppercase">
                  {group.title}
                </Text>
                <Stack gap="1">
                  {group.items.map((item) => (
                    <Button
                      key={item.id}
                      as="a"
                      href={anchor(item.id)}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      {item.label}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Box>
  );
}

function Header() {
  return (
    <Box
      as="header"
      surface="bg"
      className="sticky top-0 z-(--z-sticky) border-b border-(--color-border) backdrop-blur-md"
    >
      <Stack
        direction="row"
        align="center"
        justify="between"
        gap="4"
        wrap
        className="mx-auto max-w-(--container-wide) px-(--spacing-4) py-(--spacing-3) md:px-(--spacing-6)"
      >
        <a
          href={anchor("overview")}
          className="sirio-brand-link inline-flex items-center gap-(--spacing-3) rounded-(--radius-full) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring)"
          aria-label="Torna all'inizio di Sirio"
        >
          <Image
            src="/logo-icon/sirio-icon.svg"
            alt=""
            width={360}
            height={334}
            className="sirio-brand-icon"
            aria-hidden="true"
          />
          <Text as="span" family="display" size="lg" weight="semibold">
            Sirio
          </Text>
          <Badge variant="soft" tone="neutral" size="sm">
            Qoovex DS
          </Badge>
        </a>
        <Stack direction="row" align="center" gap="2" wrap>
          <ThemeToggle label="Tema" />
          <Button
            as="a"
            href={anchor("components")}
            variant="secondary"
            size="sm"
            iconRight={<Icon icon={ArrowRight} size="xs" />}
          >
            Componenti
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function ComponentCatalog() {
  const [otpValue, setOtpValue] = React.useState("129");
  const [regionCode, setRegionCode] = React.useState("+39");
  const [phoneNumber, setPhoneNumber] = React.useState("3331234567");
  const [smartQuery, setSmartQuery] = React.useState("ri");
  const [buttonSwapActive, setButtonSwapActive] = React.useState(false);

  React.useEffect(() => {
    if (!buttonSwapActive) return;

    const timeout = window.setTimeout(() => {
      setButtonSwapActive(false);
    }, 1600);

    return () => window.clearTimeout(timeout);
  }, [buttonSwapActive]);

  return (
    <Stack id="components" gap="8" className="sirio-doc-anchor">
      <Stack gap="3" align="start">
        <SectionEyebrow>Catalogo componenti</SectionEyebrow>
        <Text as="h2" family="display" size="2xl" weight="semibold">
          Componenti uno per uno
        </Text>
        <Text size="sm" tone="muted" leading="relaxed">
          Ogni blocco mostra varianti, API principali e token coinvolti. Le preview sono costruite solo con primitives e components del package UI.
        </Text>
      </Stack>

      <ComponentDoc
        id="button"
        title="Button"
        description="Azione primaria, secondaria, ghost o destructive. Supporta button nativo e link senza duplicare stili."
        api={["variant", "size", "loading", "iconLeft", "iconRight", "iconSwap", "swapLabel", "as"]}
        tokens={["--button-*", "--shadow-btn-*", "--duration-*", "--text-*"]}
      >
        <Stack gap="4">
          <Stack direction="row" gap="3" wrap>
            <Button variant="primary" iconRight={<Icon icon={ArrowRight} size="xs" weight="bold" />}>
              Primary
            </Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </Stack>
          <Stack direction="row" gap="3" wrap>
            <Button size="xs">Extra small</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button loading loadingLabel="Caricamento">
              Loading
            </Button>
          </Stack>
          <Stack direction="row" gap="3" wrap>
            <Button
              variant="primary"
              iconSwap={{
                from: <Icon icon={CursorClick} size="xs" weight="bold" />,
                to: <Icon icon={ArrowRight} size="xs" weight="bold" />,
              }}
            >
              Icon swap
            </Button>
            <Button
              variant="secondary"
              onClick={() => setButtonSwapActive(true)}
              swapActive={buttonSwapActive}
              swapLabel={{ idle: "Salva", active: "Salvato" }}
              iconRight={<Icon icon={CheckCircle} size="xs" weight="bold" />}
            />
          </Stack>
        </Stack>
      </ComponentDoc>

      <ComponentDoc
        id="input"
        title="Input"
        description="Campo testo con label, helper text, status semantico e affordance coerenti."
        api={["label", "helperText", "status", "size", "type", "placeholder"]}
        tokens={["--input-*", "--color-input-*", "--radius-*", "--text-*"]}
      >
        <Box className="grid grid-cols-1 gap-(--spacing-4) md:grid-cols-3">
          <Input label="Default" placeholder="Nome ricetta" />
          <Input label="Success" status="success" helperText="Valore valido" placeholder="Menu sera" />
          <Input label="Error" status="error" helperText="Campo richiesto" placeholder="Inserisci un valore" />
        </Box>
      </ComponentDoc>

      <ComponentDoc
        id="textarea"
        title="Textarea"
        description="Campo multilinea per descrizioni, note operative e contenuti lunghi."
        api={["label", "helperText", "status", "resize", "placeholder"]}
        tokens={["--input-*", "--color-input-*", "--radius-*", "--spacing-*"]}
      >
        <Textarea
          label="Note"
          helperText="Usa questo componente per testi lunghi, non un textarea locale."
          placeholder="Preparazione, allergeni o note interne"
        />
      </ComponentDoc>

      <ComponentDoc
        id="select"
        title="Select"
        description="Selezione singola o multipla con dropdown tokenizzato e chip responsive."
        api={["options", "multiple", "defaultValue", "size", "status", "maxSelected", "showSelectedCount"]}
        tokens={["--select-*", "--input-*", "--color-select-*", "--spacing-*"]}
        previewReserve="dropdown"
      >
        <Box className="grid grid-cols-1 gap-(--spacing-4) lg:grid-cols-3">
          <Select label="Area" options={selectOptions} defaultValue="recipes" />
          <Select
            multiple
            label="Viste limitate"
            options={selectOptions}
            defaultValue={["recipes", "menus"]}
            maxSelected={3}
          />
          <Select
            multiple
            label="Viste senza limite"
            options={extendedSelectOptions}
            defaultValue={["recipes", "menus", "orders", "team"]}
            showSelectedCount={false}
          />
        </Box>
      </ComponentDoc>

      <ComponentDoc
        id="search"
        title="SearchBar e SmartSearchBar"
        description="Ricerca semplice e ricerca composita con risultati raggruppati, hotkey e stati mobile-first."
        api={["defaultValue", "results", "forceOpen", "onSearch", "onValueChange"]}
        tokens={["--search-*", "--color-surface-*", "--radius-*", "--shadow-*"]}
      >
        <Stack gap="4">
          <SearchBar defaultValue="ricette" placeholder="Cerca nel catalogo" />
          <SmartSearchBar
            value={smartQuery}
            onValueChange={setSmartQuery}
            results={smartSearchResults}
            disableFullscreen
            showHotkey={false}
            placeholder="Cerca ricette, menu e azioni"
          />
        </Stack>
      </ComponentDoc>

      <ComponentDoc
        id="badge"
        title="Badge"
        description="Etichetta semantica per stati, categorie e metadati brevi."
        api={["variant", "tone", "size"]}
        tokens={["--tone-*", "--color-badge-*", "--radius-full", "--text-*"]}
      >
        <Stack direction="row" gap="2" wrap>
          <Badge variant="soft" tone="primary">Primary</Badge>
          <Badge variant="soft" tone="success">Success</Badge>
          <Badge variant="soft" tone="warning">Warning</Badge>
          <Badge variant="soft" tone="error">Error</Badge>
          <Badge variant="outline" tone="neutral">Outline</Badge>
          <Badge variant="filled" tone="primary">Filled</Badge>
        </Stack>
      </ComponentDoc>

      <ComponentDoc
        id="card"
        title="Card"
        description="Surface riutilizzabile per panel, bento, preview e contenuti raggruppati."
        api={["variant", "tone", "padding", "interactive"]}
        tokens={["--color-surface-*", "--radius-*", "--shadow-*", "--spacing-*"]}
      >
        <Box className="grid grid-cols-1 gap-(--spacing-4) md:grid-cols-3">
          <Card variant="surface" padding="md">
            <CardBody>
              <Stack gap="2">
                <Text weight="semibold">Surface</Text>
                <Text size="sm" tone="muted">Card base per contenuti compatti.</Text>
              </Stack>
            </CardBody>
          </Card>
          <Card variant="panel" tone="primary" padding="md">
            <CardBody>
              <Stack gap="2">
                <Text weight="semibold">Panel</Text>
                <Text size="sm" tone="muted">Contenuto evidenziato con tono.</Text>
              </Stack>
            </CardBody>
          </Card>
          <Card variant="bento" tone="success" padding="md">
            <CardBody>
              <Stack gap="2">
                <Text weight="semibold">Bento</Text>
                <Text size="sm" tone="muted">Tile per dashboard e overview.</Text>
              </Stack>
            </CardBody>
            <CardFooter>
              <Badge variant="soft" tone="success" size="sm">Live</Badge>
            </CardFooter>
          </Card>
        </Box>
      </ComponentDoc>

      <ComponentDoc
        id="avatar"
        title="Avatar"
        description="Identita visiva di persone, team e fallback testuali con status."
        api={["src", "name", "initials", "size", "tone", "status"]}
        tokens={["--avatar-*", "--tone-*", "--radius-full", "--color-*"]}
      >
        <Stack direction="row" gap="4" align="center" wrap>
          <Avatar name="Qoovex Design" initials="QD" size="sm" tone="primary" status="online" />
          <Avatar name="Team Kitchen" initials="TK" size="md" tone="success" status="away" />
          <Avatar name="Ops" initials="OP" size="lg" tone="warning" status="busy" />
          <Avatar name="Guest" initials="GU" size="xl" tone="neutral" status="offline" />
        </Stack>
      </ComponentDoc>

      <ComponentDoc
        id="choice"
        title="Checkbox, Radio e Toggle"
        description="Controlli binari o esclusivi per impostazioni, filtri e preferenze."
        api={["checked", "defaultChecked", "disabled", "label", "helperText"]}
        tokens={["--control-*", "--color-primary-*", "--spacing-*", "--text-*"]}
      >
        <Box className="grid grid-cols-1 gap-(--spacing-4) md:grid-cols-3">
          <Stack gap="3">
            <Checkbox label="Confermato" defaultChecked />
            <Checkbox label="Disabilitato" disabled />
          </Stack>
          <Stack gap="3">
            <Radio name="density" label="Compatto" defaultChecked />
            <Radio name="density" label="Confortevole" />
          </Stack>
          <Stack gap="3">
            <Toggle label="Tema sincronizzato" defaultChecked />
            <Divider />
            <Text size="xs" tone="faint">Separatore</Text>
          </Stack>
        </Box>
      </ComponentDoc>

      <ComponentDoc
        id="form"
        title="Form"
        description="Composizione ufficiale per header, content, field, control e actions."
        api={["variant", "layout", "density", "tone", "FormField", "FormActions"]}
        tokens={["--form-*", "--input-*", "--spacing-*", "--radius-*"]}
      >
        <Form variant="panel" density="comfortable" onSubmit={(event) => event.preventDefault()}>
          <FormHeader>
            <FormTitle>Nuova ricetta</FormTitle>
            <FormDescription>Struttura form con campi e azioni del DS.</FormDescription>
          </FormHeader>
          <FormContent>
            <FormField label="Titolo" helperText="Il campo usa FormControl per collegare label e input.">
              <FormControl>
                <Input placeholder="Risotto al limone" />
              </FormControl>
            </FormField>
            <FormField label="Stato" successText="Disponibile per la pubblicazione.">
              <FormControl>
                <Select options={selectOptions} defaultValue="recipes" />
              </FormControl>
            </FormField>
          </FormContent>
          <FormActions align="end">
            <Button variant="ghost" type="button">Annulla</Button>
            <Button type="submit">Salva</Button>
          </FormActions>
        </Form>
      </ComponentDoc>

      <ComponentDoc
        id="modal"
        title="Modal"
        description="Dialog e sheet responsive con trigger, overlay, header, body e footer gestiti dal DS."
        api={["trigger", "title", "description", "placement", "size", "tone"]}
        tokens={["--modal-*", "--z-modal", "--duration-*", "--shadow-*"]}
      >
        <Stack direction="row" gap="3" wrap>
          <Modal
            title="Dettaglio componente"
            description="Modal responsive con trigger Button del design system."
            trigger={<Button iconLeft={<Icon icon={CursorClick} size="xs" />}>Apri modal</Button>}
            footer={
              <ModalFooter>
                <Button variant="secondary">Chiudi</Button>
                <Button>Conferma</Button>
              </ModalFooter>
            }
          >
            <ModalBody>
              <Text size="sm" tone="muted" leading="relaxed">
                Il contenuto resta dentro gli slot ufficiali. Nessun markup visuale locale e nessun valore arbitrario.
              </Text>
            </ModalBody>
          </Modal>
        </Stack>
      </ComponentDoc>

      <ComponentDoc
        id="otp-phone"
        title="OtpInput e PhoneNumberField"
        description="Campi specializzati per verifica e numeri telefono con comportamento accessibile."
        api={["value", "onChange", "length", "regionCode", "nationalNumber"]}
        tokens={["--otp-*", "--phone-*", "--input-*", "--spacing-*"]}
      >
        <Box className="grid grid-cols-1 gap-(--spacing-5) lg:grid-cols-2">
          <Stack gap="3">
            <Text weight="semibold">OtpInput</Text>
            <OtpInput value={otpValue} onChange={setOtpValue} length={6} />
          </Stack>
          <PhoneNumberField
            label="Telefono"
            helperText="Composizione di Select, Input e FormField."
            regionCode={regionCode}
            onRegionCodeChange={setRegionCode}
            nationalNumber={phoneNumber}
            onNationalNumberChange={setPhoneNumber}
          />
        </Box>
      </ComponentDoc>

      <ComponentDoc
        id="skeleton-toast"
        title="Skeleton e Toast"
        description="Stati di caricamento e feedback non intrusivi, con varianti semantiche."
        api={["variant", "size", "tone", "lines", "title", "description"]}
        tokens={["--skeleton-*", "--toast-*", "--duration-*", "--tone-*"]}
      >
        <Box className="grid grid-cols-1 gap-(--spacing-5) lg:grid-cols-2">
          <Stack gap="3">
            <Skeleton variant="title" lines={2} />
            <Skeleton variant="text" lines={3} />
            <Stack direction="row" gap="3">
              <Skeleton variant="avatar" size="lg" />
              <Skeleton variant="block" />
            </Stack>
          </Stack>
          <Stack gap="3">
            <Toast
              title="Salvato"
              description="Toast success renderizzato come componente DS."
              variant="success"
            />
            <Toast
              title="Attenzione"
              description="Usa varianti semantiche, non colori locali."
              variant="warning"
            />
          </Stack>
        </Box>
      </ComponentDoc>
    </Stack>
  );
}

function PatternCatalog() {
  return (
    <Stack id="patterns" gap="8" className="sirio-doc-anchor">
      <Stack gap="3" align="start">
        <SectionEyebrow>Pattern</SectionEyebrow>
        <Text as="h2" family="display" size="2xl" weight="semibold">
          Composizioni ufficiali
        </Text>
        <Text size="sm" tone="muted" leading="relaxed">
          I pattern combinano primitives e components. Le app devono scegliere il pattern piu vicino prima di comporre manualmente una sezione.
        </Text>
      </Stack>

      <ComponentDoc
        id="hero-pattern"
        title="HeroSection"
        description="Hero pubblica con copy, prova sociale, CTA e visuale. Le azioni sono renderizzate con Button del DS."
        api={["eyebrow", "title", "description", "actions", "visual", "proof"]}
        tokens={["--container-*", "--spacing-*", "--text-*", "--color-*"]}
      >
        <HeroSection
          eyebrow="HeroSection"
          title="Esperienza pubblica coerente"
          description="Questo esempio usa il pattern ufficiale e una preview prodotto condivisa."
          actions={[
            { label: "Azione primaria", href: anchor("button") },
            { label: "Azione secondaria", href: anchor("patterns"), variant: "secondary" },
          ]}
          proof={[
            { value: "DS", label: "source of truth" },
            { value: "Mobile", label: "first" },
          ]}
          visual={<ProductPreviewFrame activeScreen="workplan" />}
        />
      </ComponentDoc>

      <ComponentDoc
        id="feature-pattern"
        title="FeatureShowcase"
        description="Griglia di capability con tono, icona, titolo e descrizione controllati."
        api={["items", "tone", "icon", "title", "body"]}
        tokens={["--tone-*", "--card-*", "--spacing-*", "--text-*"]}
      >
        <FeatureShowcase items={featurePatternItems} />
      </ComponentDoc>

      <ComponentDoc
        id="state-patterns"
        title="EmptyState e LoadingState"
        description="Stati standard per viste senza contenuto o in caricamento."
        api={["title", "description", "action", "tone"]}
        tokens={["--state-*", "--spacing-*", "--color-*", "--text-*"]}
      >
        <Box className="grid grid-cols-1 gap-(--spacing-4) lg:grid-cols-2">
          <EmptyState
            icon={<Icon icon={Database} size="lg" tone="primary" />}
            title="Nessun contenuto"
            description="Usa EmptyState quando una vista non ha ancora dati."
            action={<Button variant="secondary">Crea contenuto</Button>}
          />
          <LoadingState
            title="Caricamento"
            description="Usa LoadingState per attese di pagina o pannello."
          />
        </Box>
      </ComponentDoc>

      <ComponentDoc
        id="cta-pattern"
        title="CtaBand"
        description="Banda finale per azione primaria e secondaria. Anche qui le CTA sono Button link."
        api={["title", "description", "actions", "tone"]}
        tokens={["--cta-*", "--button-*", "--spacing-*", "--radius-*"]}
      >
        <CtaBand
          title="Assembla, non disegnare"
          description="Se un blocco manca, entra nel package UI prima di arrivare nelle app."
          actions={[
            { label: "Vai ai componenti", href: anchor("components") },
            { label: "Torna ai token", href: anchor("tokens"), variant: "secondary" },
          ]}
        />
      </ComponentDoc>
    </Stack>
  );
}

export default function SirioPage() {
  return (
    <Box className="min-h-dvh bg-(--color-bg) text-(--color-text)">
      <Header />

      <main>
        <HeroSection
          id="overview"
          eyebrow="Sirio Design System"
          title="La fonte unica della UI Qoovex"
          description="Token, primitives, components e patterns per costruire interfacce mobile-first senza valori visuali arbitrari."
          actions={[
            { label: "Esplora componenti", href: anchor("components") },
            { label: "Vedi i token", href: anchor("tokens"), variant: "secondary" },
          ]}
          proof={[
            { value: "Tokens", label: "come contratto visuale" },
            { value: "Components", label: "come blocchi pubblici" },
            { value: "Patterns", label: "come sezioni pronte" },
          ]}
          visual={<ProductPreviewFrame activeScreen="recipes" />}
        />

        <Box className="mx-auto grid max-w-(--container-wide) grid-cols-1 gap-(--spacing-10) px-(--spacing-4) pb-(--spacing-16) md:px-(--spacing-6) lg:grid-cols-4">
          <Sidebar />

          <Stack className="lg:col-span-3" gap="16">
            <DocsSection
              id="tokens"
              title="Tokens"
              description="La scala visuale ufficiale. Ogni valore usato dalle app deve arrivare da styles/tokens e dalle CSS variables mirrorate."
            >
              <Box className="grid grid-cols-1 gap-(--spacing-4) md:grid-cols-2 xl:grid-cols-3">
                {tokenGroups.map((group) => (
                  <Card key={group.id} variant="panel" tone="neutral" padding="lg">
                    <CardBody>
                      <Stack gap="3">
                        <Stack direction="row" align="center" justify="between" gap="3">
                          <Text as="h3" family="display" size="lg" weight="semibold">
                            {group.name}
                          </Text>
                          <Badge variant="soft" tone="primary" size="sm">
                            {group.value}
                          </Badge>
                        </Stack>
                        <Text size="sm" tone="muted" leading="relaxed">
                          {group.body}
                        </Text>
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
              </Box>
            </DocsSection>

            <DocsSection
              id="primitives"
              title="Primitives"
              description="Le primitive sono layout e tipografia pura. Sono il livello piu basso ammesso nelle app."
            >
              <Box className="grid grid-cols-1 gap-(--spacing-4) md:grid-cols-2 xl:grid-cols-4">
                {primitiveItems.map((item) => (
                  <Card key={item.title} variant="surface" tone="neutral" padding="lg">
                    <CardBody>
                      <Stack gap="3">
                        <Icon icon={item.icon} tone="primary" weight="bold" />
                        <Text as="h3" family="display" size="lg" weight="semibold">
                          {item.title}
                        </Text>
                        <Text size="sm" tone="muted" leading="relaxed">
                          {item.body}
                        </Text>
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
              </Box>
            </DocsSection>

            <Box surface="surface" border="subtle" radius="lg" padding="5">
              <Stack direction="row" gap="3" align="center" wrap>
                <Icon icon={CheckCircle} tone="success" weight="bold" />
                <Text size="sm" tone="muted" leading="relaxed">
                  Sirio e il catalogo pubblico del design system Qoovex: token, componenti e pattern sono documentati con esempi navigabili e preview reali.
                </Text>
              </Stack>
            </Box>

            <ComponentCatalog />
            <PatternCatalog />

            <Box surface="surface" border="subtle" radius="lg" padding="5">
              <Stack direction="row" gap="3" align="center" wrap>
                <Icon icon={WarningCircle} tone="warning" weight="bold" />
                <Text size="sm" tone="muted" leading="relaxed">
                  Quando una pagina non trova il blocco adatto, il prossimo passo e aggiungere component o pattern nel package UI, non creare stili locali nelle app.
                </Text>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </main>
      <BackToTop targetId="overview" />
    </Box>
  );
}
