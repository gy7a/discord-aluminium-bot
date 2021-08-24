import { Client } from "./Client";
import { IBot, ICommand } from "./interfaces/Bot";
import { Message, VoiceChannel } from "discord.js";

export abstract class Command implements ICommand {
  client: Client;
  abstract name: string;
  abstract visible: boolean;
  abstract description: string;
  abstract information: string;
  abstract aliases: string[];
  abstract args: boolean;
  abstract usage: string;
  abstract example: string;
  abstract cooldown: number;
  abstract category: string;
  abstract guildOnly: boolean;

  /**
   * @param message the message to respond to
   * @param args the rest of the arguments given to the command
   * @returns A promise to the message sent back or void if there is none
   */
  execute: (message: Message, args: string[]) => Promise<Message>;

  public constructor(client: IBot) {
    this.client = client;
  }

  /**
   * Check if the bot has permissions to join the voice channel. Also
   * sends a message to the channel if the bot cannot join
   *
   * @param voiceChannel the voice channel to join
   * @param message the message where the play command was sent
   * @returns if the bot has permission to join the voice channel or not
   */
  protected hasPermissions(
    voiceChannel: VoiceChannel,
    message: Message
  ): boolean {
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT")) {
      message.channel.send(
        "I need the permissions to join your voice channel!"
      );
      return false;
    } else if (!permissions.has("SPEAK")) {
      message.channel.send(
        "I need the permissions to speak in your voice channel!"
      );
      return false;
    }
    return true;
  }

  /**
   * Returns a duration formatted in (MM:HH:SS) or (MM:SS) if it is less than an
   * hour. If it is a livestream, then send the string "livestream"
   *
   * @param seconds the duration in seconds
   * @returns a formatted version of the duration
   */
  protected formatDuration(seconds: number): string {
    if (seconds === 0) {
      return "livestream";
    } else if (seconds < 3600) {
      return new Date(seconds * 1000).toISOString().substr(14, 5);
    } else {
      return new Date(seconds * 1000).toISOString().substr(11, 8);
    }
  }
}
