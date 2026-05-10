import { useEffect, useState } from "react";
import type { GameState } from "@/lib/game-store";

export function useGameStream(roomId: string) {
  const [game, setGame] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const es = new EventSource(`/api/game/${roomId}/stream`);
    es.onmessage = (e) => setGame(JSON.parse(e.data));
    es.onerror = () => setError("Koneksi terputus. Refresh halaman.");
    return () => es.close();
  }, [roomId]);

  return { game, error };
}
