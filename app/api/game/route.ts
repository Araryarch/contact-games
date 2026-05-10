import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rooms, roomPlayers } from "@/lib/db/schema";
import { createRoom, addPlayer, setWinCallback } from "@/lib/game-store";
import { leaderboard } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

setWinCallback(async (roomId, winner, players) => {
  try {
    await db.update(rooms).set({ status: "finished" }).where(eq(rooms.id, roomId));
    const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
    if (!room) return;
    const winnerIds = winner === "defender"
      ? [room.hostId]
      : players.filter((p) => p.userId !== room.hostId).map((p) => p.userId);
    for (const userId of winnerIds) {
      await db.update(leaderboard)
        .set({ points: sql`${leaderboard.points} + 20`, wins: sql`${leaderboard.wins} + 1` })
        .where(eq(leaderboard.userId, userId));
    }
  } catch (e) {
    console.error("win callback error", e);
  }
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const username = session.user.name ?? "player";

  const body = await req.json().catch(() => ({}));
  const name = (body.name as string | undefined)?.trim() || `${username}'s room`;
  const isPublic = body.isPublic !== false;

  const roomId = nanoid(8);
  await db.insert(rooms).values({ id: roomId, name, hostId: userId, isPublic, status: "waiting" });
  await db.insert(roomPlayers).values({ roomId, userId }).onConflictDoNothing();

  createRoom(roomId, userId);
  addPlayer(roomId, { userId, username });

  return Response.json({ roomId });
}
