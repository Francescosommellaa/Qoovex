# Operational center

Composizioni app-local del Centro operativo e del dettaglio processo. Consumano DTO minimizzati dai servizi server e azioni protette della feature `operational-engine`.

Il centro mostra processi attivi, decisioni, eccezioni e risultati; il dettaglio mostra step, timeline, artifact e sole azioni autorizzate. Loading, empty ed error state devono restare espliciti e non possono inferire conformita o validita legale.

La view usa le primitive canoniche `@qoovex/ui` senza introdurre token, font, tema, iconografia o motion alternativi.
