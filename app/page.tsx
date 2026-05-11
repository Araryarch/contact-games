import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Type, MessageSquare, Shield, Megaphone, CheckCircle, Trophy, Users, Zap, Globe } from "lucide-react";

const steps = [
  { icon: Type, title: "Defender pilih kata", desc: "Satu orang jadi Defender, pikirkan kata rahasia dan umumkan huruf pertamanya." },
  { icon: MessageSquare, title: "Penebak beri petunjuk", desc: "Pemain lain buat petunjuk untuk kata yang berawalan huruf yang sama." },
  { icon: Shield, title: "Defender blok", desc: "Defender bisa menebak kata yang dimaksud untuk memblok petunjuk tersebut." },
  { icon: Megaphone, title: "Teriak Contact!", desc: "Kalau dua penebak tahu kata yang sama, teriak Contact! dan hitung 3-2-1." },
  { icon: CheckCircle, title: "Cocok = huruf baru", desc: "Kalau kata mereka sama, Defender harus ungkap huruf berikutnya." },
  { icon: Trophy, title: "Menang!", desc: "Penebak menang kalau semua huruf terungkap. Defender menang kalau berhasil blok semua." },
];

const features = [
  { icon: Users, title: "Multiplayer Real-time", desc: "Main bareng teman dengan sistem real-time yang smooth" },
  { icon: Zap, title: "Fast & Responsive", desc: "UI yang cepat dan responsif di semua device" },
  { icon: Globe, title: "Public & Private Room", desc: "Buat room publik atau private sesuai kebutuhan" },
  { icon: Trophy, title: "Leaderboard Global", desc: "Kompetisi dengan pemain lain di leaderboard" },
];

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session;

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-16 gap-6 bg-gradient-to-b from-background to-secondary-background">
        <Badge className="text-sm px-4 py-1">Multiplayer Real-time</Badge>
        <h1 className="text-5xl sm:text-6xl font-heading font-bold max-w-2xl leading-tight">
          Permainan Tebak Kata yang Bikin Seru
        </h1>
        <p className="text-lg max-w-md text-muted-foreground font-base">
          Buat room, ajak teman, dan buktikan siapa yang paling jago kasih petunjuk kata!
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          {isLoggedIn
            ? <Link href="/rooms"><Button size="lg">Mulai Bermain</Button></Link>
            : <Link href="/login"><Button size="lg">Login & Bermain</Button></Link>}
          <Link href="/leaderboard"><Button variant="neutral" size="lg">Lihat Leaderboard</Button></Link>
        </div>
        
        {/* Stats */}
        <div className="flex gap-8 mt-8 flex-wrap justify-center">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-heading font-bold">Real-time</span>
            <span className="text-sm text-muted-foreground">Multiplayer</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-heading font-bold">∞</span>
            <span className="text-sm text-muted-foreground">Kata Tersedia</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-heading font-bold">2-8</span>
            <span className="text-sm text-muted-foreground">Pemain</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-bold mb-3">Kenapa Contact?</h2>
          <p className="text-muted-foreground">Fitur-fitur yang bikin game ini seru</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <Card key={i} className="hover:shadow-[6px_6px_0px_0px_#000] transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-main border-2 border-border flex items-center justify-center mb-2">
                  <f.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg font-heading">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-base text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How to play */}
      <section className="px-4 py-16 max-w-6xl mx-auto w-full bg-secondary-background">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-bold mb-3">Cara Bermain</h2>
          <p className="text-muted-foreground">Ikuti langkah-langkah ini untuk menang</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <Card key={i} className="relative hover:shadow-[6px_6px_0px_0px_#000] transition-all">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-main border-2 border-border flex items-center justify-center font-heading font-bold">
                {i + 1}
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-heading flex items-center gap-2">
                  <s.icon className="w-5 h-5" />
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

      {/* CTA */}
      <section className="px-4 py-20 text-center bg-main border-t-2 border-b-2 border-border">
        <h2 className="text-4xl font-heading font-bold mb-4">Siap Bermain?</h2>
        <p className="text-lg mb-8 max-w-md mx-auto">
          Gabung sekarang dan buktikan kemampuanmu dalam permainan kata!
        </p>
        {isLoggedIn
          ? <Link href="/rooms"><Button size="lg" variant="neutral">Buka Room Sekarang</Button></Link>
          : <Link href="/login"><Button size="lg" variant="neutral">Login & Mulai</Button></Link>}
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-border bg-secondary-background px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            <span className="font-heading font-bold">Contact!</span>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link>
            <Link href="/rooms" className="hover:text-foreground transition-colors">Rooms</Link>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 Contact Game</p>
        </div>
      </footer>
    </main>
  );
}
