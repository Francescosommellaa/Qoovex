"use client";

import { useEffect, useState } from "react";
import { IconCookie } from "@tabler/icons-react";
import { Button } from "@qoovex/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@qoovex/ui/components/card";

const preferenceKey = "qoovex-cookie-preference-v1";

function savePreference() {
  window.localStorage.setItem(
    preferenceKey,
    JSON.stringify({ necessary: true, optional: false, savedAt: new Date().toISOString() }),
  );
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => setVisible(!window.localStorage.getItem(preferenceKey)), []);

  if (!visible) return null;

  const acceptNecessary = () => {
    savePreference();
    setVisible(false);
  };

  return (
    <aside aria-label="Informativa cookie" className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-3xl">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><IconCookie /> Cookie e tecnologie necessarie</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">In questa fase il sito usa solo preferenze tecniche necessarie, come il salvataggio di questa scelta nel browser. Non vengono caricati strumenti opzionali.</p>
          <a className="mt-2 inline-flex text-sm font-medium underline underline-offset-4" href="/cookies">Leggi la cookie policy</a>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-end gap-2">
          <Button onClick={acceptNecessary} variant="outline">Solo necessari</Button>
          <Button onClick={acceptNecessary}>Ho capito</Button>
        </CardFooter>
      </Card>
    </aside>
  );
}
