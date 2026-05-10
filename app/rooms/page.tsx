"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRooms, useCreateRoom } from "@/hooks/use-rooms";
import { Gamepad2 } from "lucide-react";

export default function RoomsPage() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [joinCode, setJoinCode] = useState("");

  const { data: rooms = [], isLoading } = useRooms();
  const createRoom = useCreateRoom();

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
        <div className="flex gap-2">
          <Link href="/leaderboard"><Button variant="neutral" size="sm">Leaderboard</Button></Link>
          <Link href="/"><Button variant="neutral" size="sm">Home</Button></Link>
        </div>
      </div>

      {/* Create Room */}
      <Card>
        <CardHeader><CardTitle className="font-heading">Buat Room Baru</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input placeholder="Nama room (opsional)" value={roomName}
            onChange={(e) => setRoomName(e.target.value)} />
          <label className="flex items-center gap-2 cursor-pointer font-base text-sm">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-4 h-4" />
            Room publik (tampil di daftar)
          </label>
          <Button onClick={() => createRoom.mutate({ name: roomName || undefined, isPublic })}
            disabled={createRoom.isPending}>
            {createRoom.isPending ? "Membuat..." : "Buat Room"}
          </Button>
        </CardContent>
      </Card>

      {/* Join by code */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Gabung dengan Kode</CardTitle>
          <CardDescription>Masukkan kode room dari temanmu</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="Kode room..." value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && joinCode.trim() && router.push(`/room/${joinCode.trim()}`)} />
          <Button variant="neutral" onClick={() => joinCode.trim() && router.push(`/room/${joinCode.trim()}`)}>
            Gabung
          </Button>
        </CardContent>
      </Card>

      {/* Public Rooms */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-heading font-semibold">Room Publik</h2>
        {isLoading && <p className="text-muted-foreground font-base text-sm">Memuat...</p>}
        {!isLoading && rooms.length === 0 && (
          <p className="text-muted-foreground font-base text-sm">Belum ada room publik. Buat yang pertama!</p>
        )}
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardContent className="pt-6 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-heading font-semibold">{room.name}</span>
                <div className="flex gap-2 items-center">
                  <span className={`text-xs px-2 py-0.5 rounded-none font-base font-semibold ${statusColor[room.status] ?? ""}`}>
                    {room.status}
                  </span>
                  <span className="text-xs text-muted-foreground font-base">{room.playerCount} pemain</span>
                </div>
              </div>
              <Button size="sm" variant={room.status === "finished" ? "neutral" : "default"}
                onClick={() => router.push(`/room/${room.id}`)}>
                {room.status === "finished" ? "Lihat" : "Gabung"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
