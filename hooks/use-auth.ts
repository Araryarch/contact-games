import { useSession } from "next-auth/react";

export interface AuthUser {
  userId: string;
  username: string;
  image?: string | null;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const user: AuthUser | null = session?.user
    ? {
        userId: session.user.id!,
        username: session.user.name ?? "player",
        image: session.user.image,
      }
    : null;

  return { user, loading: status === "loading" };
}
