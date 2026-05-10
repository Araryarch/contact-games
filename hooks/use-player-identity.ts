"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { createGuestIdentity, type PlayerIdentity } from "@/lib/player-identity";

const STORAGE_KEY = "contact-games-guest";

export function usePlayerIdentity() {
  const { user, loading } = useAuth();
  const [guest, setGuest] = useState<PlayerIdentity | null>(null);

  useEffect(() => {
    if (loading || user) return;

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PlayerIdentity;
        if (parsed.userId?.startsWith("guest-") && parsed.username) {
          setGuest({ ...parsed, isGuest: true });
          return;
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    const identity = createGuestIdentity();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
    setGuest(identity);
  }, [loading, user]);

  if (user) {
    return {
      player: { userId: user.userId, username: user.username, image: user.image, isGuest: false },
      loading: false,
      isAuthenticated: true,
    };
  }

  return {
    player: guest,
    loading,
    isAuthenticated: false,
  };
}
