"use client";

import { useEffect, useState } from "react";

export type CatalogEntry = {
  id: string;
  label: string;
};

export function CatalogNavigation({ entries }: { entries: CatalogEntry[] }) {
  const [activeId, setActiveId] = useState(entries[0]?.id ?? "");

  useEffect(() => {
    const syncFromHash = () => {
      const nextId = window.location.hash.slice(1);
      if (entries.some((entry) => entry.id === nextId)) setActiveId(nextId);
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);

    const sections = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((record) => record.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!visible) return;
        const nextId = visible.target.id;
        setActiveId(nextId);
        if (window.location.hash !== `#${nextId}`) {
          window.history.replaceState(window.history.state, "", `#${nextId}`);
        }
      },
      { rootMargin: "-18% 0px -68%", threshold: [0, 0.25, 0.75] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
      observer.disconnect();
    };
  }, [entries]);

  return (
    <nav aria-label="Indice dei componenti" className="catalog-navigation">
      <p>Catalogo</p>
      <ol>
        {entries.map((entry) => (
          <li key={entry.id}>
            <a aria-current={activeId === entry.id ? "location" : undefined} href={`#${entry.id}`}>
              {entry.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
