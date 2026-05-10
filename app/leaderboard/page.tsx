import { db } from "@/lib/db";
import { leaderboard, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
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
    <main className="min-h-screen p-4 max-w-2xl mx-auto py-6 sm:py-8 flex flex-col gap-4 sm:gap-6">
      <h1 className="text-2xl sm:text-3xl font-heading font-bold flex items-center gap-2">
        <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />
        Leaderboard
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg sm:text-xl">Top Pemain</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-0 divide-y-2 divide-border">
          {rows.length === 0 && (
            <p className="py-4 text-center text-muted-foreground font-base text-xs sm:text-sm">
              Belum ada data. Jadilah yang pertama!
            </p>
          )}
          {rows.map((row, i) => (
            <div key={row.userId} className="flex items-center gap-3 sm:gap-4 py-3">
              <span className="w-6 sm:w-8 flex justify-center">
                {i < 3 ? (
                  <Medal className={`w-5 h-5 sm:w-6 sm:h-6 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
                ) : (
                  <span className="text-xs sm:text-sm font-base font-semibold text-muted-foreground">#{i + 1}</span>
                )}
              </span>
              {row.avatarUrl && (
                <img src={row.avatarUrl} alt="" className="w-6 h-6 sm:w-8 sm:h-8 rounded-none border-2 border-border" />
              )}
              <span className="flex-1 font-heading font-semibold text-sm sm:text-base truncate">{row.username}</span>
              <div className="flex gap-2 items-center">
                <Badge className="text-xs sm:text-sm">{row.points} pts</Badge>
                <span className="text-xs text-muted-foreground font-base hidden sm:inline">{row.wins} menang</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
