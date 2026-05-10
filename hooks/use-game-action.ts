import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Action } from "@/lib/game-store";

export function useGameAction(roomId: string) {
  return useMutation({
    mutationFn: (action: Action) =>
      api.post(`/api/game/${roomId}/action`, action).then((r) => r.data),
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Terjadi kesalahan";
      alert(msg);
    },
  });
}
