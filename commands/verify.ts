import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../lib/types";
import { DATABASE } from "../lib/database";
import { sha256 } from "../lib/crypto";
import { APIEmbedField, ChannelType, EmbedBuilder, Message } from "discord.js";
import {
  EMBED_ERROR_COLOR,
  EMBED_IMAGE,
  EMBED_NEUTRAL_COLOR,
  EMBED_SUCCESS_COLOR,
} from "../lib/constants";

// Constants
const MAX_RESPONSES: number = 1;
const RESPONSE_WAIT_TIME_IN_MS: number = 10000;
const TIME_UPDATE_INTERVAL_IN_MS: number = RESPONSE_WAIT_TIME_IN_MS / 10;

/**
 * Function to generate a random code
 * @returns The code
 */
async function genCode(): Promise<string> {
  return sha256(Math.random().toString() + ":" + Date.now());
}

// Verify command
export const VerifyCommand: Command = {
  name: "verify",
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verify yourself!")
    .toJSON(),

  handler: async (ctx: any) => {
    // Check if the user exists
    const userExists = await DATABASE.userExists(ctx.user.id);

    // If the user exists, then they have already been verified
    if (userExists) {
      const embed: EmbedBuilder = alreadyVerifiedEmbed();
      await ctx.reply({ embeds: [embed] });
      return;
    }

    // Send the user a direct message asking them to enter the generated code
    const code: string = await genCode();
    const verifyEmbed: EmbedBuilder = verificationEmbed(code);
    const embedMessage = await ctx.user.send({
      embeds: [verifyEmbed],
    });
    await ctx.reply("A code has been sent to your dms!");

    // Start updating the embed time left
    const interval = await updateEmbedTime(verifyEmbed, embedMessage);

    // Response filter
    const response = await awaitResponse(ctx, code);

    // Stop updating the embed time left
    clearInterval(interval);

    // If the response is null, then the user didn't respond
    if (!response) {
      const embed: EmbedBuilder = timeOutEmbed();
      await ctx.user.send({ embeds: [embed] });
      return;
    }

    // If the code doesn't match, then the user entered the wrong code
    if (code !== response.content) {
      const embed: EmbedBuilder = wrongCodeEmbed();
      await ctx.user.send({ embeds: [embed] });
      return;
    }

    // Create the user
    await DATABASE.createUser(ctx.user.id);

    const succEmbed = successEmbed();
    await ctx.user.send({ embeds: [succEmbed] });
  },
};

/**
 * Interval for updating the embed time
 * @param embed The embed
 * @param embedMessage The embed message
 * @returns The interval
 */
async function updateEmbedTime(
  embed: EmbedBuilder,
  embedMessage: Message
): Promise<NodeJS.Timeout> {
  return setInterval(async () => {
    const fields: APIEmbedField[] = embed.data.fields ?? [];
    const value: string = fields[1].value;
    const newTime: number = parseInt(value.split(" ")[0]) - 1;

    // Update the embed
    fields[1].value = `${newTime} seconds`;

    // Edit the embed
    embed.setFields(fields);
    await embedMessage.edit({ embeds: [embed] });
  }, TIME_UPDATE_INTERVAL_IN_MS);
}

/**
 * Wait for the user to respond
 * @param embed The embed
 * @param embedMessage The embed message
 * @returns The response
 */
async function awaitResponse(ctx: any, code: string) {
  const filter = (m: Message) =>
    m.author.id === ctx.user.id &&
    m.channel.type === ChannelType.DM &&
    m.content.length === code.length;

  const msg = await ctx.user.dmChannel
    ?.awaitMessages({
      filter,
      max: MAX_RESPONSES,
      time: RESPONSE_WAIT_TIME_IN_MS,
      errors: ["time"],
    })
    .catch(() => null);

  return msg?.first() ?? null;
}

/**
 * Embed for the user already being verified
 * @returns The embed
 */
function alreadyVerifiedEmbed(): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: "Vitess Verification",
      iconURL: EMBED_IMAGE,
    })
    .setDescription("You are already verified!")
    .setColor(EMBED_NEUTRAL_COLOR);

  return embed;
}

/**
 * Verification embed to announce the code
 * @param code The code
 * @returns The embed
 */
function verificationEmbed(code: string): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: "Vitess Verification",
      iconURL: EMBED_IMAGE,
    })
    .setDescription("Enter the code below to verify yourself!")
    .setColor(EMBED_NEUTRAL_COLOR)
    .addFields(
      { name: "Code", value: code },
      { name: "Time Left", value: "10 seconds" }
    );

  return embed;
}

/**
 * Embed for running out of time
 * @returns The embed
 */
function timeOutEmbed(): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: "Vitess Verification",
      iconURL: EMBED_IMAGE,
    })
    .setDescription("You ran out of time!")
    .setColor(EMBED_ERROR_COLOR);

  return embed;
}

/**
 * Embed for entering the wrong code
 * @returns The embed
 */
function wrongCodeEmbed(): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: "Vitess Verification",
      iconURL: EMBED_IMAGE,
    })
    .setDescription("You entered the wrong code!")
    .setColor(EMBED_ERROR_COLOR);

  return embed;
}

/**
 * Embed for successfully verifying
 * @returns The embed
 */
function successEmbed(): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: "Vitess Verification",
      iconURL: EMBED_IMAGE,
    })
    .setDescription("You have been verified!")
    .setColor(EMBED_SUCCESS_COLOR);

  return embed;
}
