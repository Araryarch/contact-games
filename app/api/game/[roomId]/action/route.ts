import { auth } from "@/auth";
import { db } from "@/lib/db";
import { rooms } from "@/lib/db/schema";
import { applyAction, getRoom, type Action } from "@/lib/game-store";
import { getGuestIdentityFromHeaders } from "@/lib/player-identity";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  ctx: RouteContext<"/api/game/[roomId]/action">,
) {
  const session = await auth();
  const player = session?.user?.id
    ? { userId: session.user.id, username: session.user.name ?? "player", isGuest: false }
    : getGuestIdentityFromHeaders(new Headers(req.headers));
  if (!player) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { roomId } = await ctx.params;
  const action = (await req.json()) as Action;
  const room = getRoom(roomId);
  if (!room) return Response.json({ error: "Room not found" }, { status: 404 });
  const isPlayer = room.players.some((p) => p.userId === player.userId);
  const isHost = room.hostId === player.userId;
  if (action.type === "start" && !isHost) {
    return Response.json({ error: "Only host can start" }, { status: 403 });
  }
  if (action.type !== "send-chat" && !isPlayer) {
    return Response.json({ error: "Spectator hanya bisa chat" }, { status: 403 });
  }

  const normalizedAction =
    action.type === "submit-clue"
      ? { ...action, userId: player.userId, guesserName: player.username }
      : action.type === "send-chat"
        ? { ...action, userId: player.userId, username: player.username }
        : action;
  const result = applyAction(roomId, normalizedAction);
  if (result.error) return Response.json({ error: result.error }, { status: 400 });
  if (action.type === "start") {
    await db.update(rooms).set({ status: "playing" }).where(eq(rooms.id, roomId));
  }
  return Response.json({ ok: true });
}
