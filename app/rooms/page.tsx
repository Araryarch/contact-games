"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConfirmModal } from "@/components/confirm-modal";
import { useRooms, useCreateRoom, useDeleteRoom } from "@/hooks/use-rooms";
import { useAuth } from "@/hooks/use-auth";
import { Gamepad2 } from "lucide-react";

export default function RoomsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [roomName, setRoomName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);

  const { data: rooms = [], isLoading } = useRooms();
  const createRoom = useCreateRoom();
  const deleteRoom = useDeleteRoom();

  const statusColor: Record<string, string> = {
    waiting: "bg-green-100 text-green-800",
    playing: "bg-yellow-100 text-yellow-800",
    finished: "bg-gray-100 text-gray-600",
  };

  return (
    <main className="min-h-screen p-4 max-w-3xl mx-auto py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
          <Gamepad2 className="w-8 h-8" />
          Room
        </h1>
      </div>

      {/* Create Room */}
      <Card>
        <CardHeader className="pb-2 sm:pb-0">
          <CardTitle className="text-lg sm:text-xl font-heading">Buat Room Baru</CardTitle>
          {!loading && !user && (
            <CardDescription className="text-xs sm:text-sm">Login dulu kalau mau bikin room.</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:gap-3">
          {!user ? (
            <Button onClick={() => router.push("/login")} size="lg">
              Login untuk Buat Room
            </Button>
          ) : (
            <>
              <Input placeholder="Nama room (opsional)" value={roomName}
                className="text-sm sm:text-base"
                onChange={(e) => setRoomName(e.target.value)} />
              <label className="flex items-center gap-2 cursor-pointer font-base text-xs sm:text-sm">
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-4 h-4" />
                Room publik (tampil di daftar)
              </label>
              <Button onClick={() => createRoom.mutate({ name: roomName || undefined, isPublic })}
                disabled={createRoom.isPending} className="text-sm sm:text-base">
                {createRoom.isPending ? "Membuat..." : "Buat Room"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Join by code */}
      <Card>
        <CardHeader className="pb-2 sm:pb-0">
          <CardTitle className="text-lg sm:text-xl font-heading">Gabung dengan Kode</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Masukkan kode room dari temanmu</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2 flex-col sm:flex-row">
          <Input placeholder="Kode room..." value={joinCode}
            className="text-sm sm:text-base flex-1"
            onChange={(e) => setJoinCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && joinCode.trim() && router.push(`/room/${joinCode.trim()}`)} />
          <Button variant="neutral" onClick={() => joinCode.trim() && router.push(`/room/${joinCode.trim()}`)}
            className="shrink-0">
            Gabung
          </Button>
        </CardContent>
      </Card>

      {/* Public Rooms */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <h2 className="text-lg sm:text-xl font-heading font-semibold">Room Publik</h2>
        {isLoading && <p className="text-muted-foreground font-base text-xs sm:text-sm">Memuat...</p>}
        {!isLoading && rooms.length === 0 && (
          <p className="text-muted-foreground font-base text-xs sm:text-sm">Belum ada room publik. Buat yang pertama!</p>
        )}
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardContent className="pt-4 sm:pt-6 flex items-center justify-between gap-3 sm:gap-4 flex-col sm:flex-row">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <span className="font-heading font-semibold text-sm sm:text-base truncate">{room.name}</span>
                <div className="flex gap-2 items-center flex-wrap">
                  <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-none font-base font-semibold ${statusColor[room.status] ?? ""}`}>
                    {room.status}
                  </span>
                  <span className="text-xs text-muted-foreground font-base">{room.playerCount} pemain</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant={room.status === "finished" ? "neutral" : "default"}
                  onClick={() => router.push(`/room/${room.id}`)}>
                  {room.status === "finished" ? "Lihat" : "Gabung"}
                </Button>
                {user && room.hostId === user.userId && (
                  <Button size="sm" variant="destructive"
                    onClick={() => setDeleteRoomId(room.id)}>
                    Hapus
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteRoomId}
        title="Hapus Room"
        message="Yakin hapus room ini?"
        onConfirm={() => {
          if (deleteRoomId) {
            deleteRoom.mutate(deleteRoomId);
            setDeleteRoomId(null);
          }
        }}
        onCancel={() => setDeleteRoomId(null)}
      />
    </main>
  );
}
