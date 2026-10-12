// Shared session validation used by all guarded Convex functions.
import type { Id } from "./_generated/dataModel";

export type SessionInfo = {
  userId: Id<"users">;
  role: "READER" | "WRITER" | "ADMIN";
  username: string;
};

export async function validateToken(ctx: any, token?: string): Promise<SessionInfo | null> {
  if (!token) return null;
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) return null;
  const user = await ctx.db.get(session.userId);
  if (!user) return null;
  return {
    userId: user._id as Id<"users">,
    role: user.role as SessionInfo["role"],
    username: user.username as string,
  };
}
