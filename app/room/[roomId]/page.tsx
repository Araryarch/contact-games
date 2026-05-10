"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useGameStream } from "@/hooks/use-game-stream";
import { useGameAction } from "@/hooks/use-game-action";
import { useAuth } from "@/hooks/use-auth";
import { Type, Shield, PartyPopper, CheckCircle, XCircle, Megaphone, MessageSquare, ClipboardList, Ban, Trophy } from "lucide-react";

function getHint(word: string, revealed: number) {
  return word.toUpperCase().split("").map((ch, i) => (i < revealed ? ch : "_")).join(" ");
}

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { game, error } = useGameStream(roomId);
  const { mutate: act } = useGameAction(roomId);

  const [secretWord, setSecretWord] = useState("");
  const [clueText, setClueText] = useState("");
  const [guesserWord, setGuesserWord] = useState("");
  const [defenderGuess, setDefenderGuess] = useState("");
  const [contactGuesserWord, setContactGuesserWord] = useState("");
  const [contactDefenderWord, setContactDefenderWord] = useState("");

  if (!user) return null; // proxy handles redirect

  if (error) return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardContent className="pt-6"><p className="text-red-600 font-base">{error}</p></CardContent>
      </Card>
    </main>
  );

  if (!game) return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <p className="font-base">Menghubungkan...</p>
    </main>
  );

  const hint = game.secretWord ? getHint(game.secretWord, game.revealedLetters) : "";
  const isHost = game.hostId === user.userId;

  // ── Setup ──────────────────────────────────────────────────────────────────
  if (game.phase === "setup") return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-heading flex items-center gap-2">
            <Type className="w-6 h-6" />
            Room: <span className="font-mono">{roomId}</span>
          </CardTitle>
          <CardDescription>
            {isHost ? "Kamu adalah Defender. Masukkan kata rahasia." : "Menunggu Defender memulai..."}
          </CardDescription>
        </CardHeader>
        {isHost ? (
          <>
            <CardContent>
              <Input type="password" placeholder="Kata rahasia..." value={secretWord}
                onChange={(e) => setSecretWord(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && act({ type: "start", secretWord })} />
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => act({ type: "start", secretWord })}>Mulai</Button>
            </CardFooter>
          </>
        ) : (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {game.players.map((p) => (
                <Badge key={p.userId} variant={p.userId === game.hostId ? "default" : "neutral"}>
                  {p.userId === game.hostId && <Shield className="w-3 h-3" />}
                  {p.username}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </main>
  );

  // ── Won / Lost ─────────────────────────────────────────────────────────────
  if (game.phase === "won" || game.phase === "lost") return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-heading flex items-center justify-center gap-2">
            {game.phase === "won" ? (
              <>
                <PartyPopper className="w-8 h-8" />
                Penebak Menang!
              </>
            ) : (
              <>
                <Shield className="w-8 h-8" />
                Defender Menang!
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 items-center">
          <div className="text-2xl font-heading border-2 border-border bg-main text-main-foreground rounded-none px-6 py-4 shadow-shadow">
            {game.secretWord}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {game.players.map((p) => (
              <Badge key={p.userId} variant={p.userId === game.hostId ? "default" : "neutral"}>{p.username}</Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="justify-center gap-2">
          {isHost && <Button onClick={() => act({ type: "reset" })}>Main Lagi</Button>}
          <Link href="/rooms"><Button variant="neutral">Kembali</Button></Link>
        </CardFooter>
      </Card>
    </main>
  );

  // ── Result ─────────────────────────────────────────────────────────────────
  if (game.phase === "result") return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-heading flex items-center justify-center gap-2">
            {game.resultMatch ? (
              <>
                <CheckCircle className="w-6 h-6" />
                Contact Berhasil!
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6" />
                Miss!
              </>
            )}
          </CardTitle>
          <CardDescription>{game.resultMatch ? "Kata cocok! Huruf baru terungkap." : "Kata tidak cocok."}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-6 justify-center">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide">Penebak</span>
            <Badge>{game.contactGuesserWord}</Badge>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide">Defender</span>
            <Badge variant="neutral">{game.contactDefenderWord}</Badge>
          </div>
        </CardContent>
        {game.resultMatch && <CardContent><div className="text-2xl font-heading tracking-widest">{hint}</div></CardContent>}
        <CardFooter className="justify-center">
          <Button onClick={() => act({ type: "continue" })}>Lanjutkan</Button>
        </CardFooter>
      </Card>
    </main>
  );

  // ── Contact Countdown ──────────────────────────────────────────────────────
  if (game.phase === "contact-countdown") {
    const activeClue = game.clues.find((c) => c.id === game.activeClueId);
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-heading flex items-center gap-2">
              <Megaphone className="w-6 h-6" />
              CONTACT!
            </CardTitle>
            <CardDescription>Petunjuk: &ldquo;{activeClue?.clueText}&rdquo;<br />3... 2... 1...</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Kata Penebak</label>
              <Input placeholder="Kata penebak..." value={contactGuesserWord}
                onChange={(e) => setContactGuesserWord(e.target.value.toUpperCase())} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Kata Defender</label>
              <Input placeholder="Kata defender..." value={contactDefenderWord}
                onChange={(e) => setContactDefenderWord(e.target.value.toUpperCase())} />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => {
              act({ type: "submit-contact-words", guesserWord: contactGuesserWord, defenderWord: contactDefenderWord });
              setContactGuesserWord(""); setContactDefenderWord("");
            }}>Ungkap Kata</Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  // ── Contact Reveal ─────────────────────────────────────────────────────────
  if (game.phase === "contact-reveal") return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader><CardTitle className="text-2xl font-heading">Pengungkapan</CardTitle></CardHeader>
        <CardContent className="flex gap-6 justify-center">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-wide">Penebak</span>
            <div className="border-2 border-border bg-main text-main-foreground rounded-none px-4 py-2 shadow-shadow font-heading text-xl">
              {game.contactGuesserWord}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-wide">Defender</span>
            <div className="border-2 border-border bg-secondary-background rounded-none px-4 py-2 shadow-shadow font-heading text-xl">
              {game.contactDefenderWord}
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={() => act({ type: "resolve-contact" })}>Lihat Hasil</Button>
        </CardFooter>
      </Card>
    </main>
  );

  // ── Defender Guess ─────────────────────────────────────────────────────────
  if (game.phase === "defender-guess") {
    const activeClue = game.clues.find((c) => c.id === game.activeClueId);
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-heading flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Tebakan Defender
            </CardTitle>
            <CardDescription>Petunjuk: &ldquo;{activeClue?.clueText}&rdquo;</CardDescription>
          </CardHeader>
          <CardContent>
            <Input placeholder={`Kata berawalan ${game.secretWord[0]}...`} value={defenderGuess}
              onChange={(e) => setDefenderGuess(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && act({ type: "defender-guess", guess: defenderGuess })} />
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button className="flex-1" onClick={() => { act({ type: "defender-guess", guess: defenderGuess }); setDefenderGuess(""); }}>
              Konfirmasi
            </Button>
            <Button variant="neutral" onClick={() => act({ type: "defender-guess-cancel" })}>Batal</Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  // ── Playing ────────────────────────────────────────────────────────────────
  const pendingClues = game.clues.filter((c) => c.status === "pending");
  const blockedClues = game.clues.filter((c) => c.status === "blocked");

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto flex flex-col gap-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <Type className="w-6 h-6" />
          Contact!
        </h1>
        <div className="flex items-center gap-2">
          <Badge variant="neutral" className="font-mono text-xs">{roomId}</Badge>
          <Link href="/rooms"><Button variant="neutral" size="sm">Rooms</Button></Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {game.players.map((p) => (
          <Badge key={p.userId} variant={p.userId === game.hostId ? "default" : "neutral"}>
            {p.userId === game.hostId && <Shield className="w-3 h-3" />}
            {p.username}{p.userId === user.userId ? " (kamu)" : ""}
          </Badge>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Kata Rahasia</span>
          <div className="text-4xl font-heading tracking-[0.3em] font-bold">{hint}</div>
          <Badge>{game.revealedLetters} / {game.secretWord.length} huruf</Badge>
        </CardContent>
      </Card>

      {!isHost && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Kirim Petunjuk
            </CardTitle>
            <CardDescription>Buat petunjuk untuk kata berawalan <strong>{game.secretWord[0]}</strong></CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Input placeholder="Deskripsi / petunjuk..." value={clueText} onChange={(e) => setClueText(e.target.value)} />
            <Input placeholder={`Kata rahasiamu (berawalan ${game.secretWord[0]})...`}
              value={guesserWord} onChange={(e) => setGuesserWord(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  act({ type: "submit-clue", userId: user.userId, guesserName: user.username, clueText, guesserWord });
                  setClueText(""); setGuesserWord("");
                }
              }} />
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => {
              act({ type: "submit-clue", userId: user.userId, guesserName: user.username, clueText, guesserWord });
              setClueText(""); setGuesserWord("");
            }}>Kirim Petunjuk</Button>
          </CardFooter>
        </Card>
      )}

      {pendingClues.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Petunjuk Aktif
          </h2>
          {pendingClues.map((clue) => (
            <Card key={clue.id}>
              <CardContent className="pt-6 flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{clue.guesserName}</span>
                  <p className="font-base">&ldquo;{clue.clueText}&rdquo;</p>
                  <Badge variant="neutral" className="w-fit text-xs">Kata tersembunyi</Badge>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {isHost && (
                    <Button size="sm" variant="neutral" onClick={() => act({ type: "defender-block", clueId: clue.id })}>
                      <Shield className="w-4 h-4" />
                      Blok
                    </Button>
                  )}
                  <Button size="sm" onClick={() => act({ type: "call-contact", clueId: clue.id })}>
                    <Megaphone className="w-4 h-4" />
                    Contact!
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {blockedClues.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-heading font-semibold text-muted-foreground flex items-center gap-2">
            <Ban className="w-5 h-5" />
            Diblok
          </h2>
          {blockedClues.map((clue) => (
            <Card key={clue.id} className="opacity-60">
              <CardContent className="pt-6 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{clue.guesserName}</span>
                  <p className="font-base text-sm">&ldquo;{clue.clueText}&rdquo;</p>
                </div>
                <Badge variant="neutral">{clue.guesserWord}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isHost && (
        <div className="mt-auto pt-4 border-t-2 border-border">
          <Button variant="neutral" className="w-full" onClick={() => act({ type: "defender-wins" })}>
            <Trophy className="w-4 h-4" />
            Defender Menang
          </Button>
        </div>
      )}
    </main>
  );
}
