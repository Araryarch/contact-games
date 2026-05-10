import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export interface Room {
  id: string;
  name: string;
  status: string;
  playerCount: number;
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
