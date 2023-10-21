import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../lib/types";
import { DATABASE } from "../lib/database";
import { EmbedBuilder, Guild } from "discord.js";
import {
  EMBED_ERROR_COLOR,
  EMBED_IMAGE,
  EMBED_NEUTRAL_COLOR,
} from "../lib/constants";

// Verified command
export const VerifiedCommand: Command = {
  name: "verified",
  data: new SlashCommandBuilder()
    .setName("verified")
    .setDescription("Get a list of all verified users")
    .toJSON(),

  handler: async (ctx: any) => {
    // Check if the user has admin permissions
    const guild: Guild | undefined = await ctx.guild?.fetch();
    if (!guild) {
      const embed: EmbedBuilder = errorEmbed();
      await ctx.reply({ embeds: [embed] });
      return;
    }

    const guildUser = guild.members.cache.get(ctx.user.id);
    if (!guildUser || !isAdmin(guildUser)) {
      const embed: EmbedBuilder = invalidPermissionsEmbed();
      await ctx.reply({ embeds: [embed] });
      return;
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
 * Check if the user has admin permissions
 * @param guildUser The guild user
 * @returns True if the user has admin permissions
 */
function isAdmin(guildUser: any): boolean {
  return guildUser.permissions.has("Administrator");
}

/**
 * Embed for not having admin permissions
 * @returns The embed
 */
function invalidPermissionsEmbed(): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: "Vitess Verification",
      iconURL: EMBED_IMAGE,
    })
    .setDescription("Invalid permissions")
    .setColor(EMBED_ERROR_COLOR);

  return embed;
}

/**
 * Embed for the list of verified users
 * @returns The embed
 */
async function verifiedUsersEmbed(guild: Guild, users: any) {
  const fields: any[] = users.map((user: any) => {
    const member = guild.members.cache.get(user.discordId);

    if (!member) {
      return {
        name: `Unknown (${user.discordId})`,
        value: user.verifiedAt.toString(),
      };
    }

    const userName: string = member.nickname || member.user.username;
    return {
      name: `${userName} (${user.discordId})`,
      value: user.verifiedAt.toString(),
    };
  });

  const embed = new EmbedBuilder()
    .setTitle("Verified Users")
    .setColor(EMBED_NEUTRAL_COLOR)
    .addFields(fields);

  return embed;
}

/**
 * Embed for an error
 * @returns The embed
 */
function errorEmbed(): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: "Vitess Verification",
      iconURL: EMBED_IMAGE,
    })
    .setDescription("An error occurred")
    .setColor(EMBED_ERROR_COLOR);

  return embed;
}
