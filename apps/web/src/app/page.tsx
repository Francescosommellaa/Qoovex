import { Badge } from "@qoovex/ui/components/badge";
import { buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { SiteShell } from "./site-chrome";
import { contactHref } from "./site-config";

export default function HomePage() {
  return <SiteShell><section className="border-b"><div className="mx-auto max-w-7xl px-4 py-24 sm:px-6"><Badge variant="outline">Qoovex vNext disponibile</Badge><h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.05em] sm:text-7xl">Lo spazio condiviso per gestire un lavoro edile con il cliente.</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">Documenta avanzamento, step opzionali, modifiche, prove e richieste di pagamento dalla creazione del cantiere alla chiusura reciproca.</p><a className={`${buttonVariants()} mt-8`} href={contactHref}>Contattaci</a></div></section><section className="mx-auto grid max-w-7xl gap-4 px-4 py-20 sm:grid-cols-2 sm:px-6"><Card><CardHeader><CardTitle>Per l’Azienda</CardTitle><CardDescription>Un solo registro del lavoro.</CardDescription></CardHeader><CardContent><p>Documenta il lavoro una volta e usa gli stessi aggiornamenti per informare il cliente, gestire le modifiche e presentare richieste di pagamento.</p></CardContent></Card><Card><CardHeader><CardTitle>Per il cliente</CardTitle><CardDescription>Solo ciò che è condiviso.</CardDescription></CardHeader><CardContent><p>Segui i lavori sui tuoi immobili, controlla le modifiche e conserva ciò che le parti hanno registrato nello spazio condiviso.</p></CardContent></Card></section></SiteShell>;
}
