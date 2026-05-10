export interface PlayerIdentity {
  userId: string;
  username: string;
  isGuest: boolean;
}

function sanitizeUsername(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 32);
}

export function createGuestIdentity(seed?: string): PlayerIdentity {
  const suffix = seed?.slice(-4).toUpperCase() ?? "GUEST";
  const userId = seed?.startsWith("guest-") ? seed : `guest-${seed ?? crypto.randomUUID()}`;

  return {
    userId,
    username: `Guest ${suffix}`,
    isGuest: true,
  };
}

export function getGuestIdentityFromHeaders(headers: Headers): PlayerIdentity | null {
  const guestId = headers.get("x-guest-id");
  if (!guestId?.startsWith("guest-")) return null;

  const guestName = sanitizeUsername(headers.get("x-guest-name"));
  const fallback = createGuestIdentity(guestId);

  return {
    userId: guestId,
    username: guestName ?? fallback.username,
    isGuest: true,
  };
}

export function getGuestIdentityFromSearchParams(searchParams: URLSearchParams): PlayerIdentity | null {
  const guestId = searchParams.get("guestId");
  if (!guestId?.startsWith("guest-")) return null;

  const guestName = sanitizeUsername(searchParams.get("guestName"));
  const fallback = createGuestIdentity(guestId);

  return {
    userId: guestId,
    username: guestName ?? fallback.username,
    isGuest: true,
  };
}
