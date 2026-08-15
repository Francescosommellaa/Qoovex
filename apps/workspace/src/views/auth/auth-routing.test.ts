import { describe, expect, it } from "vitest";
import { isClientInvitationCallbackUrl, sanitizeCallbackUrl } from "./auth-routing";

describe("return path dell'invito cliente", () => {
  it("riconosce soltanto il percorso interno di un invito cliente", () => {
    expect(isClientInvitationCallbackUrl(sanitizeCallbackUrl("/client/invitations/token-riservato"))).toBe(true);
    expect(isClientInvitationCallbackUrl(sanitizeCallbackUrl("/client"))).toBe(false);
    expect(isClientInvitationCallbackUrl(sanitizeCallbackUrl("https://example.test/client/invitations/token"))).toBe(false);
  });
});
