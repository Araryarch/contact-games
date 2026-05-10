// lib/game-store.ts
export type Phase =
  | "setup"
  | "playing"
  | "defender-guess"
  | "contact-countdown"
  | "contact-reveal"
  | "result"
  | "won"
  | "lost";

export interface Player {
  userId: string;
  username: string;
  avatarUrl?: string | null;
}

export interface Clue {
  id: number;
  userId: string;
  guesserName: string;
  clueText: string;
  guesserWord: string;
  status: "pending" | "blocked" | "contact-called";
}

export interface GameState {
  roomId: string;
  hostId: string;
  secretWord: string;
  revealedLetters: number;
  clues: Clue[];
  players: Player[];
  phase: Phase;
  activeClueId: number | null;
  contactGuesserWord: string;
  contactDefenderWord: string;
  resultMatch: boolean | null;
  winner: "guessers" | "defender" | null;
  nextClueId: number;
}

type Subscriber = (data: string) => void;
type WinCallback = (roomId: string, winner: "guessers" | "defender", players: Player[]) => void;

const rooms = new Map<string, GameState>();
const subscribers = new Map<string, Set<Subscriber>>();
let onWin: WinCallback | null = null;

export function setWinCallback(cb: WinCallback) {
  onWin = cb;
}

export function getRoom(roomId: string): GameState | undefined {
  return rooms.get(roomId);
}

export function createRoom(roomId: string, hostId: string): GameState {
  const state: GameState = {
    roomId, hostId,
    secretWord: "", revealedLetters: 1,
    clues: [], players: [],
    phase: "setup", activeClueId: null,
    contactGuesserWord: "", contactDefenderWord: "",
    resultMatch: null, winner: null, nextClueId: 1,
  };
  rooms.set(roomId, state);
  subscribers.set(roomId, new Set());
  return state;
}

export function addPlayer(roomId: string, player: Player) {
  const g = rooms.get(roomId);
  if (!g) return;
  if (!g.players.find((p) => p.userId === player.userId)) {
    g.players.push(player);
    broadcast(roomId);
  }
}

export function subscribe(roomId: string, fn: Subscriber): () => void {
  if (!subscribers.has(roomId)) subscribers.set(roomId, new Set());
  subscribers.get(roomId)!.add(fn);
  return () => subscribers.get(roomId)?.delete(fn);
}

function broadcast(roomId: string) {
  const state = rooms.get(roomId);
  if (!state) return;
  const data = JSON.stringify(state);
  subscribers.get(roomId)?.forEach((fn) => fn(data));
}

function update(roomId: string, patch: Partial<GameState>) {
  const state = rooms.get(roomId);
  if (!state) return;
  Object.assign(state, patch);
  broadcast(roomId);
}

export type Action =
  | { type: "start"; secretWord: string }
  | { type: "submit-clue"; userId: string; guesserName: string; clueText: string; guesserWord: string }
  | { type: "defender-block"; clueId: number }
  | { type: "defender-guess"; guess: string }
  | { type: "defender-guess-cancel" }
  | { type: "call-contact"; clueId: number }
  | { type: "submit-contact-words"; guesserWord: string; defenderWord: string }
  | { type: "resolve-contact" }
  | { type: "continue" }
  | { type: "defender-wins" }
  | { type: "reset" };

export function applyAction(roomId: string, action: Action): { error?: string } {
  const g = rooms.get(roomId);
  if (!g) return { error: "Room not found" };

  switch (action.type) {
    case "start": {
      const word = action.secretWord.trim().toUpperCase();
      if (word.length < 2) return { error: "Kata terlalu pendek" };
      update(roomId, { secretWord: word, revealedLetters: 1, phase: "playing" });
      break;
    }
    case "submit-clue": {
      if (g.phase !== "playing") return { error: "Bukan fase bermain" };
      const word = action.guesserWord.trim().toUpperCase();
      if (!word.startsWith(g.secretWord[0]))
        return { error: `Kata harus berawalan "${g.secretWord[0]}"` };
      const clue: Clue = {
        id: g.nextClueId, userId: action.userId,
        guesserName: action.guesserName, clueText: action.clueText.trim(),
        guesserWord: word, status: "pending",
      };
      update(roomId, { clues: [...g.clues, clue], nextClueId: g.nextClueId + 1 });
      break;
    }
    case "defender-block": {
      if (g.phase !== "playing") return { error: "Bukan fase bermain" };
      update(roomId, { activeClueId: action.clueId, phase: "defender-guess" });
      break;
    }
    case "defender-guess": {
      if (g.phase !== "defender-guess") return { error: "Bukan fase tebak" };
      const clue = g.clues.find((c) => c.id === g.activeClueId);
      if (!clue) return { error: "Clue tidak ditemukan" };
      const guess = action.guess.trim().toUpperCase();
      if (guess === clue.guesserWord) {
        update(roomId, {
          clues: g.clues.map((c) => c.id === g.activeClueId ? { ...c, status: "blocked" } : c),
          phase: "playing", activeClueId: null,
        });
      } else {
        update(roomId, { phase: "playing", activeClueId: null });
      }
      break;
    }
    case "defender-guess-cancel":
      update(roomId, { phase: "playing", activeClueId: null });
      break;
    case "call-contact": {
      if (g.phase !== "playing") return { error: "Bukan fase bermain" };
      update(roomId, {
        activeClueId: action.clueId,
        clues: g.clues.map((c) => c.id === action.clueId ? { ...c, status: "contact-called" } : c),
        phase: "contact-countdown", contactGuesserWord: "", contactDefenderWord: "",
      });
      break;
    }
    case "submit-contact-words": {
      if (g.phase !== "contact-countdown") return { error: "Bukan fase contact" };
      update(roomId, {
        contactGuesserWord: action.guesserWord.trim().toUpperCase(),
        contactDefenderWord: action.defenderWord.trim().toUpperCase(),
        phase: "contact-reveal",
      });
      break;
    }
    case "resolve-contact": {
      if (g.phase !== "contact-reveal") return { error: "Bukan fase reveal" };
      const match = g.contactGuesserWord === g.contactDefenderWord;
      const blockedClues = g.clues.map((c) => c.id === g.activeClueId ? { ...c, status: "blocked" as const } : c);
      if (match) {
        const newRevealed = g.revealedLetters + 1;
        if (newRevealed >= g.secretWord.length) {
          update(roomId, { revealedLetters: newRevealed, resultMatch: true, phase: "won", winner: "guessers", clues: blockedClues });
          onWin?.(roomId, "guessers", g.players);
        } else {
          update(roomId, { revealedLetters: newRevealed, resultMatch: true, phase: "result", clues: blockedClues });
        }
      } else {
        update(roomId, { resultMatch: false, phase: "result", clues: blockedClues });
      }
      break;
    }
    case "continue":
      update(roomId, { phase: "playing", activeClueId: null });
      break;
    case "defender-wins":
      update(roomId, { phase: "lost", winner: "defender" });
      onWin?.(roomId, "defender", g.players);
      break;
    case "reset":
      update(roomId, {
        secretWord: "", revealedLetters: 1, clues: [], phase: "setup",
        activeClueId: null, contactGuesserWord: "", contactDefenderWord: "",
        resultMatch: null, winner: null, nextClueId: 1,
      });
      break;
    default:
      return { error: "Unknown action" };
  }
  return {};
}
