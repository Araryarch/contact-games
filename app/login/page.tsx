import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Type, GitHub } from "lucide-react";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/rooms");

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
          <CardContent className="space-y-4">
            <form action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/rooms" });
            }}>
              <Button className="w-full" type="submit" size="lg">
                <GitHub className="w-5 h-5" />
                Login dengan GitHub
              </Button>
            </form>
            
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
          Belum punya akun GitHub? <a href="https://github.com/signup" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Daftar di sini</a>
        </p>
      </div>
    </main>
  );
}
