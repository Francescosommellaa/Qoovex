# Shared Hooks

Scopo: hook condivisibili del package utilities.

Metti qui:
- hook React riusabili da piu` contesti che non renderizzano UI.

Non mettere qui:
- hook fortemente legati a una sola feature workspace;
- componenti o markup JSX complessi.

Regole:
- gli hook qui devono avere dipendenze minime;
- se un hook usa endpoint o naming di una sola app, valuta se deve restare app-local.
