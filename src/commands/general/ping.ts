import { Command } from "../Command";
import { Message } from "discord.js";

export default class Ping extends Command {
  name = "ping";
  description = 'Sends back "Pong!" and the latency of user from bot server';
  information = "";
  aliases: string[] = [];
  args = false;
  usage = "";
  example = "";
  cooldown = 0;
  category = "general";
  guildOnly = false;
  execute = (message: Message, args: string[]): Promise<any> => {
    const ping = `${Date.now() - message.createdTimestamp} ms`;
    return message.channel.send(`Pong! Your ping is **${ping}**.`);
  };
}
