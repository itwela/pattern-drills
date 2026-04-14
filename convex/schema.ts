import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  sessions: defineTable({
    patternId: v.string(),
    userId: v.optional(v.id("users")),
    mode: v.union(v.literal("guided"), v.literal("perfect")),
    success: v.boolean(),
    durationMs: v.number(),
    attempts: v.number(),
    mistakes: v.number(),
    completedAt: v.number(),
  }),

  starred: defineTable({
    patternId: v.string(),
    userId: v.optional(v.id("users")),
  }).index("by_pattern", ["patternId"])
    .index("by_user_pattern", ["userId", "patternId"]),
});
