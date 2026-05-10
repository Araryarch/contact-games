import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Type, MessageSquare, Shield, Megaphone, CheckCircle, Trophy } from "lucide-react";

const steps = [
  { icon: Type, title: "Defender pilih kata", desc: "Satu orang jadi Defender, pikirkan kata rahasia dan umumkan huruf pertamanya." },
  { icon: MessageSquare, title: "Penebak beri petunjuk", desc: "Pemain lain buat petunjuk untuk kata yang berawalan huruf yang sama." },
  { icon: Shield, title: "Defender blok", desc: "Defender bisa menebak kata yang dimaksud untuk memblok petunjuk tersebut." },
  { icon: Megaphone, title: "Teriak Contact!", desc: "Kalau dua penebak tahu kata yang sama, teriak Contact! dan hitung 3-2-1." },
  { icon: CheckCircle, title: "Cocok = huruf baru", desc: "Kalau kata mereka sama, Defender harus ungkap huruf berikutnya." },
  { icon: Trophy, title: "Menang!", desc: "Penebak menang kalau semua huruf terungkap. Defender menang kalau berhasil blok semua." },
];

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session;

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b-2 border-border bg-secondary-background px-6 py-3 flex items-center justify-between">
        <span className="text-xl font-heading font-bold flex items-center gap-2">
          <Type className="w-5 h-5" />
          Contact!
        </span>
        <div className="flex gap-2">
          <Link href="/leaderboard"><Button variant="neutral" size="sm">Leaderboard</Button></Link>
          {isLoggedIn
            ? <Link href="/rooms"><Button size="sm">Buka Room</Button></Link>
            : <Link href="/login"><Button size="sm">Login</Button></Link>}
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-20 gap-6">
        <Badge className="text-sm px-4 py-1">Multiplayer Real-time</Badge>
        <h1 className="text-5xl font-heading font-bold max-w-xl leading-tight">
          Permainan Tebak Kata yang Bikin Seru
        </h1>
        <p className="text-lg max-w-md text-muted-foreground font-base">
          Buat room, ajak teman, dan buktikan siapa yang paling jago kasih petunjuk kata!
        </p>
        <div className="flex gap-3">
          {isLoggedIn
            ? <Link href="/rooms"><Button size="lg">Mulai Bermain</Button></Link>
            : <Link href="/login"><Button size="lg">Login & Bermain</Button></Link>}
          <Link href="/leaderboard"><Button variant="neutral" size="lg">Lihat Leaderboard</Button></Link>
        </div>
      </section>

      {/* How to play */}
      <section className="px-4 py-16 max-w-4xl mx-auto w-full">
        <h2 className="text-3xl font-heading font-bold text-center mb-10">Cara Bermain</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-2xl font-heading flex items-center gap-2">
                  <s.icon className="w-6 h-6" />
                  {s.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-base text-sm text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
