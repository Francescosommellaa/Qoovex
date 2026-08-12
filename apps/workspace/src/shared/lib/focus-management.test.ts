import { describe, expect, it, vi } from "vitest";

describe("refresh focus management", () => {
  it("captures a nearby explicit fallback and restores it only after the focused control disappears", async () => {
    const focusManagement = await import("./focus-management").catch(() => null);
    const captureRefreshFocus = focusManagement?.captureRefreshFocus;
    const restoreRefreshFocus = focusManagement?.restoreRefreshFocus;

    expect(captureRefreshFocus).toBeTypeOf("function");
    expect(restoreRefreshFocus).toBeTypeOf("function");
    if (!captureRefreshFocus || !restoreRefreshFocus) return;

    const focus = vi.fn();
    const scrollIntoView = vi.fn();
    const fallback = {
      focus,
      scrollIntoView,
      tabIndex: -1,
      dataset: {},
      classList: { add: vi.fn() },
    } as unknown as HTMLElement;
    const activeElement = {
      closest: vi.fn().mockReturnValue({ id: "richieste" }),
      focus: vi.fn(),
      isConnected: true,
    } as unknown as HTMLElement;
    const documentLike = {
      activeElement,
      getElementById: vi.fn().mockReturnValue(fallback),
    };

    const snapshot = captureRefreshFocus(documentLike);

    expect(snapshot).toEqual({ activeElement, fallbackId: "richieste" });
    expect(restoreRefreshFocus(snapshot, documentLike)).toBe(false);
    expect(focus).not.toHaveBeenCalled();

    Object.assign(activeElement, { isConnected: false });

    expect(restoreRefreshFocus(snapshot, documentLike)).toBe(true);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
  });

  it("does not invent a fallback when the focused control has no explicit refresh region", async () => {
    const focusManagement = await import("./focus-management").catch(() => null);
    const captureRefreshFocus = focusManagement?.captureRefreshFocus;

    expect(captureRefreshFocus).toBeTypeOf("function");
    if (!captureRefreshFocus) return;

    const activeElement = {
      closest: vi.fn().mockReturnValue(null),
      focus: vi.fn(),
      isConnected: true,
    } as unknown as HTMLElement;

    expect(captureRefreshFocus({ activeElement, getElementById: vi.fn() })).toBeNull();
  });

  it("can preserve a connected origin even when its surface has no fallback region", async () => {
    const { captureRefreshFocus } = await import("./focus-management");
    const activeElement = {
      closest: vi.fn().mockReturnValue(null),
      focus: vi.fn(),
      isConnected: true,
    } as unknown as HTMLElement;

    expect(captureRefreshFocus(
      { activeElement, getElementById: vi.fn() },
      undefined,
      { allowOriginOnly: true },
    )).toEqual({ activeElement, fallbackId: null });
  });

  it("restores the originating control when a pending state temporarily drops focus to the page", async () => {
    const { restoreRefreshFocus } = await import("./focus-management");
    const focus = vi.fn();
    const scrollIntoView = vi.fn();
    const origin = {
      focus,
      scrollIntoView,
      disabled: false,
      isConnected: true,
    } as unknown as HTMLElement;
    const body = { focus: vi.fn() } as unknown as HTMLElement;

    expect(restoreRefreshFocus(
      { activeElement: origin, fallbackId: "timeline" },
      { activeElement: body, body, getElementById: vi.fn() },
    )).toBe(true);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
  });

  it("does not override focus that another interaction already moved to a valid control", async () => {
    const { restoreRefreshFocus } = await import("./focus-management");
    const fallbackFocus = vi.fn();
    const origin = { focus: vi.fn(), isConnected: false } as unknown as HTMLElement;
    const alternative = { focus: vi.fn() } as unknown as HTMLElement;
    const body = { focus: vi.fn() } as unknown as HTMLElement;
    const fallback = {
      focus: fallbackFocus,
      scrollIntoView: vi.fn(),
      tabIndex: -1,
      dataset: {},
      classList: { add: vi.fn() },
    } as unknown as HTMLElement;

    expect(restoreRefreshFocus(
      { activeElement: origin, fallbackId: "timeline" },
      { activeElement: alternative, body, getElementById: vi.fn().mockReturnValue(fallback) },
    )).toBe(false);
    expect(fallbackFocus).not.toHaveBeenCalled();
  });

  it("moves focus without jumping and keeps the target inside its scroll container", async () => {
    const focusManagement = await import("./focus-management");
    const focus = vi.fn();
    const scrollIntoView = vi.fn();

    focusManagement.focusVisibleTarget({ focus, scrollIntoView } as unknown as HTMLElement);

    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
  });
});
