import * as React from "react";
import { IconArrowRight } from "@tabler/icons-react";
import { cn } from "@qoovex/ui/lib/utils";

export interface LinkCtaProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

export function LinkCta({ children, className, ...props }: LinkCtaProps) {
  return (
    <a
      className={cn(
        "group flex w-fit items-center gap-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-sm",
        className
      )}
      {...props}
    >
      <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-[1px] after:w-full after:origin-bottom-left after:scale-x-0 after:bg-foreground after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:after:scale-x-100">
        {children}
      </span>
      <div className="relative flex size-4 items-center overflow-hidden">
        <IconArrowRight className="absolute left-0 size-4 -translate-x-full opacity-0 transition-all duration-300 delay-75 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0 group-hover:opacity-100" />
      </div>
    </a>
  );
}
