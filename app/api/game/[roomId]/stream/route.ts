import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rooms, roomPlayers } from "@/lib/db/schema";
import { getRoom, subscribe, addPlayer, createRoom } from "@/lib/game-store";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: RouteContext<"/api/game/[roomId]/stream">,
) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { roomId } = await ctx.params;
  const userId = session.user.id;
  const username = session.user.name ?? "player";

  let room = getRoom(roomId);
  if (!room) {
    const dbRoom = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
    if (!dbRoom) return new Response("Room not found", { status: 404 });
    room = createRoom(roomId, dbRoom.hostId);
  }

  await db.insert(roomPlayers).values({ roomId, userId }).onConflictDoNothing();
  addPlayer(roomId, { userId, username });
  await db.update(rooms).set({ status: "playing" }).where(eq(rooms.id, roomId));

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
