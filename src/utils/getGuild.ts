import { Guild } from "discord.js";

/**
 * Get the guild from an interaction
 * @param ctx The interaction
 * @returns the guild or a null
 */
export const getGuildFromInteraction = async (
  ctx: any
): Promise<Guild | null> => {
  const guild: Guild | undefined = await ctx.guild?.fetch();
  return guild ?? null;
};
