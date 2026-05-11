import { db } from "@/lib/db";
import { rooms } from "@/lib/db/schema";
import { lt } from "drizzle-orm";

export async function cleanupExpiredRooms() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  await db.delete(rooms).where(lt(rooms.createdAt, cutoff));
}