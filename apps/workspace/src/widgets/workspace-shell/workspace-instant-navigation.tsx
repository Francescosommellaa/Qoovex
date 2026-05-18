"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./workspace-instant-navigation.module.css";

function getInternalUrl(rawHref: string) {
  try {
    const url = new URL(rawHref, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    if (url.pathname.startsWith("/api/")) return null;
    return url;
  } catch {
    return null;
  }
}

function shouldHandleNavigation(event: MouseEvent, anchor: HTMLAnchorElement) {
  if (event.defaultPrevented) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  if (anchor.getAttribute("aria-disabled") === "true") return false;

  const url = getInternalUrl(anchor.href);
  if (!url) return false;

  return `${url.pathname}${url.search}` !== `${window.location.pathname}${window.location.search}`;
}

export function WorkspaceInstantNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    setPending(false);
  }, [pathname, searchParams]);

  React.useEffect(() => {
    if (!pending) return;

    const timeoutId = window.setTimeout(() => setPending(false), 5_000);
    return () => window.clearTimeout(timeoutId);
  }, [pending]);

  React.useEffect(() => {
    function findAnchor(target: EventTarget | null) {
      return target instanceof Element
        ? target.closest<HTMLAnchorElement>("a[href]")
        : null;
    }

    function handleClick(event: MouseEvent) {
      const anchor = findAnchor(event.target);
      if (!anchor || !shouldHandleNavigation(event, anchor)) return;
      setPending(true);
    }

    function handlePrefetch(event: Event) {
      const anchor = findAnchor(event.target);
      if (!anchor) return;

      const url = getInternalUrl(anchor.href);
      if (!url) return;

      router.prefetch(`${url.pathname}${url.search}`);
    }

    document.addEventListener("click", handleClick, { capture: true });
    document.addEventListener("pointerover", handlePrefetch, { capture: true });
    document.addEventListener("focusin", handlePrefetch, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      document.removeEventListener("pointerover", handlePrefetch, { capture: true });
      document.removeEventListener("focusin", handlePrefetch, { capture: true });
    };
  }, [router]);

  return (
    <div
      className={styles.indicator}
      data-pending={pending ? "true" : "false"}
      aria-hidden="true"
    />
  );
}
