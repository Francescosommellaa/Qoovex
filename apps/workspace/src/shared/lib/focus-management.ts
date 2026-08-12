type FocusDocument = Pick<Document, "activeElement" | "getElementById"> & { body?: HTMLElement };

export interface RefreshFocusSnapshot {
  activeElement: HTMLElement;
  fallbackId: string | null;
}

function isFocusableElement(value: Element | null): value is HTMLElement {
  return Boolean(value && "focus" in value && typeof (value as HTMLElement).focus === "function");
}

function isDisabledFocusTarget(target: HTMLElement): boolean {
  return "disabled" in target && Boolean((target as HTMLButtonElement).disabled);
}

export function focusVisibleTarget(target: HTMLElement, options: ScrollIntoViewOptions = { block: "nearest" }): void {
  target.focus({ preventScroll: true });
  target.scrollIntoView(options);
}

export function captureRefreshFocus(
  documentLike: FocusDocument,
  fallbackId?: string,
  options: { allowOriginOnly?: boolean } = {},
): RefreshFocusSnapshot | null {
  const activeElement = documentLike.activeElement;
  if (!isFocusableElement(activeElement)) return null;
  const fallback = fallbackId
    ? documentLike.getElementById(fallbackId)
    : activeElement.closest<HTMLElement>("[data-focus-refresh-fallback][id], section[id]");
  if (!fallback?.id) return options.allowOriginOnly ? { activeElement, fallbackId: null } : null;
  return { activeElement, fallbackId: fallback.id };
}

export function restoreRefreshFocus(snapshot: RefreshFocusSnapshot | null, documentLike: FocusDocument) {
  if (!snapshot) return false;
  const currentFocus = documentLike.activeElement;
  if (currentFocus && currentFocus !== snapshot.activeElement && currentFocus !== documentLike.body) return false;
  if (snapshot.activeElement.isConnected) {
    if (currentFocus === snapshot.activeElement) return false;
    const focusDroppedToPage = currentFocus === null || currentFocus === documentLike.body;
    const hidden = snapshot.activeElement.getAttribute?.("aria-hidden") === "true"
      || (typeof snapshot.activeElement.getClientRects === "function" && snapshot.activeElement.getClientRects().length === 0);
    if (!focusDroppedToPage || isDisabledFocusTarget(snapshot.activeElement) || hidden) return false;
    focusVisibleTarget(snapshot.activeElement);
    return true;
  }
  if (!snapshot.fallbackId) return false;
  const fallback = documentLike.getElementById(snapshot.fallbackId);
  if (!isFocusableElement(fallback)) return false;
  if (fallback.tabIndex < 0) fallback.tabIndex = -1;
  fallback.dataset.focusRefreshFallback = "true";
  fallback.classList.add("scroll-mt-20", "outline-none", "focus-visible:ring-2", "focus-visible:ring-ring");
  focusVisibleTarget(fallback);
  return true;
}

export function updateWithFocusGuard(
  update: () => void,
  options: { fallbackId?: string; snapshot?: RefreshFocusSnapshot | null } = {},
) {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") {
    update();
    return;
  }

  const snapshot = "snapshot" in options ? options.snapshot ?? null : captureRefreshFocus(document, options.fallbackId);
  if (!snapshot) {
    update();
    return;
  }

  const observer = new MutationObserver(() => {
    const currentFocus = document.activeElement;
    const originHasStableFocus = currentFocus === snapshot.activeElement
      && !isDisabledFocusTarget(snapshot.activeElement);
    if (originHasStableFocus || (currentFocus && currentFocus !== snapshot.activeElement && currentFocus !== document.body)) {
      observer.disconnect();
      return;
    }
    if (restoreRefreshFocus(snapshot, document)) observer.disconnect();
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ["disabled"], childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 10_000);
  update();
}

export function refreshWithFocusGuard(
  refresh: () => void,
  options: { fallbackId?: string; snapshot?: RefreshFocusSnapshot | null } = {},
) {
  updateWithFocusGuard(refresh, options);
}
