import type { HTMLAttributes, ReactNode, Ref } from 'react';

import { Heading, type HeadingElement, Text } from '../primitives/typography';
import { cx } from '../primitives/utils';

interface HeaderContentProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  metadata?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  align?: 'start' | 'split';
}

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'>, HeaderContentProps {
  ref?: Ref<HTMLElement>;
}

export function PageHeader({ ref, eyebrow, title, description, metadata, actions, breadcrumbs, align = 'split', className, ...props }: PageHeaderProps) {
  return (
    <header ref={ref} className={cx('qv-page-header', className)} data-align={align} {...props}>
      {breadcrumbs ? <div className="qv-page-header__breadcrumbs">{breadcrumbs}</div> : null}
      <div className="qv-page-header__row">
        <div className="qv-page-header__content">
          {eyebrow ? <Text className="qv-header__eyebrow" size="data" weight="semibold" tone="accent">{eyebrow}</Text> : null}
          <Heading as="h1" size="heading-xl" balance>{title}</Heading>
          {description ? <Text size="body-lg" tone="muted">{description}</Text> : null}
          {metadata ? <div className="qv-header__metadata">{metadata}</div> : null}
        </div>
        {actions ? <div className="qv-header__actions">{actions}</div> : null}
      </div>
    </header>
  );
}

export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'>, Omit<HeaderContentProps, 'breadcrumbs'> {
  ref?: Ref<HTMLElement>;
  headingLevel?: Extract<HeadingElement, 'h2' | 'h3' | 'h4'>;
}

export function SectionHeader({ ref, eyebrow, title, description, metadata, actions, align = 'split', headingLevel = 'h2', className, ...props }: SectionHeaderProps) {
  return (
    <header ref={ref} className={cx('qv-section-header', className)} data-align={align} {...props}>
      <div className="qv-section-header__content">
        {eyebrow ? <Text className="qv-header__eyebrow" size="data" weight="semibold" tone="accent">{eyebrow}</Text> : null}
        <Heading as={headingLevel} size="heading-md">{title}</Heading>
        {description ? <Text size="body-sm" tone="muted">{description}</Text> : null}
        {metadata ? <div className="qv-header__metadata">{metadata}</div> : null}
      </div>
      {actions ? <div className="qv-header__actions">{actions}</div> : null}
    </header>
  );
}
