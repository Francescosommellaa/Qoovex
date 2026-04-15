"use client";

import * as React from "react";

export interface RecentSearchEntry {
  id: string;
  query: string;
  createdAt: string;
}

export function useRecentSearches() {
  const [recents, setRecents] = React.useState<RecentSearchEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/recent-searches")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setRecents(data))
      .catch(() => setRecents([]))
      .finally(() => setLoading(false));
  }, []);

  const saveSearch = React.useCallback(async (query: string) => {
    if (!query.trim()) return;

    setRecents((prev) => {
      const filtered = prev.filter((r) => r.query !== query.trim());
      const next = [
        { id: `optimistic-${Date.now()}`, query: query.trim(), createdAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, 7);
      return next;
    });

    try {
      await fetch("/api/recent-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      const fresh = await fetch("/api/recent-searches").then((r) => r.json());
      setRecents(fresh);
    } catch {
    }
  }, []);

  const deleteSearch = React.useCallback(async (id: string) => {
    setRecents((prev) => prev.filter((r) => r.id !== id));

    try {
      await fetch("/api/recent-searches", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {
      const fresh = await fetch("/api/recent-searches").then((r) => r.json());
      setRecents(fresh);
    }
  }, []);

  return { recents, loading, saveSearch, deleteSearch };
}