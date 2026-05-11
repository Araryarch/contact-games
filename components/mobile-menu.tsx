"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import MusicToggle from "@/components/music-toggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function MobileMenu({
  user,
}: {
  user: { name?: string | null; userId?: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="sm:hidden">
      <Button
        size="icon"
        variant="neutral"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Tutup menu" : "Buka menu"}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-50 border-b-2 border-border bg-secondary-background px-4 pb-4 pt-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <Button
                  key={link.href}
                  asChild
                  size="sm"
                  variant={isActive(link.href) ? "default" : "neutral"}
                  onClick={() => setOpen(false)}
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
              <hr className="border-t-2 border-border my-1" />
              <div className="flex items-center gap-2">
                <MusicToggle />
                {user ? (
                  <>
                    <span className="text-sm text-muted-foreground font-base">
                      {user.name ?? "player"}
                    </span>
                    <Button
                      size="sm"
                      variant="neutral"
                      onClick={() => {
                        setOpen(false);
                        signOut({ redirectTo: "/" });
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    asChild
                    size="sm"
                    onClick={() => setOpen(false)}
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}