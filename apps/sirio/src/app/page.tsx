"use client";

import * as React from "react";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle,
  CookingPot,
  Palette,
  TextT,
} from "@phosphor-icons/react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Checkbox,
  CtaBand,
  Divider,
  FeatureShowcase,
  Form,
  FormActions,
  FormContent,
  FormControl,
  FormField,
  HeroSection,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ProductPreviewFrame,
  Radio,
  Select,
  Stack,
  Text,
  Textarea,
  Toast,
  Toggle,
} from "@qoovex/ui";

const colors = [
  ["Ink", "#111111"],
  ["Paper", "#ffffff"],
  ["Obsidian", "#272625"],
  ["Cream", "#f4f3ef"],
  ["Ember", "#e8400d"],
  ["Blush", "#ffd7f0"],
  ["Mint", "#b7efb2"],
  ["Yellow", "#ffef99"],
  ["Lilac", "#e2ddfd"],
] as const;

const typeRoles = [
  ["hero", "Hero 84"],
  ["display", "Display 56"],
  ["heading-lg", "Heading large"],
  ["heading", "Heading"],
  ["subheading", "Subheading"],
  ["body", "Body"],
  ["body-sm", "Body small"],
  ["eyebrow", "Eyebrow"],
  ["caption", "Caption"],
] as const;

const featureItems = [
  {
    title: "Ricette operative",
    body: "Schede leggibili, rese, ingredienti e informazioni sensibili in un unico flusso.",
    label: "Recipe",
    icon: <Icon icon={CookingPot} size="sm" />,
  },
  {
    title: "Menu aggiornabili",
    body: "Gerarchie chiare e superfici piatte per comporre rapidamente carte e servizi.",
    label: "Menu",
    icon: <Icon icon={Palette} size="sm" />,
  },
  {
    title: "Tipografia unica",
    body: "General Sans porta ogni voce, dalla microcopy ai display più compressi.",
    label: "Type",
    icon: <Icon icon={TextT} size="sm" />,
  },
];

const selectOptions = [
  { value: "recipes", label: "Ricette" },
  { value: "menus", label: "Menu" },
  { value: "work-plans", label: "Piani di lavoro" },
];

function Section({
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
      gap="8"
      className="mx-auto w-full max-w-(--container-wide) scroll-mt-24 px-(--page-gutter) py-(--spacing-16)"
    >
      <Stack gap="3" className="max-w-(--measure-copy)">
        <Text textStyle="eyebrow" tone="muted" weight="bold">
          Sirio V2
        </Text>
        <Text as="h2" textStyle="display" weight="medium">
          {title}
        </Text>
        <Text textStyle="body" tone="muted">
          {description}
        </Text>
      </Stack>
      {children}
    </Stack>
  );
}

export default function SirioPage() {
  const [toggle, setToggle] = React.useState(true);

  return (
    <Box className="min-h-dvh bg-(--color-paper-white) text-(--color-ink-black)">
      <header className="sticky top-0 z-(--z-sticky) px-(--page-gutter) pt-(--spacing-4)">
        <nav className="mx-auto flex min-h-14 max-w-(--container-wide) items-center gap-(--spacing-4) rounded-(--radius-lg) border border-(--color-border) bg-white/92 px-(--spacing-4) shadow-(--shadow-md) backdrop-blur-xl">
          <a href="#overview" className="flex items-center gap-(--spacing-2) no-underline">
            <Image
              src="/logo-icon/sirio-icon.svg"
              alt=""
              width={24}
              height={24}
              className="size-6"
            />
            <Text as="span" textStyle="body-sm" weight="medium">
              Sirio
            </Text>
          </a>
          <div className="ml-auto hidden items-center gap-(--spacing-1) md:flex">
            {["Fondazioni", "Componenti", "Pattern"].map((label) => (
              <Button
                key={label}
                as="a"
                href={`#${label.toLowerCase()}`}
                variant="ghost"
                size="sm"
              >
                {label}
              </Button>
            ))}
          </div>
          <Badge variant="outline" size="sm">
            Qoovex DS V2
          </Badge>
        </nav>
      </header>

      <main>
        <HeroSection
          id="overview"
          eyebrow="Design system canonico"
          title="Un workspace chiaro, preciso e pronto per il servizio."
          description="General Sans, superfici paper, gerarchie nere e colore concentrato solo dove aggiunge significato."
          actions={[
            { label: "Esplora i componenti", href: "#componenti" },
            { label: "Leggi i pattern", href: "#pattern", variant: "secondary" },
          ]}
          proof={[
            { value: "1", label: "famiglia tipografica" },
            { value: "4 px", label: "unità di ritmo" },
            { value: "AA", label: "contrasto minimo" },
          ]}
          visual={<ProductPreviewFrame activeScreen="recipes" />}
        />

        <Section
          id="fondazioni"
          title="Fondazioni"
          description="Il sistema parte da veri bianchi, Ink Black strutturale e accenti atmosferici controllati."
        >
          <div className="grid grid-cols-2 gap-(--spacing-4) sm:grid-cols-3 lg:grid-cols-5">
            {colors.map(([name, value]) => (
              <Card key={name} variant="paper" padding="none">
                <div
                  className="h-24 border-b border-(--color-divider)"
                  style={{ background: value }}
                  aria-hidden="true"
                />
                <CardBody padding="sm">
                  <Stack gap="1">
                    <Text textStyle="body-sm" weight="medium">
                      {name}
                    </Text>
                    <Text textStyle="caption" tone="muted">
                      {value}
                    </Text>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </div>

          <Card variant="cream" padding="lg">
            <CardBody>
              <Stack gap="5">
                {typeRoles.map(([role, label]) => (
                  <Text
                    key={role}
                    textStyle={role}
                    weight={role === "eyebrow" ? "bold" : "medium"}
                  >
                    {label} · General Sans
                  </Text>
                ))}
              </Stack>
            </CardBody>
          </Card>
        </Section>

        <Divider />

        <Section
          id="componenti"
          title="Componenti"
          description="Le capacità esistenti restano disponibili, ma usano superfici piatte, bordi netti e gerarchie più sobrie."
        >
          <Card variant="paper" padding="lg">
            <CardBody>
              <Stack gap="8">
                <Stack direction="row" gap="3" wrap>
                  <Button iconRight={<Icon icon={ArrowRight} size="sm" />}>
                    Primaria
                  </Button>
                  <Button variant="secondary">Secondaria</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Distruttiva</Button>
                </Stack>

                <Stack direction="row" gap="2" wrap>
                  <Badge variant="announcement">Nuovo sistema</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="soft" tone="success">
                    Operativo
                  </Badge>
                  <Badge variant="filled">Filled</Badge>
                </Stack>

                <Form variant="plain" onSubmit={(event) => event.preventDefault()}>
                  <FormContent>
                    <div className="grid gap-(--spacing-4) md:grid-cols-2">
                      <FormField label="Titolo ricetta">
                        <FormControl>
                          <Input placeholder="Risotto al limone" />
                        </FormControl>
                      </FormField>
                      <FormField label="Area">
                        <FormControl>
                          <Select options={selectOptions} defaultValue="recipes" />
                        </FormControl>
                      </FormField>
                    </div>
                    <FormField label="Note operative">
                      <FormControl>
                        <Textarea placeholder="Mise en place, allergeni, servizio" />
                      </FormControl>
                    </FormField>
                    <Stack direction="row" gap="5" wrap>
                      <Checkbox label="Ricetta verificata" defaultChecked />
                      <Radio name="density" label="Densità adattiva" defaultChecked />
                      <Toggle
                        label="Notifiche"
                        checked={toggle}
                        onCheckedChange={setToggle}
                      />
                    </Stack>
                  </FormContent>
                  <FormActions align="end">
                    <Button variant="secondary">Annulla</Button>
                    <Button type="submit">Salva</Button>
                  </FormActions>
                </Form>

                <Stack direction="row" gap="3" wrap>
                  <Modal
                    title="Conferma operazione"
                    description="Dialog ridisegnato con superficie Paper e gerarchie V2."
                    trigger={<Button variant="secondary">Apri modal</Button>}
                    footer={
                      <ModalFooter>
                        <Button variant="secondary">Chiudi</Button>
                        <Button>Conferma</Button>
                      </ModalFooter>
                    }
                  >
                    <ModalBody>
                      <Text textStyle="body-sm" tone="muted">
                        Il comportamento resta accessibile da tastiera e compatibile con gli
                        utilizzi esistenti.
                      </Text>
                    </ModalBody>
                  </Modal>
                  <Toast
                    title="Design system aggiornato"
                    description="Token e componenti usano il contratto V2."
                    variant="success"
                  />
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        </Section>

        <Section
          id="pattern"
          title="Pattern"
          description="Le composizioni ufficiali mantengono il colore raro e fanno lavorare tipografia, spazio e ritmo."
        >
          <FeatureShowcase items={featureItems} />
          <Card variant="obsidian" padding="lg">
            <CardBody>
              <Stack gap="3">
                <Icon
                  icon={CheckCircle}
                  size="lg"
                  tone="current"
                  className="text-(--color-paper-white)"
                />
                <Text as="h3" textStyle="heading" tone="inverse" weight="medium">
                  Superficie Obsidian contestuale
                </Text>
                <Text textStyle="body-sm" tone="inverse" className="max-w-(--measure-copy) opacity-75">
                  Il nero caldo è una destinazione intenzionale, non un tema globale.
                </Text>
              </Stack>
            </CardBody>
          </Card>
        </Section>

        <CtaBand
          title="Componi con il sistema, non intorno al sistema."
          description="Ogni app consuma le stesse primitive, gli stessi componenti e gli stessi pattern."
          actions={[{ label: "Torna all'inizio", href: "#overview" }]}
        />
      </main>
    </Box>
  );
}
