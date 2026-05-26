import { mutation } from "./_generated/server";

export const resetAll = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }
    const sessions = await ctx.db.query("sessions").collect();
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }
    return { deletedUsers: users.length, deletedSessions: sessions.length };
  },
});
