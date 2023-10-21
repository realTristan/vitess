import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../lib/types";
import { DATABASE } from "../lib/database";
import { EmbedBuilder, Guild } from "discord.js";
import {
  EMBED_ERROR_COLOR,
  EMBED_IMAGE,
  EMBED_NEUTRAL_COLOR,
} from "../lib/constants";
import { getGuildFromInteraction } from "../utils/getGuild";

/**
 * Check if the user has admin permissions
 * @param guildUser The guild user
 * @returns True if the user has admin permissions
 */
const isAdmin = (guildUser: any): boolean =>
  guildUser.permissions.has("Administrator");

/**
 * Verified command
 */
export const VerifiedCommand: Command = {
  name: "verified",
  data: new SlashCommandBuilder()
    .setName("verified")
    .setDescription("Get a list of all verified users")
    .toJSON(),

  handler: async (ctx: any) => {
    // Check if the user has admin permissions
    const guild = await getGuildFromInteraction(ctx);
    if (!guild) {
      const embed: EmbedBuilder = errorEmbed();
      return await ctx.reply({ embeds: [embed] });
    }

    // Check if the user has admin permissions
    const guildUser = guild.members.cache.get(ctx.user.id);
    if (!guildUser || !isAdmin(guildUser)) {
      const embed: EmbedBuilder = invalidPermissionsEmbed();
      return await ctx.reply({ embeds: [embed] });
    }

    // Get all verified users
    const users = await DATABASE.getAllUsers();

    // Send the user a direct message asking them to enter the generated code
    const embed: EmbedBuilder = await verifiedUsersEmbed(guild, users);
    await ctx.user.send({ embeds: [embed] });
    await ctx.reply("A list of all verified users has been sent to your dms!");
  },
};

/**
 * Generate the embed fields for the list of verified users
 * @returns The embed fields
 */
const genVerifiedUsersEmbedFields = (guild: Guild, users: any) =>
  users.map((user: any) => {
    const member = guild.members.cache.get(user.discordId);
    const userName = member ? member.user.username : "User";

    return {
      name: `${userName} (${user.id})`,
      value: user.verifiedAt.toString(),
    };
  });

/**
 * Embed for the list of verified users
 * @returns The embed
 */
const verifiedUsersEmbed = (guild: Guild, users: any) => {
  const fields = genVerifiedUsersEmbedFields(guild, users);

  return new EmbedBuilder()
    .setTitle("Verified Users")
    .setColor(EMBED_NEUTRAL_COLOR)
    .addFields(fields);
};

/**
 * Embed for not having admin permissions
 * @returns The embed
 */
const invalidPermissionsEmbed = (): EmbedBuilder =>
  new EmbedBuilder()
    .setAuthor({
      name: "Vitess Verification",
      iconURL: EMBED_IMAGE,
    })
    .setDescription("Invalid permissions")
    .setColor(EMBED_ERROR_COLOR);

/**
 * Embed for an error
 * @returns The embed
 */
const errorEmbed = (): EmbedBuilder =>
  new EmbedBuilder()
    .setAuthor({
      name: "Vitess Verification",
      iconURL: EMBED_IMAGE,
    })
    .setDescription("An error occurred")
    .setColor(EMBED_ERROR_COLOR);
