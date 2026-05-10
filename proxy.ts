import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const { proxy } = {
  proxy: auth((req) => {
    const { pathname } = req.nextUrl;
    if (
      (pathname.startsWith("/room") || pathname.startsWith("/leaderboard")) &&
      !req.auth
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }),
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
