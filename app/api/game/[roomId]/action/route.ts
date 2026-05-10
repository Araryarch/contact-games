import { auth } from "@/auth";
import { applyAction, type Action } from "@/lib/game-store";

export async function POST(
  req: Request,
  ctx: RouteContext<"/api/game/[roomId]/action">,
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { roomId } = await ctx.params;
  const action = (await req.json()) as Action;
  const result = applyAction(roomId, action);
  if (result.error) return Response.json({ error: result.error }, { status: 400 });
  return Response.json({ ok: true });
}
