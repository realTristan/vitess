import { Client, Events } from "discord.js";

export function setOnJoin(client: Client) {
  client.on(Events.GuildMemberAdd, (member) => {
    console.log(`${member.user.tag} joined the server.`);
  });
}
