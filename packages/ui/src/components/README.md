# Componenti Stable v0.5

## Ownership

- `Surface`: materiale, elevazione, Crystal e fallback.
- `Card`: contenitore semantico che riusa Surface.
- `Button`, `IconButton`: azioni; magnetic e` marketing-only.
- `Field`: relazione label, descrizione, stato e messaggio dei controlli.
- `Dialog`, `Drawer`, `Popover`, `DropdownMenu`, `Tooltip`: overlay Radix con
  contratto visuale Qoovex.
- `Toast`, `Progress`, `Skeleton`, `EmptyState`: feedback e attesa.

Ogni nuova responsabilita` estende questi componenti composition-first. Non
creare copie app-local, varianti visuali prive di significato o blur sui
discendenti.
