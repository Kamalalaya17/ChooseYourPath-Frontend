// ChooseYourPath — username/password authentication for three separate areas.
//
// READER, WRITER and ADMIN accounts are created through different flows
// (reader/signup, writer/signup; admins exist only via the seeded admin or
// the admin panel). Passwords are hashed with bcrypt. Sessions are opaque
// tokens stored in the sessions table and sent as a Bearer token; `me`
// validates them per request. No email, no OTP anywhere.

import bcrypt from "bcryptjs";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function validateUsername(username: string): string | null {
  const name = username.trim();
  if (name.length < 3) return "Username must be at least 3 characters.";
  if (name.length > 30) return "Username must be at most 30 characters.";
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    return "Username may only contain letters, numbers and underscores.";
  }
  return null;
}

function validatePassword(password: string): string | null {
  if (password.length < 6) return "Password must be at least 6 characters.";
  if (password.length > 100) return "Password must be at most 100 characters.";
  return null;
}

export const register = mutation({
  args: {
    username: v.string(),
    password: v.string(),
    confirmPassword: v.string(),
    role: v.union(v.literal("READER"), v.literal("WRITER")),
  },
  handler: async (ctx, args) => {
    const username = args.username.trim();
    const err = validateUsername(username) ?? validatePassword(args.password);
    if (err) throw new Error(err);
    if (args.password !== args.confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q: any) => q.eq("username", username))
      .first();
    if (existing) throw new Error("That username is already taken.");

    const passwordHash = bcrypt.hashSync(args.password, 10);
    const userId = await ctx.db.insert("users", {
      username,
      passwordHash,
      role: args.role,
      createdAt: Date.now(),
    });

    const token = randomToken();
    await ctx.db.insert("sessions", {
      token,
      userId,
      expiresAt: Date.now() + SESSION_TTL_MS,
    });
    return { token, user: { _id: userId, username, role: args.role, bio: undefined } };
  },
});

export const login = mutation({
  args: {
    username: v.string(),
    password: v.string(),
    area: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const username = args.username.trim();
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q: any) => q.eq("username", username))
      .first();
    if (!user) throw new Error("Invalid username or password.");

    const ok = bcrypt.compareSync(args.password, user.passwordHash);
    if (!ok) throw new Error("Invalid username or password.");

    // An area-specific login only admits accounts belonging to that area.
    if (args.area && args.area !== user.role) {
      throw new Error(
        `This is a ${user.role.toLowerCase()} account. Please use the ${user.role.toLowerCase()} portal.`,
      );
    }

    const token = randomToken();
    await ctx.db.insert("sessions", {
      token,
      userId: user._id,
      expiresAt: Date.now() + SESSION_TTL_MS,
    });
    return {
      token,
      user: { _id: user._id, username: user.username, role: user.role, bio: user.bio },
    };
  },
});

export const me = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return null;
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token!))
      .first();
    if (!session || session.expiresAt < Date.now()) return null;
    const user = await ctx.db.get(session.userId);
    if (!user) return null;
    return { _id: user._id, username: user.username, role: user.role, bio: user.bio };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q: any) => q.eq("token", args.token))
      .first();
    if (session) await ctx.db.delete(session._id);
  },
});

export const updateProfile = mutation({
  args: { token: v.string(), bio: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q: any) => q.eq("token", args.token))
      .first();
    if (!session || session.expiresAt < Date.now()) throw new Error("Not signed in.");
    await ctx.db.patch(session.userId, { bio: args.bio.slice(0, 500) });
  },
});

// ---------------------------------------------------------------------------
// Internal helpers (called from other Convex modules via api refs)
// ---------------------------------------------------------------------------

export const requireRoleInternal = {
  /** Validate a session token and return { userId, role } or null. */
  async validate(ctx: any, token?: string) {
    if (!token) return null;
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q: any) => q.eq("token", token))
      .first();
    if (!session || session.expiresAt < Date.now()) return null;
    const user = await ctx.db.get(session.userId);
    if (!user) return null;
    return { userId: user._id as any, role: user.role as any, username: user.username as any };
  },
};
