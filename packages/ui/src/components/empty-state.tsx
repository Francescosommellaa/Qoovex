import type { ComponentPropsWithRef, ReactNode } from "react";

import { Card } from "./card";
import { mergeClassNames } from "./merge-class-names";

export type EmptyStateProps = ComponentPropsWithRef<"article"> & {
  action?: ReactNode;
  description: string;
  icon?: ReactNode;
  title: string;
};

export function EmptyState({
  action,
  className,
  description,
  icon,
  title,
  ...props
}: EmptyStateProps) {
  return (
    <Card className={mergeClassNames("qv-empty-state", className)} {...props}>
      {icon ? <div className="qv-empty-state__icon">{icon}</div> : null}
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </Card>
  );
}
