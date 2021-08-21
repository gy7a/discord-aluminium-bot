import { IBot, IEvent } from "../interfaces/Bot";

export default class VoiceStateUpdate implements IEvent {
  client: IBot;

  constructor(client: IBot) {
    this.client = client;
  }

  public async run(args: any): Promise<void> {
    const [oldMember, newMember] = args;
    const guild = oldMember.guild;

    // If the guild has music playing
    const serverQueue = this.client.musicQueue.get(guild.id);
    if (!serverQueue) {
      return;
    }

    // Check if the voice channel is empty
    if (serverQueue.voiceChannel.members.size === 1) {
      serverQueue.songs = [];

      // If the bot is the last person connected
      if (serverQueue.connection != null) {
        serverQueue.connection.dispatcher.end();
        return serverQueue.textChannel.send(
          "Stopping music as all members have left the voice channel"
        );
      }
    }
  }
}
