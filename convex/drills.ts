import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    return user ? { email: (user as { email?: string }).email ?? null } : null;
  },
});

// ── Starred patterns ──────────────────────────────────────────────────────────

export const getStarred = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const rows = userId
      ? await ctx.db.query("starred").withIndex("by_user_pattern", (q) => q.eq("userId", userId)).collect()
      : await ctx.db.query("starred").filter((q) => q.eq(q.field("userId"), undefined)).collect();
    return rows.map((r) => r.patternId);
  },
});

export const toggleStarred = mutation({
  args: { patternId: v.string() },
  handler: async (ctx, { patternId }) => {
    const userId = await getAuthUserId(ctx);
    const existing = userId
      ? await ctx.db.query("starred").withIndex("by_user_pattern", (q) => q.eq("userId", userId).eq("patternId", patternId)).first()
      : await ctx.db.query("starred").withIndex("by_pattern", (q) => q.eq("patternId", patternId)).filter((q) => q.eq(q.field("userId"), undefined)).first();

    if (existing) {
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.insert("starred", { patternId, userId: userId ?? undefined });
    }
  },
});

// ── Sessions ──────────────────────────────────────────────────────────────────

export const logSession = mutation({
  args: {
    patternId: v.string(),
    mode: v.union(v.literal("guided"), v.literal("perfect")),
    success: v.boolean(),
    durationMs: v.number(),
    attempts: v.number(),
    mistakes: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    await ctx.db.insert("sessions", {
      ...args,
      userId: userId ?? undefined,
      completedAt: Date.now(),
    });
  },
});

export const getStats = query({
  args: { patternId: v.string() },
  handler: async (ctx, { patternId }) => {
    const userId = await getAuthUserId(ctx);
    const allSessions = await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("patternId"), patternId))
      .collect();

    const sessions = userId
      ? allSessions.filter((s) => s.userId === userId)
      : allSessions.filter((s) => !s.userId);

    const guided = sessions.filter((s) => s.mode === "guided");
    const perfect = sessions.filter((s) => s.mode === "perfect");

    const guidedWins = guided.filter((s) => s.success);
    const perfectWins = perfect.filter((s) => s.success);
    const perfectClean = perfect.filter((s) => s.success && s.attempts === 1);

    const bestGuided = guidedWins.length
      ? Math.min(...guidedWins.map((s) => s.durationMs)) : null;
    const bestPerfect = perfectWins.length
      ? Math.min(...perfectWins.map((s) => s.durationMs)) : null;

    return {
      guided: {
        total: guided.length,
        wins: guidedWins.length,
        totalMistakes: guided.reduce((sum, s) => sum + (s.mistakes ?? 0), 0),
        bestTimeMs: bestGuided,
      },
      perfect: {
        total: perfect.length,
        wins: perfectWins.length,
        cleanRuns: perfectClean.length,
        totalResets: perfect.reduce((sum, s) => sum + Math.max(0, s.attempts - 1), 0),
        bestTimeMs: bestPerfect,
      },
      totalSessions: sessions.length,
      totalMistakes: sessions.reduce((sum, s) => sum + (s.mistakes ?? 0), 0),
    };
  },
});

export const getAllStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const all = await ctx.db.query("sessions").collect();
    const sessions = userId
      ? all.filter((s) => s.userId === userId)
      : all.filter((s) => !s.userId);

    return {
      totalSessions: sessions.length,
      totalMistakes: sessions.reduce((sum, s) => sum + (s.mistakes ?? 0), 0),
      totalPerfectClean: sessions.filter((s) => s.mode === "perfect" && s.success && s.attempts === 1).length,
      totalGuidedWins: sessions.filter((s) => s.mode === "guided" && s.success).length,
      totalPerfectWins: sessions.filter((s) => s.mode === "perfect" && s.success).length,
      totalResets: sessions.filter((s) => s.mode === "perfect").reduce((sum, s) => sum + Math.max(0, s.attempts - 1), 0),
    };
  },
});
