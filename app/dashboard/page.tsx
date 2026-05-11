"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Gamepad2, BarChart3, Plus, LogIn, User, ArrowRight, Swords, Clock } from "lucide-react";

interface DashboardData {
  points: number;
  wins: number;
  gamesPlayed: number;
  recentRooms: {
    id: string;
    name: string;
    status: string;
    createdAt: string;
  }[];
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardContent className="flex items-center gap-4 p-4 sm:p-6">
        <div className="w-12 h-12 bg-main border-2 border-border flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-xs sm:text-sm font-base text-muted-foreground">{label}</p>
          <p className="text-xl sm:text-2xl font-heading font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/api/dashboard").then((r) => r.data),
    enabled: !!user,
  });

  if (loading) {
    return (
      <main className="min-h-screen p-4 max-w-3xl mx-auto py-8">
        <div className="h-8 w-48 bg-muted border-2 border-border mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
          ))}
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen p-4 max-w-3xl mx-auto py-8 flex flex-col items-center justify-center gap-4">
        <Card className="w-full max-w-md text-center border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="pt-8 pb-6 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-main border-2 border-border flex items-center justify-center">
              <LogIn className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground font-base">
              Login dulu buat liat statistik kamu
            </p>
            <Button asChild size="lg">
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const winRate = data?.gamesPlayed ? Math.round((data.wins / data.gamesPlayed) * 100) : 0;

  const recentRooms = data?.recentRooms ?? [];

  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-main border-2 border-border flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold">Dashboard</h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-base">{user.username}</p>
          </div>
        </div>
        <Button asChild variant="neutral" size="sm">
          <Link href="/rooms">
            <Gamepad2 className="w-4 h-4" />
            Rooms
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={<Trophy className="w-6 h-6" />} label="Total Poin" value={data?.points ?? 0} />
          <StatCard icon={<Swords className="w-6 h-6" />} label="Kemenangan" value={data?.wins ?? 0} />
          <StatCard icon={<BarChart3 className="w-6 h-6" />} label="Win Rate" value={`${winRate}%`} />
        </div>
      )}

      {/* Quick Actions */}
      <Card className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6">
          <Button asChild className="flex-1" size="lg">
            <Link href="/rooms">
              <Plus className="w-5 h-5" />
              Buat Room Baru
            </Link>
          </Button>
          <Button asChild variant="neutral" className="flex-1" size="lg">
            <Link href="/rooms">
              <LogIn className="w-5 h-5" />
              Gabung Room
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Rooms */}
      <Card className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="border-b-2 border-border py-3 sm:py-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            Room Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          {recentRooms.length === 0 ? (
            <p className="text-sm text-muted-foreground font-base text-center py-6">
              Belum pernah main. Ayo buat room!
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {recentRooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/room/${room.id}`}
                  className="flex items-center justify-between border-2 border-border px-3 sm:px-4 py-2 sm:py-3 bg-secondary-background hover:bg-main/10 transition-colors"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-heading font-semibold text-sm sm:text-base truncate">{room.name}</span>
                    <div className="flex gap-2 items-center">
                      <span className={`text-[10px] sm:text-xs px-2 py-0.5 font-base font-semibold border-2 border-border ${
                        room.status === "waiting" ? "bg-green-100 text-green-800" :
                        room.status === "playing" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {room.status}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}