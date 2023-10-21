import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../lib/types";
import { DATABASE } from "../lib/database";
import { EmbedBuilder } from "discord.js";
import {
  EMBED_ERROR_COLOR,
  EMBED_IMAGE,
  EMBED_SUCCESS_COLOR,
} from "../lib/constants";

// Unverify command
export const UnverifyCommand: Command = {
  name: "unverify",
  data: new SlashCommandBuilder()
    .setName("unverify")
    .setDescription("Unverify yourself!")
    .toJSON(),

  handler: async (ctx: any) => {
    // Check if the user exists
    const userExists = await DATABASE.userExists(ctx.user.id);

    // If the user exists, then they have already been verified
    if (!userExists) {
      const embed: EmbedBuilder = invalidUserEmbed();
      await ctx.reply({ embeds: [embed] });
      return;
    }

    // Delete the user
    await DATABASE.deleteUser(ctx.user.id);

    // Send the user a direct message asking them to enter the generated code
    const embed: EmbedBuilder = unverifySuccessEmbed();
    await ctx.reply({ embeds: [embed] });
  },
};

/**
 * Embed for entering an invalid user
 * @returns The embed
 */
function invalidUserEmbed(): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: "Vitess Verification",
      iconURL: EMBED_IMAGE,
    })
    .setDescription("Invalid user")
    .setColor(EMBED_ERROR_COLOR);

  return embed;
}

/**
 * Embed for successfully unverifying a user
 * @returns The embed
 */
function unverifySuccessEmbed(): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: "Vitess Verification",
      iconURL: EMBED_IMAGE,
    })
    .setDescription("Successfully unverified user")
    .setColor(EMBED_SUCCESS_COLOR);

  return embed;
}
