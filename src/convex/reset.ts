// One-time dev reset: clears all tables so the new schema can deploy.
import { mutation } from "./_generated/server";

const TABLES = [
  "users",
  "sessions",
  "stories",
  "scenes",
  "choices",
  "storyStyles",
  "sceneImages",
  "pathProgress",
  "readingProgress",
  "favorites",
  "comments",
] as const;

export const resetAll = mutation({
  args: {},
  handler: async (ctx) => {
    const counts: Record<string, number> = {};
    for (const table of TABLES) {
      const docs = await ctx.db.query(table as any).collect();
      for (const d of docs) await ctx.db.delete(d._id);
      counts[table] = docs.length;
    }
    return counts;
  },
});
