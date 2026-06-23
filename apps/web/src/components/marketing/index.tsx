import type { ReactNode } from "react";

import {
  Badge,
  Card,
  Container,
  Grid,
  Heading,
  Section,
  Stack,
  Surface,
  Text
} from "@qoovex/ui/web";

export interface HeroProof {
  label: ReactNode;
  value: ReactNode;
}

export interface HeroSectionProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  trustLine?: ReactNode;
  proofs?: readonly HeroProof[];
  visual?: ReactNode;
}

export function HeroSection({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  trustLine,
  proofs,
  visual
}: HeroSectionProps) {
  return (
    <Section className="marketing-hero" spacing="lg">
      <Container>
        <Grid columns={1} tabletColumns={2} gap="8" align="center">
          <Stack gap="6" className="marketing-hero__copy">
            {eyebrow ? <Badge tone="warning">{eyebrow}</Badge> : null}
            <Stack gap="4">
              <Heading as="h1" size="display-lg" balance>
                {title}
              </Heading>
              {description ? (
                <Text size="body-lg" tone="muted">
                  {description}
                </Text>
              ) : null}
            </Stack>
            {primaryAction || secondaryAction ? (
              <div className="marketing-actions">
                {primaryAction}
                {secondaryAction}
              </div>
            ) : null}
            {trustLine ? (
              <Text size="label" tone="muted">
                {trustLine}
              </Text>
            ) : null}
            {proofs?.length ? (
              <dl className="marketing-proof">
                {proofs.map((proof) => (
                  <div key={String(proof.label)}>
                    <dt>{proof.label}</dt>
                    <dd>{proof.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </Stack>
          {visual ? <div className="marketing-hero__visual">{visual}</div> : null}
        </Grid>
      </Container>
    </Section>
  );
}

export interface FeatureCardProps {
  title: ReactNode;
  description: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  variant?: "default" | "elevated";
}

export function FeatureCard({
  title,
  description,
  icon,
  action,
  variant = "default"
}: FeatureCardProps) {
  return (
    <Card className="marketing-feature-card" variant={variant} padding="md" radius="lg">
      {icon ? <span className="marketing-feature-card__icon" aria-hidden="true">{icon}</span> : null}
      <Heading as="h3" size="heading-sm">
        {title}
      </Heading>
      <Text tone="muted" size="body-sm">
        {description}
      </Text>
      {action ? <div className="marketing-feature-card__action">{action}</div> : null}
    </Card>
  );
}

export interface FeatureGridProps {
  children?: ReactNode;
  features?: readonly FeatureCardProps[];
}

export function FeatureGrid({ children, features }: FeatureGridProps) {
  return (
    <Grid className="marketing-feature-grid" columns={1} tabletColumns={3} gap="4">
      {children ??
        features?.map((feature) => (
          <FeatureCard
            key={String(feature.title)}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            action={feature.action}
            variant={feature.variant}
          />
        ))}
    </Grid>
  );
}

export interface CTASectionProps {
  title: ReactNode;
  description?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  variant?: "default" | "glass" | "accent";
}

export function CTASection({
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = "default"
}: CTASectionProps) {
  return (
    <Section spacing="lg">
      <Container>
        <Surface className="marketing-cta" data-variant={variant} variant={variant === "glass" ? "glass" : "elevated"} padding="lg" radius="lg">
          <Stack gap="4">
            <Heading as="h2" size="heading-lg" balance>
              {title}
            </Heading>
            {description ? (
              <Text size="body-lg" tone={variant === "accent" ? "inverse" : "muted"}>
                {description}
              </Text>
            ) : null}
            {primaryAction || secondaryAction ? (
              <div className="marketing-actions">
                {primaryAction}
                {secondaryAction}
              </div>
            ) : null}
          </Stack>
        </Surface>
      </Container>
    </Section>
  );
}

export interface TrustBarProps {
  label?: ReactNode;
  items: readonly ReactNode[];
}

export function TrustBar({ label, items }: TrustBarProps) {
  return (
    <Surface className="marketing-trust-bar" variant="subtle" padding="md" radius="lg">
      {label ? <Text size="label" weight="semibold">{label}</Text> : null}
      <div className="marketing-trust-bar__items">
        {items.map((item) => (
          <Text as="span" size="label" tone="muted" key={String(item)}>
            {item}
          </Text>
        ))}
      </div>
    </Surface>
  );
}
