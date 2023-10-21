import { CacheType, Client, Events, Interaction } from "discord.js";
import { Command } from "./types";

/**
 * Dataclass for storing all of the commands
 */
export default class Commands {
  /**
   * Store all of the commands
   */
  private storage: { [key: string]: Command } = {};

  /**
   * Set a command
   * @param name The name of the command
   * @param command The command
   * @returns The command
   */
  public set(cmd: Command) {
    if (this.storage[cmd.name])
      throw new Error(`Command ${cmd.name} already exists`);

    this.storage[cmd.name] = cmd;
  }

  /**
   * Initialize and handle all of the commands
   * @param client The Discord client
   * @returns The client
   */
  public init(client: Client) {
    for (const c of Object.values(this.storage)) {
      if (!c.data) continue;

      client.application?.commands.create(c.data);
    }

    client.on(
      Events.InteractionCreate,
      async (interaction: Interaction<CacheType>) => {
        if (!interaction.isCommand()) return;

        const name: string = interaction.commandName;
        const cmd: Command = this.storage[name];

        if (cmd) await cmd.handler(interaction);
      }
    );

    return client;
  }
}
