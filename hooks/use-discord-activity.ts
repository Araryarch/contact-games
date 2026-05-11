"use client";

import { useEffect, useState, useCallback } from "react";
import type { PlayerIdentity } from "@/lib/player-identity";

interface DiscordAuth {
  userId: string;
  username: string;
  avatar: string | null;
}

export function useDiscordActivity() {
  const [auth, setAuth] = useState<DiscordAuth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { DiscordSDK } = await import("@discord/embedded-app-sdk");
        const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
        if (!clientId) {
          setLoading(false);
          return;
        }

        const discordSdk = new DiscordSDK(clientId);
        await discordSdk.ready();

        const { code } = await discordSdk.commands.authorize({
          client_id: clientId,
          response_type: "code",
          state: "",
          prompt: "none",
          scope: ["identify", "applications.commands"],
        });

        const response = await fetch("/.proxy/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const { access_token } = await response.json();

        const authResult = await discordSdk.commands.authenticate({ access_token });
        if (!cancelled) {
          setAuth({
            userId: authResult.user.id,
            username: authResult.user.username,
            avatar: authResult.user.avatar ?? null,
          });
        }
      } catch {
        // Not running inside Discord Activity
      }
      if (!cancelled) setLoading(false);
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const getPlayerIdentity = useCallback((): PlayerIdentity | null => {
    if (!auth) return null;
    return {
      userId: `discord-${auth.userId}`,
      username: auth.username,
      isGuest: false,
    };
  }, [auth]);

  return { auth, loading, getPlayerIdentity };
}