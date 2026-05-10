import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Action } from "@/lib/game-store";
import type { PlayerIdentity } from "@/lib/player-identity";

export function useGameAction(roomId: string, player: PlayerIdentity | null) {
  return useMutation({
    mutationFn: (action: Action) =>
      api.post(`/api/game/${roomId}/action`, action, {
        headers: player?.isGuest
          ? {
              "x-guest-id": player.userId,
              "x-guest-name": player.username,
            }
          : undefined,
      }).then((r) => r.data),
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Terjadi kesalahan";
      alert(msg);
    },
  });
}
