import {
  pgTable, text, integer, boolean, timestamp, primaryKey,
} from "drizzle-orm/pg-core";

// ── NextAuth required tables ──────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable("accounts", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (t) => [primaryKey({ columns: [t.identifier, t.token] })]);

// ── App tables ────────────────────────────────────────────────────────────────

export const rooms = pgTable("rooms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  hostId: text("host_id").notNull().references(() => users.id),
  isPublic: boolean("is_public").default(true).notNull(),
  status: text("status", { enum: ["waiting", "playing", "finished"] }).default("waiting").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const roomPlayers = pgTable("room_players", {
  roomId: text("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.roomId, t.userId] })]);

export const leaderboard = pgTable("leaderboard", {
  userId: text("user_id").primaryKey().references(() => users.id),
  points: integer("points").default(0).notNull(),
  wins: integer("wins").default(0).notNull(),
});
