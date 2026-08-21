# Reviewed visual baselines

Baselines are stored by operating system and Playwright project:

```text
{platform}/{projectName}/{surface}.png
```

Windows (`win32`) and CI Linux (`linux`) images are independent review
artifacts. A local update affects only the current platform and requires the
exact `I_ACKNOWLEDGE_INTENTIONAL_VISUAL_CHANGE` attestation. CI never updates
or writes baselines.

The first Linux run is expected to fail closed when a baseline is missing.
Download its failure artifact, inspect every `actual.png`, copy only approved
images into the matching `linux` path, and commit them explicitly. Never copy
or promote a diff automatically.

Font availability and font identity are intentionally outside this gate. The
browser blocks external requests, so platform fallback rendering is accepted
and reviewed as part of each platform baseline.
