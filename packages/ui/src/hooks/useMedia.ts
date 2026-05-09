"use client";

import * as React from "react";

export function useMedia(query: string, defaultValue = false) {
  const [matches, setMatches] = React.useState(defaultValue);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

