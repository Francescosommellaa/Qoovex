"use client";

import { useEffect, useState } from "react";
import { Button } from "@qoovex/ui";

const preferenceKey = "qoovex-cookie-preference-v1";

type CookiePreference = {
  necessary: true;
  optional: false;
  savedAt: string;
};

function savePreference() {
  const preference: CookiePreference = {
    necessary: true,
    optional: false,
    savedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(preferenceKey, JSON.stringify(preference));
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(!window.localStorage.getItem(preferenceKey));
  }, []);

  if (!isVisible) {
    return null;
  }

  const acceptNecessary = () => {
    savePreference();
    setIsVisible(false);
  };

  return (
    <aside aria-label="Informativa cookie" className="cookie-banner">
      <div>
        <strong>Cookie e tecnologie necessarie</strong>
        <p>
          In questa fase il sito usa solo preferenze tecniche necessarie, come il salvataggio di
          questa scelta nel browser. Non vengono caricati strumenti opzionali.
        </p>
        <a href="/cookies">Leggi la cookie policy</a>
      </div>
      <div className="cookie-banner__actions">
        <Button onClick={acceptNecessary} variant="secondary">
          Solo necessari
        </Button>
        <Button onClick={acceptNecessary}>Ho capito</Button>
      </div>
    </aside>
  );
}
