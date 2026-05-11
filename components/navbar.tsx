import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavbarLinks from "@/components/navbar-links";
import MobileMenu from "@/components/mobile-menu";
import MusicToggle from "@/components/music-toggle";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-border bg-secondary-background/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-heading font-bold"
          >
            <Type className="h-5 w-5" />
            Contact!
          </Link>
        </div>

        <div className="hidden sm:block">
          <NavbarLinks />
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <MusicToggle />
          {session?.user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {session.user.name ?? "player"}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" size="sm" variant="neutral">
                  Logout
                </Button>
              </form>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>

        <MobileMenu
          user={
            session?.user
              ? { name: session.user.name, userId: session.user.id }
              : null
          }
        />
      </div>
    </nav>
  );
}
