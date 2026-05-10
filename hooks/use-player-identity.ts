"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { PlayerIdentity } from "@/lib/player-identity";

const STORAGE_KEY = "contact-games-guest";

export function usePlayerIdentity() {
  const { user, loading } = useAuth();
  const [guest, setGuest] = useState<PlayerIdentity | null>(null);
  const [needsName, setNeedsName] = useState(false);

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

    // No stored guest — ask for name
    setNeedsName(true);
  }, [loading, user]);

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
    setNeedsName(false);
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
