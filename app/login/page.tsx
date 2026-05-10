import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Type } from "lucide-react";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/rooms");

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-heading flex items-center justify-center gap-2">
            <Type className="w-8 h-8" />
            Contact!
          </CardTitle>
          <CardDescription>Login untuk bermain dan masuk leaderboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/rooms" });
          }}>
            <Button className="w-full" type="submit">Login dengan GitHub</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
