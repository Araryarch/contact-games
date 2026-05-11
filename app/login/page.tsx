import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Type, GitBranch } from "lucide-react";

function DiscordIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  );
}

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/rooms");

  const hasDiscord = !!(
    process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET
  );

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary-background to-background">
      <div className="w-full max-w-md space-y-4">
        {/* Logo Card */}
        <Card className="text-center border-4">
          <CardContent className="pt-8 pb-6">
            <div className="w-20 h-20 bg-main border-2 border-border mx-auto flex items-center justify-center mb-4">
              <Type className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-heading font-bold mb-2">Contact!</h1>
            <p className="text-sm text-muted-foreground">Permainan Tebak Kata Multiplayer</p>
          </CardContent>
        </Card>

        {/* Login Card */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-heading">Selamat Datang</CardTitle>
            <CardDescription>Login untuk bermain dan masuk leaderboard global</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <form action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/rooms" });
            }}>
              <Button className="w-full" type="submit" size="lg">
                <GitBranch className="w-5 h-5" />
                Login dengan GitHub
              </Button>
            </form>

            {hasDiscord && (
              <form action={async () => {
                "use server";
                await signIn("discord", { redirectTo: "/rooms" });
              }}>
                <Button className="w-full" type="submit" size="lg" variant="neutral">
                  <DiscordIcon />
                  Login dengan Discord
                </Button>
              </form>
            )}

            <div className="pt-4 border-t-2 border-border">
              <p className="text-xs text-muted-foreground">
                Dengan login, kamu bisa:
              </p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>✓ Buat dan join room</li>
                <li>✓ Masuk leaderboard global</li>
                <li>✓ Track statistik permainan</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <p className="text-center text-xs text-muted-foreground">
          Belum punya akun?
        </p>
      </div>
    </main>
  );
}
