import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export interface Room {
  id: string;
  name: string;
  status: string;
  playerCount: number;
  hostId: string;
}

export function useRooms() {
  return useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: () => api.get("/api/rooms").then((r) => r.data),
    refetchInterval: 10_000,
  });
}

export function useCreateRoom() {
  const router = useRouter();
  return useMutation({
    mutationFn: (body: { name?: string; isPublic?: boolean }) =>
      api.post<{ roomId: string }>("/api/game", body).then((r) => r.data),
    onSuccess: ({ roomId }) => router.push(`/room/${roomId}`),
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) =>
      api.post("/api/game/" + roomId + "/action", { type: "delete" }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Gagal hapus room";
      alert(msg);
    },
  });
}
