"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { PlayerIdentity } from "@/lib/player-identity";

const STORAGE_KEY = "contact-games-guest";

function loadGuestFromStorage(): PlayerIdentity | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as PlayerIdentity;
      if (parsed.userId?.startsWith("guest-") && parsed.username) {
        return { ...parsed, isGuest: true };
      }
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

export function usePlayerIdentity() {
  const { user, loading } = useAuth();
  const [guest, setGuest] = useState<PlayerIdentity | null>(loadGuestFromStorage);

  const needsName = !loading && !user && !guest;

  const setGuestName = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 32);
    if (!trimmed) return;

    const identity: PlayerIdentity = {
      userId: `guest-${crypto.randomUUID()}`,
      username: trimmed,
      isGuest: true,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
    setGuest(identity);
  }, []);

  if (user) {
    return {
      player: { userId: user.userId, username: user.username, image: user.image, isGuest: false },
      loading: false,
      isAuthenticated: true,
      needsName: false,
      setGuestName,
    };
  }

  return {
    player: guest,
    loading,
    isAuthenticated: false,
    needsName,
    setGuestName,
  };
}
