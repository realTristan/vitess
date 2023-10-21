import {
  Interaction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";

/**
 * Type for a slash command
 */
export type Command = {
  name: string;
  data: RESTPostAPIChatInputApplicationCommandsJSONBody | null;
  handler: (interaction: Interaction) => Promise<void>;
};

/**
 * Type for a timeout
 */
export type Timeout = NodeJS.Timeout;
