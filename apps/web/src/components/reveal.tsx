"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type RevealProps = {
  children: ReactNode;
  /** Ritardo in ms per comporre uno stagger leggero tra elementi vicini. */
  delay?: number;
  className?: string;
  /** Elemento HTML da renderizzare. Default: div. */
  as?: "div" | "li" | "section";
};

/**
 * Rivela il contenuto quando entra nel viewport, una sola volta.
 * Usa solo transform/opacity ed è disattivato con prefers-reduced-motion (via CSS).
 * Senza JavaScript il contenuto resta visibile (data-reveal impostato solo dopo il mount).
 */
export function Reveal({ children, delay = 0, className, as = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }

    setEnabled(true);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      // threshold 0: qualsiasi pixel visibile rivela l'elemento, così nulla resta
      // bloccato "nascosto" se si trova già sul fold al momento del mount.
      { rootMargin: "0px 0px -5% 0px", threshold: 0 },
    );
    observer.observe(node);

    // Rete di sicurezza: se per qualsiasi motivo l'observer non scatta
    // (elemento già interamente visibile, layout tardivo), rivela comunque.
    const fallback = window.setTimeout(() => setVisible(true), 700);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  const Tag = as;

  return (
    <Tag
      ref={ref as never}
      className={className}
      data-reveal={enabled ? (visible ? "visible" : "hidden") : undefined}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
