"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ConfirmModal } from "@/components/confirm-modal";
import { useGameStream } from "@/hooks/use-game-stream";
import { useGameAction } from "@/hooks/use-game-action";
import { usePlayerIdentity } from "@/hooks/use-player-identity";
import { Type, Shield, PartyPopper, CheckCircle, XCircle, Megaphone, MessageSquare, ClipboardList, Ban, Heart, Send, Users, Copy, Check, User, Eye, EyeOff, Clock } from "lucide-react";

function getHint(word: string, revealed: number) {
  return word.toUpperCase().split("").map((ch, i) => (i < revealed ? ch : "_")).join(" ");
}

/* ── Players Sidebar ─────────────────────────────────────────────────────────── */
function PlayersSidebar({ game, playerId }: { game: { players: { userId: string; username: string }[]; hostId: string }; playerId: string }) {
  const isPlayer = game.players.some((p) => p.userId === playerId);
  return (
    <Card className="h-full">
      <CardHeader className="border-b-2 border-border py-3 sm:py-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          Pemain ({game.players.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 sm:gap-2 py-3 sm:py-4 px-3 sm:px-4">
        {game.players.map((p) => (
          <div key={p.userId} className={`flex items-center gap-2 border-2 border-border px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-heading font-semibold ${p.userId === game.hostId ? "bg-main text-main-foreground" : "bg-secondary-background"}`}>
            {p.userId === game.hostId && <Shield className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />}
            <span className="truncate">{p.username}</span>
            {p.userId === playerId && <span className="ml-auto text-[10px] sm:text-xs opacity-60">(kamu)</span>}
          </div>
        ))}
        {!isPlayer && (
          <div className="border-2 border-dashed border-border px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-muted-foreground text-center">
            Spectator
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Chat Sidebar ────────────────────────────────────────────────────────────── */
function ChatSidebar({ chatMessages, player, onSend }: {
  chatMessages: { id: number; userId: string; username: string; text: string; createdAt: number }[];
  player: { userId: string; username: string };
  onSend: (text: string) => void;
}) {
  const [chatText, setChatText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  const sendChat = () => {
    const text = chatText.trim();
    if (!text) return;
    onSend(text);
    setChatText("");
  };

  return (
    <Card className="h-full flex flex-col gap-0 py-0">
      <CardHeader className="border-b-2 border-border py-3 sm:py-4 shrink-0">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex min-h-0 flex-1 flex-col gap-1 sm:gap-2 overflow-y-auto pr-1">
          {chatMessages.length === 0 ? (
            <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">Belum ada chat.</p>
          ) : (
            chatMessages.map((message) => (
              <div
                key={message.id}
                className={
                  message.userId === player.userId
                    ? "ml-2 sm:ml-4 border-2 border-border bg-main px-2 sm:px-3 py-1.5 sm:py-2 text-main-foreground"
                    : "mr-2 sm:mr-4 border-2 border-border bg-secondary-background px-2 sm:px-3 py-1.5 sm:py-2"
                }
              >
                <div className="mb-0.5 sm:mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-[10px] sm:text-xs font-heading font-bold">{message.username}</span>
                  <span className="shrink-0 text-[10px] opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="break-words text-xs sm:text-sm">{message.text}</p>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2 border-t-2 border-border pt-2 sm:pt-3 mt-2 shrink-0">
          <Input
            maxLength={240}
            placeholder="Tulis chat..."
            value={chatText}
            className="text-sm"
            onChange={(e) => setChatText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendChat(); }}
          />
          <Button type="button" size="icon" onClick={sendChat} aria-label="Kirim chat">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Room Code Copyable ──────────────────────────────────────────────────────── */
function RoomCode({ roomId }: { roomId: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="flex items-center gap-1.5 border-2 border-border bg-secondary-background px-2 py-1 text-xs font-mono hover:bg-main hover:text-main-foreground transition-colors">
      {roomId}
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────────── */
export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const { player, loading, needsName, setGuestName } = usePlayerIdentity();
  const { game, error } = useGameStream(roomId, player);
  const { mutate: act } = useGameAction(roomId, player);

  const [secretWord, setSecretWord] = useState("");
  const [showSecretWord, setShowSecretWord] = useState(false);
  const [clueText, setClueText] = useState("");
  const [guesserWord, setGuesserWord] = useState("");
  const [defenderGuess, setDefenderGuess] = useState("");
  const [contactGuesserWord, setContactGuesserWord] = useState("");
  const [contactDefenderWord, setContactDefenderWord] = useState("");
  const [guestNameInput, setGuestNameInput] = useState("");
  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Guest Name Prompt ──────────────────────────────────────────────────────
  if (needsName) return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-heading flex items-center gap-2">
            <User className="w-6 h-6" />
            Masukkan Nama
          </CardTitle>
          <CardDescription>Kamu belum login. Masukkan nama untuk bermain sebagai guest.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Nama kamu..."
            maxLength={32}
            value={guestNameInput}
            onChange={(e) => setGuestNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && guestNameInput.trim() && setGuestName(guestNameInput)}
            autoFocus
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={() => setGuestName(guestNameInput)} disabled={!guestNameInput.trim()}>
            Masuk Room
          </Button>
          <p className="text-xs text-muted-foreground text-center">Atau <a href="/login" className="underline font-semibold hover:text-foreground">login</a> untuk menyimpan skor.</p>
        </CardFooter>
      </Card>
    </main>
  );

  if (loading || !player) return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <p className="font-base">Menyiapkan pemain...</p>
    </main>
  );

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
  const isHost = game.hostId === player.userId;
  const isPlayer = game.players.some((p) => p.userId === player.userId);
  const hasVotedSurrender = game.surrenderVotes.includes(player.userId);

  const chatMessages = game.chatMessages ?? [];
  const sendChat = (text: string) => {
    act({ type: "send-chat", userId: player.userId, username: player.username, text });
  };

  // ── Setup ──────────────────────────────────────────────────────────────────
  if (game.phase === "setup") return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl sm:text-2xl font-heading flex items-center gap-2 flex-wrap">
            <Type className="w-5 h-5 sm:w-6 sm:h-6" />
            Room: <RoomCode roomId={roomId} />
          </CardTitle>
          <CardDescription className="text-sm">
            {isHost ? "Kamu adalah Defender." : "Menunggu Defender memulai..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="neutral" className="flex w-fit items-center gap-1 text-xs sm:text-sm mb-3">
            <Users className="w-3 h-3" />
            {game.players.length} pemain joined
          </Badge>
          <div className="flex flex-wrap gap-2">
          {game.players.map((p) => (
            <Badge key={p.userId} variant={p.userId === game.hostId ? "default" : "neutral"}>
                {p.userId === game.hostId && <Shield className="w-3 h-3" />}
                {p.username}
              </Badge>
            ))}
          </div>
        </CardContent>
        {isHost ? (
          <>
            <CardContent className="pt-2">
              <div className="relative">
                <Input
                  type={showSecretWord ? "text" : "password"}
                  placeholder="Kata rahasia..."
                  value={secretWord}
                  className="text-base sm:text-lg pr-12"
                  onChange={(e) => setSecretWord(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && game.players.length >= 3 && act({ type: "start", secretWord })}
                />
                <button
                  type="button"
                  onClick={() => setShowSecretWord(!showSecretWord)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showSecretWord ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 flex-col sm:flex-row">
              <Button className="flex-1" onClick={() => act({ type: "start", secretWord })}
                disabled={game.players.length < 3 || !secretWord.trim()}>
                {game.players.length < 3 ? `${3 - game.players.length} pemain lagi...` : "Mulai"}
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                Hapus Room
              </Button>
            </CardFooter>
          </>
        ) : null}
      </Card>
    </main>
  );

  // ── Won / Lost ─────────────────────────────────────────────────────────────
  if (game.phase === "won" || game.phase === "lost") return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-heading flex items-center justify-center gap-2 flex-wrap">
            {game.phase === "won" ? (
              <><PartyPopper className="w-6 h-6 sm:w-8 sm:h-8" />Penebak Menang!</>
            ) : (
              <><Shield className="w-6 h-6 sm:w-8 sm:h-8" />Defender Menang!</>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 items-center">
          <div className="text-xl sm:text-2xl md:text-3xl font-heading border-2 border-border bg-main text-main-foreground rounded-none px-4 py-3 sm:px-6 sm:py-4 shadow-shadow">
            {game.secretWord}
          </div>
          <div className="flex flex-wrap gap-2 justify-center max-w-full">
            {game.players.map((p) => (
              <Badge key={p.userId} variant={p.userId === game.hostId ? "default" : "neutral"} className="text-xs sm:text-sm">{p.username}</Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="justify-center gap-2 flex-wrap">
          <Link href="/rooms"><Button variant="neutral">Kembali</Button></Link>
        </CardFooter>
      </Card>
    </main>
  );

  // ── Result ─────────────────────────────────────────────────────────────────
  if (game.phase === "result") return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-heading flex items-center justify-center gap-2 flex-wrap">
            {game.resultMatch ? (<><CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />Contact Berhasil!</>) : (<><XCircle className="w-5 h-5 sm:w-6 sm:h-6" />Miss!</>)}
          </CardTitle>
          <CardDescription className="text-sm">{game.resultMatch ? "Kata cocok! Huruf baru terungkap." : "Kata tidak cocok."}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4 sm:gap-6 justify-center flex-wrap">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide">Penebak</span>
            <Badge className="text-sm sm:text-base">{game.contactGuesserWord}</Badge>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide">Defender</span>
            <Badge variant="neutral" className="text-sm sm:text-base">{game.contactDefenderWord}</Badge>
          </div>
        </CardContent>
        {!game.resultMatch && (
          <CardContent className="pt-0">
            <div className="flex justify-center">
              <Badge variant="neutral" className="flex items-center gap-1 text-xs sm:text-sm">
                <Heart className="w-3 h-3" />
                Sisa huruf: {game.secretWord.length - game.revealedLetters}
              </Badge>
            </div>
          </CardContent>
        )}
        {game.resultMatch && <CardContent><div className="text-xl sm:text-2xl font-heading tracking-widest">{hint}</div></CardContent>}
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
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-heading flex items-center gap-2">
              <Megaphone className="w-5 h-5 sm:w-6 sm:h-6" />CONTACT!
            </CardTitle>
            <CardDescription className="text-sm">Petunjuk: &ldquo;{activeClue?.clueText}&rdquo;<br />3... 2... 1...</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Kata Penebak</label>
              <Input placeholder="Kata penebak..." value={contactGuesserWord}
                className="text-base"
                onChange={(e) => setContactGuesserWord(e.target.value.toUpperCase())} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Kata Defender</label>
              <Input placeholder="Kata defender..." value={contactDefenderWord}
                className="text-base"
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
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader><CardTitle className="text-xl sm:text-2xl font-heading">Pengungkapan</CardTitle></CardHeader>
        <CardContent className="flex gap-4 sm:gap-6 justify-center flex-wrap">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide">Penebak</span>
            <div className="border-2 border-border bg-main text-main-foreground rounded-none px-3 py-2 sm:px-4 sm:py-2 shadow-shadow font-heading text-lg sm:text-xl">
              {game.contactGuesserWord}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide">Defender</span>
            <div className="border-2 border-border bg-secondary-background rounded-none px-3 py-2 sm:px-4 sm:py-2 shadow-shadow font-heading text-lg sm:text-xl">
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
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-heading flex items-center gap-2">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />Tebakan Defender
            </CardTitle>
            <CardDescription className="text-sm">Petunjuk: &ldquo;{activeClue?.clueText}&rdquo;</CardDescription>
          </CardHeader>
          <CardContent>
            <Input placeholder={`Kata berawalan ${game.secretWord[0]}...`} value={defenderGuess}
              className="text-base"
              onChange={(e) => setDefenderGuess(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && act({ type: "defender-guess", guess: defenderGuess })} />
          </CardContent>
          <CardFooter className="flex gap-2 flex-wrap sm:flex-nowrap">
            <Button className="flex-1 min-w-[80px]" onClick={() => { act({ type: "defender-guess", guess: defenderGuess }); setDefenderGuess(""); }}>
              Konfirmasi
            </Button>
            <Button variant="neutral" onClick={() => { act({ type: "defender-wrong" }); setDefenderGuess(""); }}>
              Salah
            </Button>
            <Button variant="neutral" onClick={() => { act({ type: "defender-ignore" }); setDefenderGuess(""); }}>
              Ignore
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  // ── Playing (3-column layout) ─────────────────────────────────────────────
  const pendingClues = game.clues.filter((c) => c.status === "pending" || c.status === "approved");
  const blockedClues = game.clues.filter((c) => c.status === "blocked");

  return (
    <main className="h-[calc(100vh-65px)] flex flex-col lg:flex-row gap-3 sm:gap-4 p-3 sm:p-4 overflow-hidden">
      {/* ── LEFT: Players ── */}
      <aside className="hidden lg:flex lg:w-56 xl:w-64 shrink-0">
        <PlayersSidebar game={game} playerId={player.userId} />
      </aside>

      {/* ── CENTER: Game Area ── */}
      <section className="flex-1 min-w-0 flex flex-col gap-3 sm:gap-4 overflow-y-auto pr-1">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 shrink-0">
          <h1 className="text-xl sm:text-2xl font-heading font-bold flex items-center gap-2">
            <Type className="w-5 h-5 sm:w-6 sm:h-6" />
            Contact!
          </h1>
          <RoomCode roomId={roomId} />
        </div>

        {/* Mobile: Players row */}
        <div className="flex flex-wrap gap-2 lg:hidden">
          {game.players.map((p) => (
            <Badge key={p.userId} variant={p.userId === game.hostId ? "default" : "neutral"} className="text-xs">
              {p.userId === game.hostId && <Shield className="w-3 h-3" />}
              {p.username}{p.userId === player.userId ? " (kamu)" : ""}
            </Badge>
          ))}
          {!isPlayer && <Badge variant="neutral" className="text-xs">Spectator</Badge>}
        </div>

        {/* Secret Word Card */}
        <Card className="shrink-0">
          <CardContent className="pt-4 sm:pt-6 flex flex-col items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Kata Rahasia</span>
            <div className="text-2xl sm:text-3xl md:text-4xl font-heading tracking-wider sm:tracking-[0.3em] font-bold">{hint}</div>
            <Badge className="text-xs sm:text-sm">{game.revealedLetters} / {game.secretWord.length} huruf</Badge>
          </CardContent>
        </Card>

        {/* Submit Clue (guessers only) */}
        {isPlayer && !isHost && (
          <Card className="shrink-0">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-base sm:text-lg font-heading flex items-center gap-2">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />Kirim Petunjuk
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Buat petunjuk untuk kata berawalan <strong>{game.secretWord[0]}</strong></CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 sm:gap-3">
              <Input placeholder="Deskripsi / petunjuk..." value={clueText} className="text-sm sm:text-base"
                onChange={(e) => setClueText(e.target.value)} />
              <Input placeholder={`Kata rahasiamu (berawalan ${game.secretWord[0]})...`}
                value={guesserWord} className="text-sm sm:text-base"
                onChange={(e) => setGuesserWord(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    act({ type: "submit-clue", userId: player.userId, guesserName: player.username, clueText, guesserWord });
                    setClueText(""); setGuesserWord("");
                  }
                }} />
            </CardContent>
            <CardFooter className="flex gap-2 flex-wrap">
              <Button className="flex-1 text-sm sm:text-base min-w-[100px]" onClick={() => {
                act({ type: "submit-clue", userId: player.userId, guesserName: player.username, clueText, guesserWord });
                setClueText(""); setGuesserWord("");
              }}>Kirim Petunjuk</Button>
              <Button
                variant={hasVotedSurrender ? "neutral" : "destructive"}
                size="sm"
                onClick={() => {
                  if (!hasVotedSurrender) {
                    setShowSurrenderConfirm(true);
                  }
                }}
                disabled={hasVotedSurrender}
              >
                {hasVotedSurrender ? `Surrender (${game.surrenderVotes.length}/${game.players.length})` : "Surrender"}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Pending Clues */}
        {pendingClues.length > 0 && (
          <div className="flex flex-col gap-2 sm:gap-3">
            <h2 className="text-base sm:text-lg font-heading font-semibold flex items-center gap-2">
              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />Petunjuk Aktif
            </h2>
            {pendingClues.map((clue) => {
              const elapsed = Math.floor((now - clue.createdAt) / 1000);
              const remaining = Math.max(0, game.clueTimeoutSeconds - elapsed);
              return (
              <Card key={clue.id}>
                <CardContent className="pt-4 sm:pt-6 flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{clue.guesserName}</span>
                    <p className="font-base text-sm sm:text-base">&ldquo;{clue.clueText}&rdquo;</p>
                    <Badge variant="neutral" className="w-fit text-xs">
                      {clue.status === "approved" ? "Bisa Contact" : "Menunggu Defender"}
                    </Badge>
                  </div>
                  {isPlayer && (
                    <div className="flex flex-col gap-2 shrink-0">
                      {isHost && clue.status === "pending" && (
                        <div className="flex flex-col gap-1">
                          <Button size="sm" variant="neutral" onClick={() => act({ type: "defender-block", clueId: clue.id })}>
                            <Shield className="w-4 h-4" />Blok
                          </Button>
                          <Button size="sm" variant="neutral" onClick={() => act({ type: "defender-ignore" })}>
                            <CheckCircle className="w-4 h-4" />Approve
                          </Button>
                        </div>
                      )}
                      {clue.status === "approved" && (
                        <Button size="sm" onClick={() => act({ type: "call-contact", clueId: clue.id })}>
                          <Megaphone className="w-4 h-4" />Contact!
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
                {clue.status === "pending" && (
                  <CardFooter className="pt-0 justify-end">
                    <Badge variant="neutral" className={`flex items-center gap-1 text-xs ${remaining <= 10 ? "text-red-500" : ""}`}>
                      <Clock className="w-3 h-3" />{remaining}s
                    </Badge>
                  </CardFooter>
                )}
              </Card>
              );
            })}
          </div>
        )}

        {/* Blocked Clues */}
        {blockedClues.length > 0 && (
          <div className="flex flex-col gap-2 sm:gap-3">
            <h2 className="text-base sm:text-lg font-heading font-semibold text-muted-foreground flex items-center gap-2">
              <Ban className="w-4 h-4 sm:w-5 sm:h-5" />Diblok
            </h2>
            {blockedClues.map((clue) => (
              <Card key={clue.id} className="opacity-60">
                <CardContent className="pt-4 sm:pt-6 flex items-center justify-between gap-3 sm:gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{clue.guesserName}</span>
                    <p className="font-base text-sm">&ldquo;{clue.clueText}&rdquo;</p>
                  </div>
                  <Badge variant="neutral" className="text-xs sm:text-sm">{clue.guesserWord}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ── RIGHT: Chat ── */}
      <aside className="lg:w-64 xl:w-80 shrink-0 h-48 sm:h-56 lg:h-auto">
        <ChatSidebar chatMessages={chatMessages} player={player} onSend={sendChat} />
      </aside>

      {/* ── Surrender Confirm Modal ── */}
      <ConfirmModal
        isOpen={showSurrenderConfirm}
        title="Vote Surrender"
        message="Yakin vote surrender? Defender akan menang."
        onConfirm={() => {
          act({ type: "surrender" });
          setShowSurrenderConfirm(false);
        }}
        onCancel={() => setShowSurrenderConfirm(false)}
      />

      {/* ── Delete Room Confirm Modal ── */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Hapus Room"
        message="Yakin hapus room ini? Semua pemain akan dikeluarkan."
        onConfirm={() => {
          act({ type: "delete" });
          setShowDeleteConfirm(false);
          router.push("/rooms");
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </main>
  );
}
