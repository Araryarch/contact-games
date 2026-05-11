import { auth } from "@/auth";
import { db } from "@/lib/db";
import { leaderboard, rooms, roomPlayers } from "@/lib/db/schema";
import { eq, count, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [stats, gameCount, recentRooms] = await Promise.all([
    db.query.leaderboard.findFirst({ where: eq(leaderboard.userId, userId) }),
    db
      .select({ count: count() })
      .from(roomPlayers)
      .where(eq(roomPlayers.userId, userId))
      .then((r) => r[0]?.count ?? 0),
    db
      .select({
        id: rooms.id,
        name: rooms.name,
        status: rooms.status,
        createdAt: rooms.createdAt,
      })
      .from(rooms)
      .innerJoin(roomPlayers, eq(rooms.id, roomPlayers.roomId))
      .where(eq(roomPlayers.userId, userId))
      .orderBy(desc(rooms.createdAt))
      .limit(10),
  ]);

  return Response.json({
    points: stats?.points ?? 0,
    wins: stats?.wins ?? 0,
    gamesPlayed: gameCount,
    recentRooms,
  });
}