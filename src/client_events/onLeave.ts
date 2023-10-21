import { Client, Events } from "discord.js";

export function setOnLeave(client: Client) {
  client.on(Events.GuildMemberRemove, (member) => {
    console.log(`${member.user.tag} left the server.`);
  });
}
