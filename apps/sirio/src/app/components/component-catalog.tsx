'use client';

import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  DeviceMobile,
  DeviceTablet,
  Desktop,
  DotsThree,
  Info,
  Plus,
  Trash,
  User,
  Warning,
  X
} from '@phosphor-icons/react';
import {
  ActionPanel,
  ActivityItem,
  Alert,
  Avatar,
  Badge,
  Button,
  CalculationTrace,
  Card,
  Checkbox,
  Container,
  CrewTaskCard,
  DataPanel,
  Divider,
  Drawer,
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  EmptyPanel,
  EmptyState,
  ErrorState,
  Field,
  FieldError,
  FieldHint,
  Grid,
  Heading,
  IconButton,
  Input,
  Label,
  LoadingState,
  MetricCard,
  Modal,
  MobileNav,
  Navbar,
  NotificationItem,
  NumberInput,
  OperationalAssistantLauncher,
  PageHeader,
  Popover,
  Progress,
  QuantityStatus,
  Radio,
  RuleEditor,
  SearchInput,
  Section,
  SectionHeader,
  Select,
  Skeleton,
  Spinner,
  Stack,
  StatusBadge,
  Surface,
  Switch,
  Tag,
  TaskItem,
  TeamAccessPanel,
  InvitationComposer,
  Text,
  Textarea,
  ToastProvider,
  Toolbar,
  Tooltip,
  UserCard,
  useToast,
  SupportAccessPanel,
  SupportSessionBanner,
  FreeTextEventIntake
} from '@qoovex/ui/web';
import { useDeferredValue, useState } from 'react';

import {
  catalog,
  futureEvents,
  groups,
  preparationFixture as prep,
  type CatalogItem
} from '../event-data';

type Device = 'phone' | 'tablet' | 'desktop';

function Trace() {
  return (
    <CalculationTrace
      title={prep.item}
      input={`${prep.children} bambini`}
      rule="1 cad. + 10%"
      result={String(prep.required)}
      formula={prep.formula}
      source="Regola v3 · Comunioni · arrotonda per eccesso"
    />
  );
}

function ToastSpecimen() {
  const { toast } = useToast();
  return (
    <Stack direction="row" gap="3" wrap>
      <Button
        onClick={() =>
          toast({
            tone: 'success',
            title: 'Preparazione salvata',
            description: 'La brigata vede ora il task approvato.'
          })
        }
      >
        Toast success
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            tone: 'loading',
            title: 'Calcolo in corso',
            description: 'Verifico regole e arrotondamenti.'
          })
        }
      >
        Toast loading
      </Button>
      <Button
        variant="danger"
        onClick={() =>
          toast({
            tone: 'danger',
            title: 'Salvataggio non riuscito',
            description: 'Riprova senza perdere i dati inseriti.'
          })
        }
      >
        Toast danger
      </Button>
    </Stack>
  );
}

function EventList({ onSelect }: { onSelect: () => void }) {
  return (
    <Stack gap="3">
      {futureEvents.map(([day, event, detail, issue]) => (
        <TaskItem
          key={event}
          title={event}
          description={detail}
          status={issue.includes('critic') || issue.includes('mancante') ? 'attention' : 'default'}
          metadata={<Text size="data">{day} · {issue}</Text>}
          action={<Button variant="secondary" onClick={onSelect}>Apri</Button>}
        />
      ))}
    </Stack>
  );
}

function Specimen({ item }: { item: CatalogItem }) {
  const [changed, setChanged] = useState(false);
  const [open, setOpen] = useState(false);
  const [intake, setIntake] = useState(
    'Domani Comunione Rossi, 70 adulti e 22 bambini. Menu bambini con cotoletta. Un ospite senza lattosio.'
  );
  const [quantity, setQuantity] = useState<number | null>(1);
  const [margin, setMargin] = useState('10');
  const [radioValue, setRadioValue] = useState('chef');
  const [sampleSearch, setSampleSearch] = useState('cotolette');
  const [email, setEmail] = useState('marco@ristorante.it');
  const [role, setRole] = useState<'HEAD_OF_HALL' | 'HEAD_CHEF' | 'KITCHEN_CREW'>('KITCHEN_CREW');
  const [supportCode, setSupportCode] = useState('QVX-ROSSI24');
  const [supportReason, setSupportReason] = useState('Verifica accesso capo cucina');

  if (item.id === 'button')
    return (
      <Stack gap="6" className="primitive-showcase">
        <Stack direction="row" gap="3" wrap>
          <Button startIcon={<Plus />}>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="subtle">Subtle</Button>
          <Button variant="danger">Danger</Button>
        </Stack>
        <Stack direction="row" gap="3" wrap align="center">
          <Button size="sm">Small</Button>
          <Button size="md" endIcon={<ArrowRight />}>Medium</Button>
          <Button size="lg">Large</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </Stack>
      </Stack>
    );

  if (item.id === 'icon-button')
    return (
      <Stack direction="row" gap="3" wrap align="center" className="primitive-showcase">
        <IconButton icon={<Plus />} aria-label="Aggiungi" size="sm" />
        <IconButton icon={<Check />} aria-label="Conferma" variant="secondary" />
        <IconButton icon={<User />} aria-label="Profilo" variant="ghost" size="lg" />
        <IconButton icon={<X />} aria-label="Elimina" variant="danger" />
        <IconButton icon={<Check />} aria-label="Caricamento" loading />
      </Stack>
    );

  if (item.id === 'typography')
    return (
      <Stack gap="4" className="primitive-showcase">
        <Heading as="h2" size="display-md">Registro di preparazione</Heading>
        <Heading as="h3" size="heading-lg">Decisioni operative verificabili</Heading>
        <Text size="body-lg">La risposta numerica arriva prima; regola e dettaglio restano disponibili.</Text>
        <Text size="label" weight="semibold" tone="warning">Attenzione richiesta</Text>
        <Text size="data" tone="muted">REV 03 · 12:30 · 35 PEZZI</Text>
      </Stack>
    );

  if (item.id === 'badge')
    return (
      <Stack direction="row" gap="3" wrap className="primitive-showcase">
        <Badge>Neutral</Badge>
        <Badge tone="accent">Accent</Badge>
        <Badge tone="success">Pronto</Badge>
        <Badge tone="warning">Attenzione</Badge>
        <Badge tone="danger">Critico</Badge>
        <Badge tone="info">Info</Badge>
      </Stack>
    );

  if (item.id === 'tag')
    return (
      <Stack direction="row" gap="3" wrap className="primitive-showcase">
        <Tag icon={<User />}>Brigata</Tag>
        <Tag tone="accent">Cucina</Tag>
        <Tag tone="success">Verificato</Tag>
        <Tag tone="warning">Comunione</Tag>
        <Tag tone="info" size="sm">Sala</Tag>
      </Stack>
    );

  if (item.id === 'surfaces')
    return (
      <Grid columns={1} tabletColumns={2} gap="4" className="primitive-showcase">
        <Surface padding="md"><Text weight="semibold">Default</Text></Surface>
        <Surface variant="subtle" padding="md"><Text weight="semibold">Subtle</Text></Surface>
        <Surface variant="elevated" padding="md"><Text weight="semibold">Elevated</Text></Surface>
        <Surface variant="glass" padding="md"><Text weight="semibold">Glass</Text></Surface>
        <Card padding="md" interactive><Button variant="secondary">Apri dettaglio</Button></Card>
        <Card padding="md" selected><Text weight="semibold">Selezionata</Text></Card>
      </Grid>
    );

  if (item.id === 'layout-primitives')
    return (
      <Container size="full" className="primitive-showcase">
        <Section spacing="sm">
          <Stack gap="4">
            <Heading as="h3" size="heading-sm">Stack e Grid responsive</Heading>
            <Grid columns={1} tabletColumns={2} desktopColumns={4} gap="3">
              {['Richiesto', 'Approvato', 'Prodotto', 'Verificato'].map((label) => (
                <Surface key={label} variant="subtle" padding="sm"><Text size="label" weight="semibold">{label}</Text></Surface>
              ))}
            </Grid>
          </Stack>
        </Section>
      </Container>
    );

  if (item.id === 'divider-avatar')
    return (
      <Stack gap="4" className="primitive-showcase">
        <Stack direction="row" gap="3" align="center">
          <Avatar name="Elena Sala" size="sm" />
          <Avatar name="Marco Chef" />
          <Avatar name="Franco Bianchi" size="lg" />
          <Divider orientation="vertical" />
          <Text tone="muted">Fallback accessibili</Text>
        </Stack>
        <Divider tone="subtle" />
        <Divider />
        <Divider tone="strong" />
      </Stack>
    );

  if (item.group === 'Forms')
    return (
      <Stack gap="4" className="form-showcase">
        {item.id === 'field' ? (
          <Field invalid>
            <Label>Unità</Label>
            <Input />
            <FieldHint>Indica pezzi, grammi o vassoi.</FieldHint>
            <FieldError>Seleziona un’unità valida.</FieldError>
          </Field>
        ) : item.id === 'number-input' ? (
          <Field required invalid={quantity === null}>
            <Label>Quantità base</Label>
            <NumberInput value={quantity ?? ''} min={0} step={1} onValueChange={setQuantity} />
            <FieldHint>Il valore vuoto produce null.</FieldHint>
          </Field>
        ) : item.id === 'textarea' ? (
          <Field required>
            <Label>Descrizione evento</Label>
            <Textarea minRows={5} defaultValue="Comunione Rossi, 70 adulti e 22 bambini." />
          </Field>
        ) : item.id === 'select' ? (
          <Field required>
            <Label>Assegna a</Label>
            <Select defaultValue="marco" placeholder="Seleziona responsabile">
              <option value="marco">Marco Chef</option>
              <option value="elena">Elena Sala</option>
            </Select>
          </Field>
        ) : item.id === 'checkbox' ? (
          <Field layout="choice">
            <Checkbox checked={changed} onChange={(event) => setChanged(event.currentTarget.checked)} />
            <Label>Applica a tutte le comunioni</Label>
            <FieldHint>La regola resta modificabile per singolo evento.</FieldHint>
          </Field>
        ) : item.id === 'radio' ? (
          <fieldset className="form-choice-group">
            <legend>Responsabile approvazione</legend>
            <Field layout="choice">
              <Radio name="approval-owner" value="chef" checked={radioValue === 'chef'} onChange={(event) => setRadioValue(event.currentTarget.value)} />
              <Label>Capo cucina</Label>
            </Field>
            <Field layout="choice">
              <Radio name="approval-owner" value="admin" checked={radioValue === 'admin'} onChange={(event) => setRadioValue(event.currentTarget.value)} />
              <Label>Direzione</Label>
            </Field>
          </fieldset>
        ) : item.id === 'switch' ? (
          <Field layout="choice">
            <Switch checked={changed} onChange={(event) => setChanged(event.currentTarget.checked)} />
            <Label>Notifiche preparazioni</Label>
          </Field>
        ) : item.id === 'search-input' ? (
          <SearchInput aria-label="Cerca regola" placeholder="Cerca regola" value={sampleSearch} onChange={(event) => setSampleSearch(event.currentTarget.value)} onClear={() => setSampleSearch('')} />
        ) : (
          <Field>
            <Label>Responsabile</Label>
            <Input startIcon={<User />} defaultValue="Marco Chef" />
          </Field>
        )}
      </Stack>
    );

  if (item.group === 'Feedback')
    return item.id === 'toast' ? (
      <ToastProvider><ToastSpecimen /></ToastProvider>
    ) : item.id === 'tooltip' ? (
      <Tooltip content="Mostra le notifiche operative"><IconButton icon={<Bell />} aria-label="Notifiche" /></Tooltip>
    ) : item.id === 'loading' ? (
      <Grid columns={1} tabletColumns={2} gap="4">
        <LoadingState label="Caricamento preparazioni" />
        <LoadingState mode="skeleton" label="Caricamento riepilogo" skeletonCount={4} />
        <Spinner label="Calcolo in corso" />
        <Skeleton shape="circular" />
      </Grid>
    ) : item.id === 'empty-state' ? (
      <EmptyState title="Nessuna preparazione" description="Le preparazioni approvate compariranno qui." primaryAction={<Button>Crea preparazione</Button>} />
    ) : item.id === 'error-state' ? (
      <ErrorState title="Impossibile caricare le regole" description="I dati inseriti non sono stati persi." primaryAction={<Button variant="danger">Riprova</Button>} />
    ) : item.id === 'progress' ? (
      <Progress label="Dati evento completati" value={68} showValue />
    ) : (
      <Stack gap="3">
        <Alert tone="info" icon={<Info />} title="Informazione operativa">La regola v3 verrà applicata alle prossime comunioni.</Alert>
        <Alert tone="warning" icon={<Warning />} title="Dato mancante" onDismiss={() => setChanged(true)}>Manca l’orario della torta.</Alert>
      </Stack>
    );

  if (item.group === 'Overlay')
    return item.id === 'modal' ? (
      <Modal open={open} onOpenChange={setOpen} title="Conferma approvazione" description="La brigata vedrà immediatamente il task." trigger={<Button>Apri modal</Button>}>
        <Alert tone="warning" title="Decisione operativa">Verifica quantità e assegnazione prima di continuare.</Alert>
      </Modal>
    ) : item.id === 'drawer' ? (
      <Drawer open={open} onOpenChange={setOpen} title="Registra produzione" description={prep.item} side="right" trigger={<Button>Apri drawer</Button>}>
        <Field required><Label>Quantità prodotta</Label><NumberInput defaultValue={prep.produced} /></Field>
      </Drawer>
    ) : item.id === 'popover' ? (
      <Popover aria-label="Dettaglio quantità" trigger={<Button variant="secondary">Mostra dettaglio</Button>}>
        <Text weight="semibold">35 cotolette approvate</Text>
      </Popover>
    ) : (
      <Dropdown aria-label="Azioni preparazione" trigger={<IconButton icon={<DotsThree />} aria-label="Azioni preparazione" variant="secondary" />}>
        <DropdownLabel>Preparazione</DropdownLabel>
        <DropdownItem shortcut="↵">Apri dettaglio</DropdownItem>
        <DropdownItem disabled>Duplica</DropdownItem>
        <DropdownSeparator />
        <DropdownItem destructive icon={<Trash />}>Elimina</DropdownItem>
      </Dropdown>
    );

  if (item.group === 'Navigation' || item.group === 'Layout')
    return item.id === 'navbar' ? (
      <Navbar brand={<Text weight="bold">Qoovex</Text>} items={[{ id: 'prepare', label: 'Prepara', href: '#prepare' }, { id: 'events', label: 'Eventi', href: '#events' }]} activeId="prepare" status={<Badge tone="warning">3 verifiche</Badge>} />
    ) : item.id === 'mobile-nav' ? (
      <MobileNav items={[{ id: 'prepare', label: 'Prepara', href: '#prepare' }, { id: 'events', label: 'Eventi', href: '#events' }]} activeId="prepare" title="Area operativa" description="Scegli una destinazione" action={<Button fullWidth>Nuovo evento</Button>} />
    ) : item.id === 'page-header' ? (
      <PageHeader eyebrow="Pre-Service" title="Preparazioni di domani" description="Controlla quantità, criticità e approvazioni prima del briefing." metadata={<Badge tone="warning">3 da verificare</Badge>} actions={<Button>Approva piano</Button>} />
    ) : item.id === 'section-header' ? (
      <SectionHeader title="Produzione" description="Quantità approvate e stato fisico." actions={<Button variant="secondary">Esporta</Button>} />
    ) : (
      <Toolbar aria-label="Azioni preparazioni" search={<SearchInput aria-label="Cerca preparazione" placeholder="Cerca" />} filters={<Button variant="subtle">Tutte</Button>} primaryActions={<Button>Nuova</Button>} />
    );

  if (item.id === 'metric-card')
    return <MetricCard label="Approvato" value={prep.approved} description={prep.item} tone="success" trend="+10 chef" />;

  if (item.id === 'quantity-status')
    return (
      <QuantityStatus
        items={[
          { label: 'Richiesto', value: prep.required },
          { label: 'Approvato', value: prep.approved, state: 'verified' },
          { label: 'Prodotto', value: prep.produced },
          { label: 'Assegnato', value: prep.assigned },
          { label: 'Extra teorico', value: prep.theoretical, detail: 'Da verificare', state: 'theoretical' },
          { label: 'Verificato', value: 'Non ancora', state: 'warning' }
        ]}
      />
    );

  if (item.id === 'calculation-trace') return <Trace />;

  if (item.id === 'task-item')
    return <TaskItem title={prep.item} description={`${prep.approved} approvate · ${prep.event}`} status="attention" priority="high" checked={changed} onCheckedChange={setChanged} metadata={<StatusBadge status="warning">alta</StatusBadge>} />;

  if (item.id === 'crew-task')
    return <CrewTaskCard title={prep.item} quantity={`${prep.approved} approvate`} event="Comunioni di domani" priority="alta" done={changed} onToggle={setChanged} />;

  if (item.id === 'notification-item')
    return <NotificationItem title="Dato mancante" description="Orario torta Comunione Crespi" tone="warning" time="12:30" unread action={<Button variant="secondary">Risolvi</Button>} />;

  if (item.id === 'activity-item')
    return <ActivityItem title="Quantità approvata" description="35 cotolette bambini" actor="Marco Chef" timestamp="12:30" icon={<Check />} tone="success" />;

  if (item.id === 'user-card')
    return <UserCard name="Elena Sala" email="sala@rossi.it" {...{ role: 'HEAD_OF_HALL' }} actions={<Button variant="secondary">Gestisci</Button>} />;

  if (item.id === 'data-panel')
    return <DataPanel eyebrow="Produzione" title="Preparazioni" description="Stato operativo per domani" actions={<Button>Nuova</Button>} footer={<Text size="caption" tone="muted">Aggiornato ora</Text>}><EventList onSelect={() => setChanged(true)} /></DataPanel>;

  if (item.id === 'action-panel')
    return <ActionPanel tone="warning" eyebrow="Decisione chef" title="Approvazione richiesta" description="La proposta cambia la quantità approvata."><Trace /></ActionPanel>;

  if (item.id === 'empty-panel')
    return <EmptyPanel title="Nessuna preparazione" description="Le preparazioni approvate compariranno qui." primaryAction={<Button>Crea preparazione</Button>} />;

  if (item.id === 'free-text-intake')
    return <FreeTextEventIntake value={intake} onChange={setIntake} onSubmit={() => setChanged(true)} status={changed ? '8 dati estratti, 1 dato da verificare.' : undefined} />;

  if (item.id === 'rule-editor')
    return <RuleEditor quantity={quantity} margin={margin} onQuantityChange={setQuantity} onMarginChange={setMargin} onSubmit={() => setChanged(true)} submitLabel={changed ? 'Regola salvata' : 'Salva regola'} />;

  if (item.id === 'team-access')
    return <TeamAccessPanel members={[{ id: '1', name: 'Franco Bianchi', email: 'direzione@rossi.it', role: 'ADMIN' }, { id: '2', name: 'Elena Sala', email: 'sala@rossi.it', role: 'HEAD_OF_HALL' }, { id: '3', name: 'Marco Chef', email: 'chef@rossi.it', role: 'HEAD_CHEF' }]} canRevoke={(memberRole) => memberRole !== 'ADMIN'} onRevoke={() => setChanged(true)} />;

  if (item.id === 'invitation-composer')
    return <InvitationComposer email={email} role={role} onEmailChange={setEmail} onRoleChange={setRole} onSubmit={() => setChanged(true)} />;

  if (item.id === 'support-access')
    return <SupportAccessPanel code={supportCode} reason={supportReason} onCodeChange={setSupportCode} onReasonChange={setSupportReason} onSubmit={() => setChanged(true)} />;

  if (item.id === 'support-banner')
    return <SupportSessionBanner structure="Villa Rossi" reason="Verifica accesso capo cucina" expiresAt="29 min" onClose={() => setChanged(true)} />;

  if (item.id === 'assistant-launcher')
    return (
      <Stack direction="row" gap="3" align="center">
        <OperationalAssistantLauncher onOpen={() => setOpen(true)} />
        <Text tone="muted">{open ? 'Assistente aperto' : 'Trigger operativo'}</Text>
      </Stack>
    );

  if (item.id === 'marketing-home')
    return (
      <DataPanel eyebrow="Marketing" title="Home Qoovex" description="Le composizioni marketing restano app-local in apps/web.">
        <Grid columns={1} tabletColumns={3} gap="3">
          <MetricCard label="Centro" value="Pre-Service" />
          <MetricCard label="Autorità" value="Chef" />
          <MetricCard label="Output" value="Numeri verificabili" />
        </Grid>
      </DataPanel>
    );

  return (
    <Stack direction="row" gap="3" wrap className="primitive-showcase">
      <Button onClick={() => setChanged(true)}>{changed ? 'Azione completata' : item.name}</Button>
      <Button variant="secondary">Secondaria</Button>
      <span role="status">{changed ? 'Operazione completata.' : ''}</span>
    </Stack>
  );
}

export function ComponentCatalog() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<string>('Tutti');
  const [device, setDevice] = useState<Device>('phone');
  const deferredQuery = useDeferredValue(query.toLocaleLowerCase('it'));
  const visible = catalog.filter(
    (item) =>
      (group === 'Tutti' || item.group === group) &&
      `${item.name} ${item.purpose}`.toLocaleLowerCase('it').includes(deferredQuery)
  );

  return (
    <div className="catalog-page">
      <PageHeader
        className="catalog-header"
        align="start"
        eyebrow="Sirio / Componenti canonici"
        title={<>Dal dato.<br />Alla decisione.</>}
        description="Componenti web condivisi da @qoovex/ui, validati con fixture realistiche prima degli adattatori native."
      />
      <Toolbar
        sticky
        className="catalog-controls"
        aria-label="Filtri catalogo"
        search={<SearchInput aria-label="Cerca componente" placeholder="Cerca componente" value={query} onChange={(event) => setQuery(event.target.value)} onClear={() => setQuery('')} />}
        filters={
          <div className="group-filter" aria-label="Filtra per gruppo">
            {['Tutti', ...groups].map((value) => (
              <Button size="sm" variant={group === value ? 'primary' : 'ghost'} key={value} aria-pressed={group === value} onClick={() => setGroup(value)}>
                {value}
              </Button>
            ))}
          </div>
        }
        primaryActions={
          <div className="device-switcher" aria-label="Viewport specimen">
            {(['phone', 'tablet', 'desktop'] as const).map((value) => (
              <Button
                size="sm"
                variant={device === value ? 'primary' : 'ghost'}
                key={value}
                aria-pressed={device === value}
                onClick={() => setDevice(value)}
                startIcon={value === 'phone' ? <DeviceMobile /> : value === 'tablet' ? <DeviceTablet /> : <Desktop />}
              >
                <span>{value === 'phone' ? 'Phone' : value === 'tablet' ? 'Tablet' : 'Desktop'}</span>
              </Button>
            ))}
          </div>
        }
      />
      <p className="qv-visually-hidden" role="status">{visible.length} componenti corrispondenti</p>
      <div className="catalog-layout">
        <aside className="catalog-index">
          <p>{visible.length} componenti</p>
          <nav aria-label="Indice componenti">
            {visible.map((item) => (
              <a key={item.id} href={`#${item.id}`}>{item.name}</a>
            ))}
          </nav>
        </aside>
        <div className="catalog-list">
          {visible.length ? (
            visible.map((item, index) => (
              <section className="component-section" id={item.id} key={item.id}>
                <header>
                  <div>
                    <span>{item.group}</span>
                    <h2>{item.name}</h2>
                    <p>{item.purpose}</p>
                  </div>
                  <code>Web / @qoovex/ui</code>
                </header>
                <div className="component-body">
                  <div className="specimen-wrap" data-device={device}>
                    <div className="specimen-label">
                      <span>{device}</span>
                      <small>{device === 'phone' ? '390 × 844' : device === 'tablet' ? '768 × 1024' : '1440 × 900'}</small>
                    </div>
                    <div className="specimen-canvas"><Specimen item={item} /></div>
                  </div>
                  <dl className="component-notes">
                    <div><dt>Anatomia</dt><dd>{item.anatomy}</dd></div>
                    <div><dt>Varianti</dt><dd>{item.variants}</dd></div>
                    <div><dt>Accessibilità</dt><dd>{item.accessibility}</dd></div>
                  </dl>
                </div>
                <footer>
                  {index === 0 ? (
                    <span aria-disabled="true"><ArrowLeft aria-hidden="true" /> Precedente</span>
                  ) : (
                    <a href={`#${visible[index - 1]?.id}`}><ArrowLeft aria-hidden="true" /> Precedente</a>
                  )}
                  {index === visible.length - 1 ? (
                    <span aria-disabled="true">Successivo <ArrowRight aria-hidden="true" /></span>
                  ) : (
                    <a href={`#${visible[index + 1]?.id}`}>Successivo <ArrowRight aria-hidden="true" /></a>
                  )}
                </footer>
              </section>
            ))
          ) : (
            <EmptyState
              title="Nessun componente trovato"
              description="Modifica la ricerca o mostra tutti i gruppi."
              primaryAction={<Button onClick={() => { setQuery(''); setGroup('Tutti'); }}>Azzera filtri</Button>}
            />
          )}
        </div>
      </div>
    </div>
  );
}
