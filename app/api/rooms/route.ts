import { db } from "@/lib/db";
import { rooms, roomPlayers } from "@/lib/db/schema";
import { eq, count, desc } from "drizzle-orm";

export async function GET() {
  const publicRooms = await db
    .select({
      id: rooms.id,
      name: rooms.name,
      status: rooms.status,
      playerCount: count(roomPlayers.userId),
    })
    .from(rooms)
    .leftJoin(roomPlayers, eq(rooms.id, roomPlayers.roomId))
    .where(eq(rooms.isPublic, true))
    .groupBy(rooms.id)
    .orderBy(desc(rooms.createdAt))
    .limit(20);

  return Response.json(publicRooms);
}
