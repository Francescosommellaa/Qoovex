import type { HTMLAttributes, ReactNode, Ref } from 'react';
import type { StructureRole } from '@qoovex/types';

import { Alert } from './feedback';
import { Checkbox, Field, FieldHint, Input, Label, NumberInput, Select, Textarea } from './forms';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Grid,
  Heading,
  Stack,
  Surface,
  Text
} from './primitives';
import { cx } from './primitives/utils';

export type ProductTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type ProductStatus =
  | 'default'
  | 'ready'
  | 'attention'
  | 'critical'
  | 'theoretical'
  | 'verified'
  | 'warning'
  | 'danger'
  | 'success'
  | 'info';

function statusTone(status?: ProductStatus): ProductTone {
  if (status === 'ready' || status === 'verified' || status === 'success') return 'success';
  if (status === 'attention' || status === 'theoretical' || status === 'warning') return 'warning';
  if (status === 'critical' || status === 'danger') return 'danger';
  if (status === 'info') return 'info';
  return 'neutral';
}

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  status?: ProductStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({
  ref,
  status = 'default',
  size = 'md',
  children,
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <Badge ref={ref} className={cx('qv-status-badge', className)} tone={statusTone(status)} size={size} {...props}>
      {children ?? status}
    </Badge>
  );
}

export interface DataPanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  ref?: Ref<HTMLElement>;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  variant?: 'default' | 'subtle' | 'elevated' | 'glass';
}

export function DataPanel({
  ref,
  eyebrow,
  title,
  description,
  actions,
  footer,
  children,
  variant = 'default',
  className,
  ...props
}: DataPanelProps) {
  return (
    <Card
      ref={ref}
      as="section"
      className={cx('qv-data-panel', className)}
      variant={variant}
      padding="none"
      radius="lg"
      {...props}
    >
      <header className="qv-data-panel__header">
        <div className="qv-data-panel__copy">
          {eyebrow ? (
            <Text size="data" weight="semibold" tone="accent">
              {eyebrow}
            </Text>
          ) : null}
          <Heading as="h3" size="heading-sm">
            {title}
          </Heading>
          {description ? (
            <Text size="body-sm" tone="muted">
              {description}
            </Text>
          ) : null}
        </div>
        {actions ? <div className="qv-data-panel__actions">{actions}</div> : null}
      </header>
      <div className="qv-data-panel__body">{children}</div>
      {footer ? <footer className="qv-data-panel__footer">{footer}</footer> : null}
    </Card>
  );
}

export type WorkspacePanelProps = DataPanelProps;
export function WorkspacePanel(props: WorkspacePanelProps) {
  return <DataPanel className={cx('qv-workspace-panel', props.className)} {...props} />;
}

export type ActionPanelProps = DataPanelProps & { tone?: ProductTone };
export function ActionPanel({ tone = 'neutral', className, ...props }: ActionPanelProps) {
  return <DataPanel className={cx('qv-action-panel', className)} data-tone={tone} {...props} />;
}

export interface EmptyPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  ref?: Ref<HTMLDivElement>;
  title: ReactNode;
  description?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
}

export function EmptyPanel({
  ref,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
  ...props
}: EmptyPanelProps) {
  return (
    <Surface ref={ref} className={cx('qv-empty-panel', className)} variant="subtle" padding="md" radius="lg" {...props}>
      <Heading as="h3" size="heading-sm">
        {title}
      </Heading>
      {description ? (
        <Text tone="muted" size="body-sm">
          {description}
        </Text>
      ) : null}
      {primaryAction || secondaryAction ? (
        <div className="qv-empty-panel__actions">
          {primaryAction}
          {secondaryAction}
        </div>
      ) : null}
    </Surface>
  );
}

export interface MetricCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  ref?: Ref<HTMLElement>;
  label: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  trend?: ReactNode;
  tone?: ProductTone;
  action?: ReactNode;
}

export function MetricCard({
  ref,
  label,
  value,
  description,
  trend,
  tone = 'neutral',
  action,
  className,
  ...props
}: MetricCardProps) {
  return (
    <Card ref={ref} className={cx('qv-metric-card', className)} data-tone={tone} padding="md" radius="lg" {...props}>
      <div className="qv-metric-card__header">
        <Text as="span" size="label" weight="semibold" tone="muted">
          {label}
        </Text>
        {trend ? <span className="qv-metric-card__trend">{trend}</span> : null}
      </div>
      <strong className="qv-metric-card__value" data-qv-numeric>
        {value}
      </strong>
      {description ? (
        <Text size="body-sm" tone="muted">
          {description}
        </Text>
      ) : null}
      {action ? <div className="qv-metric-card__action">{action}</div> : null}
    </Card>
  );
}

export interface TaskItemProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  ref?: Ref<HTMLElement>;
  title: ReactNode;
  description?: ReactNode;
  metadata?: ReactNode;
  status?: ProductStatus;
  priority?: 'low' | 'medium' | 'high';
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  action?: ReactNode;
  disabled?: boolean;
}

export function TaskItem({
  ref,
  title,
  description,
  metadata,
  status = 'default',
  priority = 'medium',
  checked,
  onCheckedChange,
  action,
  disabled = false,
  className,
  ...props
}: TaskItemProps) {
  return (
    <article
      ref={ref}
      className={cx('qv-task-item', className)}
      data-priority={priority}
      data-checked={checked || undefined}
      data-disabled={disabled || undefined}
      {...props}
    >
      {onCheckedChange ? (
        <Checkbox
          aria-label={checked ? `Segna non completato: ${String(title)}` : `Completa: ${String(title)}`}
          checked={checked}
          disabled={disabled}
          onChange={(event) => onCheckedChange(event.currentTarget.checked)}
        />
      ) : null}
      <div className="qv-task-item__content">
        <div className="qv-task-item__title-row">
          <Heading as="h3" size="heading-sm">
            {title}
          </Heading>
          <StatusBadge status={status} size="sm" />
        </div>
        {description ? (
          <Text size="body-sm" tone="muted">
            {description}
          </Text>
        ) : null}
        {metadata ? <div className="qv-task-item__metadata">{metadata}</div> : null}
      </div>
      {action ? <div className="qv-task-item__action">{action}</div> : null}
    </article>
  );
}

export interface NotificationItemProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  ref?: Ref<HTMLElement>;
  title: ReactNode;
  description?: ReactNode;
  tone?: ProductTone;
  time?: ReactNode;
  unread?: boolean;
  action?: ReactNode;
}

export function NotificationItem({
  ref,
  title,
  description,
  tone = 'neutral',
  time,
  unread = false,
  action,
  className,
  ...props
}: NotificationItemProps) {
  return (
    <article ref={ref} className={cx('qv-notification-item', className)} data-tone={tone} data-unread={unread || undefined} {...props}>
      <span className="qv-notification-item__dot" aria-hidden="true" />
      <div>
        <Heading as="h3" size="heading-sm">
          {title}
        </Heading>
        {description ? <Text size="body-sm" tone="muted">{description}</Text> : null}
      </div>
      {time ? <Text as="span" size="data" tone="muted">{time}</Text> : null}
      {action ? <div className="qv-notification-item__action">{action}</div> : null}
    </article>
  );
}

export interface ActivityItemProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  ref?: Ref<HTMLElement>;
  title: ReactNode;
  description?: ReactNode;
  timestamp?: ReactNode;
  actor?: ReactNode;
  icon?: ReactNode;
  tone?: ProductTone;
}

export function ActivityItem({
  ref,
  title,
  description,
  timestamp,
  actor,
  icon,
  tone = 'neutral',
  className,
  ...props
}: ActivityItemProps) {
  return (
    <article ref={ref} className={cx('qv-activity-item', className)} data-tone={tone} {...props}>
      <span className="qv-activity-item__icon" aria-hidden="true">{icon}</span>
      <div>
        <Heading as="h3" size="heading-sm">
          {title}
        </Heading>
        {description ? <Text size="body-sm" tone="muted">{description}</Text> : null}
        {actor || timestamp ? (
          <Text size="data" tone="muted">
            {actor}
            {actor && timestamp ? ' · ' : ''}
            {timestamp}
          </Text>
        ) : null}
      </div>
    </article>
  );
}

export interface UserCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'role'> {
  ref?: Ref<HTMLElement>;
  name: string;
  email?: string;
  role?: ReactNode;
  avatarUrl?: string;
  actions?: ReactNode;
  metadata?: ReactNode;
}

export function UserCard({
  ref,
  name,
  email,
  role,
  avatarUrl,
  actions,
  metadata,
  className,
  ...props
}: UserCardProps) {
  return (
    <Card ref={ref} className={cx('qv-user-card', className)} padding="md" radius="lg" {...props}>
      <Avatar name={name} src={avatarUrl} />
      <div className="qv-user-card__copy">
        <Heading as="h3" size="heading-sm">
          {name}
        </Heading>
        {email ? <Text size="body-sm" tone="muted">{email}</Text> : null}
        {metadata ? <div className="qv-user-card__metadata">{metadata}</div> : null}
      </div>
      {role ? <StatusBadge>{role}</StatusBadge> : null}
      {actions ? <div className="qv-user-card__actions">{actions}</div> : null}
    </Card>
  );
}

export interface CalculationTraceProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  title: string;
  input: string;
  rule: string;
  result: string;
  formula: string;
  source: string;
  variant?: 'compact' | 'detailed';
}

export function CalculationTrace({
  ref,
  title,
  input,
  rule,
  result,
  formula,
  source,
  variant = 'detailed',
  className,
  ...props
}: CalculationTraceProps) {
  return (
    <div ref={ref} className={cx('qv-calculation-trace', className)} data-variant={variant} {...props}>
      <header className="qv-calculation-trace__header">
        <Text as="span" size="data" weight="semibold" tone="accent">
          Calcolo verificabile
        </Text>
        <Heading as="h3" size="heading-sm">
          {title}
        </Heading>
      </header>
      <ol className="qv-calculation-trace__steps" aria-label={`Formula: ${formula}`}>
        <li>
          <Text as="span" size="caption" tone="muted">Input</Text>
          <strong>{input}</strong>
        </li>
        <li>
          <Text as="span" size="caption" tone="muted">Regola</Text>
          <strong>{rule}</strong>
        </li>
        <li>
          <Text as="span" size="caption" tone="muted">Risultato</Text>
          <strong>{result}</strong>
        </li>
      </ol>
      {variant === 'detailed' ? (
        <footer className="qv-calculation-trace__footer">
          <Text as="span" size="data">
            {formula}
          </Text>
          <Text as="span" size="caption" tone="muted">
            {source}
          </Text>
        </footer>
      ) : null}
    </div>
  );
}

export interface QuantityItem {
  label: string;
  value: string | number;
  detail?: string;
  state?: 'default' | 'theoretical' | 'verified' | 'warning' | 'danger';
}

export interface QuantityStatusProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  items: readonly QuantityItem[];
}

export function QuantityStatus({ ref, items, className, ...props }: QuantityStatusProps) {
  return (
    <Grid ref={ref} className={cx('qv-quantity-status', className)} columns={1} tabletColumns={2} desktopColumns={3} gap="3" {...props}>
      {items.map((item) => (
        <MetricCard
          key={`${item.label}-${item.value}`}
          label={item.label}
          value={item.value}
          description={item.detail}
          tone={statusTone(item.state)}
        />
      ))}
    </Grid>
  );
}

export function CrewTaskCard({
  title,
  quantity,
  event,
  priority,
  done,
  onToggle
}: {
  title: string;
  quantity: string;
  event: string;
  priority: 'alta' | 'media' | 'bassa';
  done: boolean;
  onToggle: (done: boolean) => void;
}) {
  const mappedPriority = priority === 'alta' ? 'high' : priority === 'media' ? 'medium' : 'low';
  return (
    <TaskItem
      title={title}
      description={`${quantity} · ${event}`}
      priority={mappedPriority}
      status={done ? 'verified' : priority === 'alta' ? 'attention' : 'default'}
      checked={done}
      onCheckedChange={onToggle}
      metadata={<StatusBadge status={priority === 'alta' ? 'warning' : 'default'}>{priority}</StatusBadge>}
      action={
        <Button variant={done ? 'secondary' : 'primary'} type="button" onClick={() => onToggle(!done)}>
          {done ? 'Fatto' : 'Segna fatto'}
        </Button>
      }
    />
  );
}

export function FreeTextEventIntake({
  value,
  onChange,
  onSubmit,
  status,
  submitLabel = 'Struttura evento'
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  status?: string;
  submitLabel?: string;
}) {
  return (
    <DataPanel eyebrow="Intake" title="Descrivi l'evento" description="Inserisci menu, ospiti, timing e richieste speciali.">
      <form
        className="qv-product-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Field required>
          <Label>Descrivi l'evento</Label>
          <Textarea value={value} minRows={5} onChange={(event) => onChange(event.currentTarget.value)} />
          <FieldHint>La revisione resta obbligatoria prima dei calcoli.</FieldHint>
        </Field>
        <Button type="submit">{submitLabel}</Button>
        {status ? <Alert tone="info" live="polite">{status}</Alert> : null}
      </form>
    </DataPanel>
  );
}

export function RuleEditor({
  quantity,
  margin,
  onQuantityChange,
  onMarginChange,
  onSubmit,
  submitLabel = 'Salva regola'
}: {
  quantity: number | null;
  margin: string;
  onQuantityChange: (value: number | null) => void;
  onMarginChange: (value: string) => void;
  onSubmit: () => void;
  submitLabel?: string;
}) {
  return (
    <ActionPanel eyebrow="Regola" title="Formula operativa" description="Salva base e margine senza produrre valori non numerici.">
      <form
        className="qv-product-form qv-product-form--grid"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Field required invalid={quantity === null}>
          <Label>Quantità base</Label>
          <NumberInput value={quantity ?? ''} min={0} step={1} onValueChange={onQuantityChange} />
        </Field>
        <Field required>
          <Label>Margine</Label>
          <Select value={margin} onChange={(event) => onMarginChange(event.currentTarget.value)}>
            <option value="10">10%</option>
            <option value="15">15%</option>
          </Select>
        </Field>
        <Button type="submit">{submitLabel}</Button>
      </form>
    </ActionPanel>
  );
}

export function SupportSessionBanner({
  structure,
  reason,
  expiresAt,
  onClose
}: {
  structure: string;
  reason: string;
  expiresAt: string;
  onClose: () => void;
}) {
  return (
    <aside className="qv-support-banner" aria-label="Sessione supporto attiva">
      <div>
        <Text as="span" size="data" weight="semibold">
          Supporto Qoovex attivo · {expiresAt}
        </Text>
        <strong>{structure}</strong>
        <span>{reason}</span>
      </div>
      <Button variant="secondary" type="button" onClick={onClose}>
        Chiudi supporto
      </Button>
    </aside>
  );
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: StructureRole;
}

export function TeamAccessPanel({
  members,
  canRevoke,
  onRevoke
}: {
  members: readonly TeamMember[];
  canRevoke: (role: StructureRole) => boolean;
  onRevoke: (id: string) => void;
}) {
  return (
    <WorkspacePanel eyebrow="Accessi" title="Persone e reparti">
      <Stack gap="3">
        {members.map((member) => (
          <UserCard
            key={member.id}
            name={member.name}
            email={member.email}
            role={member.role}
            actions={
              canRevoke(member.role) ? (
                <Button variant="secondary" type="button" onClick={() => onRevoke(member.id)}>
                  Revoca
                </Button>
              ) : null
            }
          />
        ))}
      </Stack>
    </WorkspacePanel>
  );
}

export function InvitationComposer({
  email,
  role,
  onEmailChange,
  onRoleChange,
  onSubmit
}: {
  email: string;
  role: Exclude<StructureRole, 'ADMIN'>;
  onEmailChange: (value: string) => void;
  onRoleChange: (value: Exclude<StructureRole, 'ADMIN'>) => void;
  onSubmit: () => void;
}) {
  return (
    <ActionPanel eyebrow="Invito" title="Aggiungi al reparto">
      <form
        className="qv-product-form qv-product-form--grid"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Field required>
          <Label>Email</Label>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => onEmailChange(event.currentTarget.value)}
          />
        </Field>
        <Field required>
          <Label>Ruolo</Label>
          <Select
            value={role}
            onChange={(event) =>
              onRoleChange(event.currentTarget.value as Exclude<StructureRole, 'ADMIN'>)
            }
          >
            <option value="HEAD_OF_HALL">Capo sala</option>
            <option value="HEAD_CHEF">Capo cucina</option>
            <option value="KITCHEN_CREW">Brigata</option>
          </Select>
        </Field>
        <Button type="submit">Invia invito</Button>
      </form>
    </ActionPanel>
  );
}

export function SupportAccessPanel({
  code,
  reason,
  onCodeChange,
  onReasonChange,
  onSubmit
}: {
  code: string;
  reason: string;
  onCodeChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <ActionPanel eyebrow="Super Admin" title="Apri supporto">
      <form
        className="qv-product-form qv-product-form--grid"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Field required>
          <Label>Codice struttura</Label>
          <Input value={code} onChange={(event) => onCodeChange(event.currentTarget.value)} />
        </Field>
        <Field required>
          <Label>Motivo</Label>
          <Input value={reason} onChange={(event) => onReasonChange(event.currentTarget.value)} />
        </Field>
        <Button type="submit">Apri sessione</Button>
      </form>
    </ActionPanel>
  );
}

export function OperationalAssistantLauncher({ onOpen }: { onOpen: () => void }) {
  return (
    <Button type="button" onClick={onOpen}>
      Chiedi a Qoovex
    </Button>
  );
}
