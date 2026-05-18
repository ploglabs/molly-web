import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    discordId: v.string(),
    username: v.string(),
    globalName: v.optional(v.string()),
    avatar: v.optional(v.string()),
    discriminator: v.string(),
    locale: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_discord_id", ["discordId"]),

  sessions: defineTable({
    sessionId: v.string(),
    userId: v.id("users"),
    discordAccessToken: v.optional(v.string()),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_session_id", ["sessionId"]),
});
