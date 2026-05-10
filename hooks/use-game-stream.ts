import { useEffect, useState } from "react";
import type { GameState } from "@/lib/game-store";
import type { PlayerIdentity } from "@/lib/player-identity";

export function useGameStream(roomId: string, player: PlayerIdentity | null) {
  const [game, setGame] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!player) return;

    const searchParams = new URLSearchParams();
    if (player.isGuest) {
      searchParams.set("guestId", player.userId);
      searchParams.set("guestName", player.username);
    }

    const url = searchParams.size > 0
      ? `/api/game/${roomId}/stream?${searchParams.toString()}`
      : `/api/game/${roomId}/stream`;
    const es = new EventSource(url);
    es.onmessage = (e) => setGame(JSON.parse(e.data));
    es.onerror = () => setError("Koneksi terputus. Refresh halaman.");
    return () => es.close();
  }, [player, roomId]);

  return { game, error };
}
