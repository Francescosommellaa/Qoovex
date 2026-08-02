function encodeSegment(value: string) { return encodeURIComponent(value); }
export function buildOrganizationInvitationPath(token: string) { return `/invite?token=${encodeSegment(token)}`; }
