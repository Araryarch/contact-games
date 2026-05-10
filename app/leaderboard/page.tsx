import Link from "next/link";
import { db } from "@/lib/db";
import { leaderboard, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const rows = await db
    .select({
      userId: leaderboard.userId,
      points: leaderboard.points,
      wins: leaderboard.wins,
      username: users.name,
      avatarUrl: users.image,
    })
    .from(leaderboard)
    .innerJoin(users, eq(leaderboard.userId, users.id))
    .orderBy(desc(leaderboard.points))
    .limit(50);

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
          <Trophy className="w-8 h-8" />
          Leaderboard
        </h1>
        <div className="flex gap-2">
          <Link href="/rooms"><Button size="sm">Main</Button></Link>
          <Link href="/"><Button variant="neutral" size="sm">Home</Button></Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Top Pemain</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-0 divide-y-2 divide-border">
          {rows.length === 0 && (
            <p className="py-4 text-center text-muted-foreground font-base text-sm">
              Belum ada data. Jadilah yang pertama!
            </p>
          )}
          {rows.map((row, i) => (
            <div key={row.userId} className="flex items-center gap-4 py-3">
              <span className="w-8 flex justify-center">
                {i < 3 ? (
                  <Medal className={`w-6 h-6 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
                ) : (
                  <span className="text-sm font-base font-semibold text-muted-foreground">#{i + 1}</span>
                )}
              </span>
              {row.avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.avatarUrl} alt="" className="w-8 h-8 rounded-none border-2 border-border" />
              )}
              <span className="flex-1 font-heading font-semibold">{row.username}</span>
              <div className="flex gap-2 items-center">
                <Badge>{row.points} pts</Badge>
                <span className="text-xs text-muted-foreground font-base">{row.wins} menang</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
