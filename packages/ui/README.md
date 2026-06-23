# @qoovex/ui

Fondazione condivisa di Qoovex Pre-Service Brain. L’entrypoint principale espone
token platform-neutral; `@qoovex/ui/web` espone primitive e componenti React DOM.
`styles.css` aggrega token, base e stili componenti. Fixture e catalogo restano
in Sirio; il futuro adattatore native manterrà API e semantica equivalenti.

## Primitive web

`@qoovex/ui/web` espone Button, IconButton, Text, Heading, Badge, Tag, Divider,
Surface, Card, Container, Section, Stack, Grid e Avatar. Tutte preservano
`className`, props HTML e ref e usano esclusivamente i token canonici.

```tsx
import { Button, Card, Heading, Stack, Text } from '@qoovex/ui/web';

<Card padding="md" variant="elevated">
  <Stack gap="4">
    <Heading as="h2" size="heading-md">
      Preparazione pronta
    </Heading>
    <Text tone="muted">35 cotolette approvate.</Text>
    <Button>Apri dettaglio</Button>
  </Stack>
</Card>;
```

## Form web

Il layer form espone Field, Label, FieldHint, FieldError, Input, NumberInput,
Textarea, Select, Checkbox, Radio, Switch e SearchInput. Field Ã¨ il proprietario
canonico di ID, required, disabled, invalid e descrizioni accessibili.

```tsx
import { Field, FieldError, FieldHint, Input, Label } from '@qoovex/ui/web';

<Field id="email" required invalid={Boolean(error)}>
  <Label>Email</Label>
  <Input type="email" autoComplete="email" />
  <FieldHint>Usa lâ€™indirizzo di lavoro.</FieldHint>
  {error ? <FieldError>{error}</FieldError> : null}
</Field>;
```

NumberInput usa `onValueChange`: restituisce `number` per un valore finito e
`null` per campo vuoto o valore non numerico, senza propagare `NaN`.

## Feedback e overlay web

Il layer feedback espone Alert, ToastProvider/useToast, Tooltip, Spinner,
Skeleton, LoadingState, EmptyState, ErrorState e Progress. Alert non crea una
live region salvo richiesta esplicita tramite `live`; Toast applica durata,
pausa e limite di coda canonici.

Modal, Drawer, Popover e Dropdown compongono primitive Radix con superfici e
token Qoovex. Modal e Drawer richiedono sempre un titolo, confinano il focus,
bloccano lo scroll e lo restituiscono al trigger alla chiusura.

## Navigation e layout web

Navbar e MobileNav condividono `NavigationItem` e accettano un `renderLink`
opzionale per integrare router applicativi senza legare il package a Next.js.
Le destinazioni devono essere gia autorizzate dal consumer: il design system
non filtra permessi lato client.

AppShell produce un solo landmark `main`, uno skip link e slot per header, rail,
supporto e footer. PageHeader, SectionHeader e Toolbar standardizzano gerarchia,
azioni e comportamento responsive senza includere logica di business.

## Product e data display web

Il layer product espone pattern riusabili per l'interfaccia operativa: MetricCard,
TaskItem, NotificationItem, ActivityItem, UserCard, DataPanel, WorkspacePanel,
ActionPanel, EmptyPanel, StatusBadge, CalculationTrace, QuantityStatus e
CrewTaskCard. Sono composizioni di primitive, form e feedback; non esportano più
wrapper nominali ereditati dal vecchio pannello generico.

```tsx
import { MetricCard, TaskItem } from '@qoovex/ui/web';

<MetricCard label="Approvato" value={35} description="Cotolette bambini" tone="success" />;
<TaskItem title="Cotolette" status="attention" priority="high" checked={false} />;
```
