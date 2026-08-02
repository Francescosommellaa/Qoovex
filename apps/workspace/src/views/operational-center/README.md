# Operational process detail

Composizione app-local del dettaglio processo. Consuma DTO minimizzati dai servizi server e azioni protette della feature `operational-engine`.

Il dettaglio mostra step, timeline, artifact e sole azioni autorizzate. La Panoramica vive in `src/views/dashboard` e non duplica il controllo avanzato. Loading, empty ed error state devono restare espliciti e non possono inferire conformita o validita legale.

La view usa le primitive canoniche `@qoovex/ui` senza introdurre token, font, tema, iconografia o motion alternativi.
