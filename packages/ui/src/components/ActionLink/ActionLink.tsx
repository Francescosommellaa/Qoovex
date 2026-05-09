import * as React from "react";
import { cn } from "../../lib/utils";
import type { ActionLinkProps } from "./ActionLink.types";
import {
  actionLinkBase,
  actionLinkSizes,
  actionLinkVariants,
} from "./ActionLink.variants";

export const ActionLink = React.forwardRef<HTMLAnchorElement, ActionLinkProps>(
  function ActionLink(
    {
      variant = "primary",
      size = "md",
      iconLeft,
      iconRight,
      children,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <a
        ref={ref}
        className={cn(actionLinkBase, actionLinkVariants[variant], actionLinkSizes[size], className)}
        {...props}
      >
        {iconLeft ? <span className="inline-flex shrink-0">{iconLeft}</span> : null}
        <span className="relative z-10 inline-flex items-center gap-[inherit]">{children}</span>
        {iconRight ? <span className="inline-flex shrink-0">{iconRight}</span> : null}
      </a>
    );
  },
);

ActionLink.displayName = "ActionLink";

