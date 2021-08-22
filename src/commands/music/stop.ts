import { Command } from "../Command";
import { Message } from "discord.js";

export default class Stop extends Command {
  name = "stop";
  description = "Remove all songs from the current queue";
  information = "";
  aliases: string[] = [];
  args = false;
  usage = "";
  example = "";
  cooldown = 0;
  category = "music";
  guildOnly = false;
  execute = (message: Message, args: string[]): Promise<any> => {
    // Check if we are in a voice channel
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.channel.send(
        "You need to be in a voice channel to stop the queue!"
      );
      return;
    }

    // Check if there is a music queue
    const serverQueue = this.client.musicQueue.get(message.guild.id);
    if (!serverQueue) {
      return message.channel.send("There's no active queue");
    }

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    return message.channel.send("Removed all songs from the queue");
  };
}
