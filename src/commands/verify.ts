import { SlashCommandBuilder } from "@discordjs/builders";
import { Command, Timeout } from "../lib/types";
import { DATABASE } from "../lib/database";
import { sha256 } from "../lib/crypto";
import { ChannelType, EmbedBuilder, Message } from "discord.js";
import {
  EMBED_ERROR_COLOR,
  EMBED_IMAGE,
  EMBED_NEUTRAL_COLOR,
  EMBED_SUCCESS_COLOR,
  MAX_RESPONSES,
  RESPONSE_WAIT_TIME_IN_MS,
  TIME_UPDATE_INTERVAL_IN_MS,
} from "../lib/constants";

/**
 * Function to generate a random code
 * @returns The code
 */
const genCode = async (): Promise<string> =>
  sha256(Math.random().toString() + ":" + Date.now());

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
      return await ctx.reply({ embeds: [embed] });
    }

    // Send the user a direct message asking them to enter the generated code
    const code: string = await genCode();
    const verifyEmbed: EmbedBuilder = verificationEmbed(code);
    const embedMessage = await ctx.user.send({
      embeds: [verifyEmbed],
    });

    await ctx.reply("A code has been sent to your dms!");

    // Start updating the embed time left
    const interval = updateEmbedTimeInterval(verifyEmbed, embedMessage);

    // Response filter
    const response = await awaitResponse(ctx, code);

    // Stop updating the embed time left
    clearInterval(interval);

    // If the response is null, then the user didn't respond
    if (!response) {
      const embed: EmbedBuilder = timeOutEmbed();
      return await ctx.user.send({ embeds: [embed] });
    }

    // If the code doesn't match, then the user entered the wrong code
    if (code !== response.content) {
      const embed: EmbedBuilder = wrongCodeEmbed();
      return await ctx.user.send({ embeds: [embed] });
    }

    // Create the user in the database
    await DATABASE.createUser(ctx.user.id);

    // Send the success embed
    const embed: EmbedBuilder = successEmbed();
    await ctx.user.send({ embeds: [embed] });
  },
};

/**
 * Interval for updating the embed time
 * @param embed The embed
 * @param msg The embed message
 * @returns The interval
 */
const updateEmbedTimeInterval = (embed: EmbedBuilder, msg: Message): Timeout =>
  setInterval(
    async () => await updateEmbedTimeField(embed, msg),
    TIME_UPDATE_INTERVAL_IN_MS
  );

/**
 * Update the embed time
 * @param embed The embed
 * @param msg The embed message
 * @returns The interval
 */
const updateEmbedTimeField = async (embed: EmbedBuilder, msg: Message) => {
  const fields = embed.data.fields;
  if (!fields || !fields.length) return;

  const value = fields[1].value;
  if (!value) return;

  // Update the field with the new time
  const time = parseInt(value.split(" ")[0]) - 1;
  fields[1].value = `${time} seconds`;

  // Edit the embed
  embed.setFields(fields);
  await msg.edit({ embeds: [embed] });
};

/**
 * Wait for the user to respond
 * @param embed The embed
 * @param embedMessage The embed message
 * @returns The response
 */
const awaitResponse = async (ctx: any, code: string) => {
  const channel = ctx.user.dmChannel;
  if (!channel) return null;

  const filter = (m: Message) =>
    m.author.id === ctx.user.id &&
    m.channel.type === ChannelType.DM &&
    m.content.length === code.length;

  return (
    channel
      .awaitMessages({
        filter,
        max: MAX_RESPONSES,
        time: RESPONSE_WAIT_TIME_IN_MS,
        errors: ["time"],
      })
      .then((msgs: any) => msgs.first()) ?? null
  );
};

/**
 * Embed for the user already being verified
 * @returns The embed
 */
const alreadyVerifiedEmbed = (): EmbedBuilder =>
  new EmbedBuilder()
    .setAuthor({
      name: "Vitess Verification",
      iconURL: EMBED_IMAGE,
    })
    .setDescription("You are already verified!")
    .setColor(EMBED_NEUTRAL_COLOR);

/**
 * Verification embed to announce the code
 * @param code The code
 * @returns The embed
 */
const verificationEmbed = (code: string): EmbedBuilder =>
  new EmbedBuilder()
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

/**
 * Embed for running out of time
 * @returns The embed
 */
const timeOutEmbed = (): EmbedBuilder =>
  new EmbedBuilder()
    .setAuthor({
      name: "Vitess Verification",
      iconURL: EMBED_IMAGE,
    })
    .setDescription("You ran out of time!")
    .setColor(EMBED_ERROR_COLOR);

/**
 * Embed for entering the wrong code
 * @returns The embed
 */
const wrongCodeEmbed = (): EmbedBuilder =>
  new EmbedBuilder()
    .setAuthor({
      name: "Vitess Verification",
      iconURL: EMBED_IMAGE,
    })
    .setDescription("You entered the wrong code!")
    .setColor(EMBED_ERROR_COLOR);

/**
 * Embed for successfully verifying
 * @returns The embed
 */
const successEmbed = (): EmbedBuilder =>
  new EmbedBuilder()
    .setAuthor({
      name: "Vitess Verification",
      iconURL: EMBED_IMAGE,
    })
    .setDescription("You have been verified!")
    .setColor(EMBED_SUCCESS_COLOR);
