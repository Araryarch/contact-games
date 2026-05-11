import { cleanupExpiredRooms } from "@/lib/cleanup-rooms";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      await cleanupExpiredRooms();
    } catch (e) {
      console.error("cleanup error on startup", e);
    }

    setInterval(() => {
      cleanupExpiredRooms().catch((e) => console.error("cleanup error", e));
    }, 60 * 60 * 1000);
  }
}