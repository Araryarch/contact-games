import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rooms, roomPlayers } from "@/lib/db/schema";
import { getRoom, subscribe, addPlayer, createRoom } from "@/lib/game-store";
import { getGuestIdentityFromSearchParams } from "@/lib/player-identity";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: RouteContext<"/api/game/[roomId]/stream">,
) {
  const session = await auth();
  const url = new URL(req.url);
  const player = session?.user?.id
    ? { userId: session.user.id, username: session.user.name ?? "player", isGuest: false }
    : getGuestIdentityFromSearchParams(url.searchParams);
  if (!player) return new Response("Unauthorized", { status: 401 });

  const { roomId } = await ctx.params;
  const { userId, username } = player;

  let room = getRoom(roomId);
  if (!room) {
    const dbRoom = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
    if (!dbRoom) {
      console.log("Room not found in DB:", roomId);
      return new Response("Room not found", { status: 404 });
    }
    if (dbRoom.status === "finished") {
      console.log("Room finished:", roomId);
      return new Response("Room finished", { status: 404 });
    }
    room = createRoom(roomId, dbRoom.hostId);
  }
  if (room.phase === "won" || room.phase === "lost") {
    return new Response("Room finished", { status: 404 });
  }

  const canJoinAsPlayer = room.phase === "setup";
  if (canJoinAsPlayer) {
    if (!player.isGuest) {
      await db.insert(roomPlayers).values({ roomId, userId }).onConflictDoNothing();
    }
    addPlayer(roomId, { userId, username });
  }

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => controller.enqueue(`data: ${data}\n\n`);
      send(JSON.stringify(getRoom(roomId)));
      const unsub = subscribe(roomId, send);
      req.signal.addEventListener("abort", () => { unsub(); controller.close(); });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
