import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSession = mutation({
  args: {
    sessionId: v.string(),
    userId: v.string(),
    discordAccessToken: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_discord_id", (q) => q.eq("discordId", args.userId))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.insert("sessions", {
      sessionId: args.sessionId,
      userId: user._id,
      discordAccessToken: args.discordAccessToken,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });
  },
});

export const getSession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .unique();

    if (!session) return null;
    if (session.expiresAt < Date.now()) return null;

    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    return {
      discordId: user.discordId,
      username: user.username,
      globalName: user.globalName,
      avatar: user.avatar,
      discriminator: user.discriminator,
      locale: user.locale,
      expiresAt: session.expiresAt,
      sessionId: session.sessionId,
    };
  },
});

export const getSessionToken = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .unique();

    if (!session) return null;
    if (session.expiresAt < Date.now()) return null;

    return session.discordAccessToken;
  },
});

export const deleteSession = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});
