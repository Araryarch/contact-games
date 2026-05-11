import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth(() => {
  const response = NextResponse.next();

  response.headers.set(
    "Content-Security-Policy",
    "frame-ancestors https://*.discord.com https://*.discordsays.com https://*.dis.gd https://*.discordapp.com;",
  );

  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
