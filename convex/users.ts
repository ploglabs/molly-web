import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const upsertUser = mutation({
  args: {
    id: v.string(),
    username: v.string(),
    globalName: v.optional(v.string()),
    avatar: v.optional(v.string()),
    discriminator: v.string(),
    locale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_discord_id", (q) => q.eq("discordId", args.id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        username: args.username,
        globalName: args.globalName,
        avatar: args.avatar,
        discriminator: args.discriminator,
        locale: args.locale,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("users", {
        discordId: args.id,
        username: args.username,
        globalName: args.globalName,
        avatar: args.avatar,
        discriminator: args.discriminator,
        locale: args.locale,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

export const getUserById = query({
  args: { discordId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_discord_id", (q) => q.eq("discordId", args.discordId))
      .unique();
  },
});
