export interface UserDisplayNameInput {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  email?: string | null;
}

export function getUserDisplayName(user: UserDisplayNameInput) {
  const fullName = [user.firstName, user.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return fullName || user.username?.trim() || user.email?.trim() || "Utente";
}
