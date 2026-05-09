"use client";

import * as React from "react";
import { ArrowUp } from "@phosphor-icons/react";
import { Icon } from "../../primitives/Icon";
import { cn } from "../../lib/utils";
import type { BackToTopProps } from "./BackToTop.types";
import {
  backToTopBase,
  backToTopSizes,
  backToTopVariants,
} from "./BackToTop.variants";

export const BackToTop = React.forwardRef<HTMLAnchorElement, BackToTopProps>(
  function BackToTop(
    {
      targetId = "top",
      label = "Torna su",
      showLabel = false,
      threshold = 320,
      size = "md",
      variant = "floating",
      className,
      onClick,
      ...props
    },
    ref,
  ) {
    const [visible, setVisible] = React.useState(false);
    const href = `#${targetId}`;

    React.useEffect(() => {
      function handleScroll() {
        setVisible(window.scrollY >= threshold);
      }

      handleScroll();
      window.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }, [threshold]);

    function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
      onClick?.(event);

      if (event.defaultPrevented) {
        return;
      }

      const target = document.getElementById(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", href);
    }

    return (
      <a
        ref={ref}
        href={href}
        aria-label={typeof label === "string" ? label : "Torna su"}
        data-visible={visible ? "true" : "false"}
        className={cn(
          backToTopBase,
          backToTopVariants[variant],
          backToTopSizes[size],
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        <Icon icon={ArrowUp} size="sm" weight="bold" />
        <span className={showLabel ? undefined : "sr-only"}>{label}</span>
      </a>
    );
  },
);

BackToTop.displayName = "BackToTop";
