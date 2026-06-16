import "@testing-library/jest-dom/vitest";

import { afterEach } from "vitest";

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  configurable: true,
  value: () => null,
});

afterEach(() => {
  document.body.innerHTML = "";
});
