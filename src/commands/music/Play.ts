import { Command } from "../../types/Command";
import { IServerMusicQueue, ISong } from "../../types/interfaces/Bot";
import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
  StreamType,
  VoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { Message, StageChannel, TextChannel, VoiceChannel } from "discord.js";

import ytdl = require("ytdl-core");
import ytsr = require("ytsr");

export default class Play extends Command {
  name = "play";
  visible = true;
  description = "Add a song from url to the queue";
  information =
    "Add a song from url to the queue. Once there are no more songs / all users have left the channel, the bot stays in the channel for 1 minute. If no further songs have been added, or there are still no members, then the bot leaves.";
  aliases = ["p"];
  args = true;
  usage = "[song_name] or [song_url]";
  example = "whitley nova";
  cooldown = 0;
  category = "music";
  guildOnly = true;
  execute = async (message: Message, args: string[]): Promise<Message> => {
    message.channel.sendTyping();

    // Check if they are in a voice channel
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    }

    // Check if the bot has permissions to play music in that server
    if (!this.hasPermissions(voiceChannel, message)) {
      return;
    }

    // Get the song info
    const songInfo: ytdl.videoInfo = await this.getSongInfo(message, args);

    const connection = await this.connectToChannel(voiceChannel);
    console.log("Connected to channel");

    const player = await this.playSong(songInfo);
    console.log("Player is ready");

    connection.subscribe(player);
    console.log("Connection has subscribed to player");
    // player.on(AudioPlayerStatus.Idle, () => connection.destroy());
  };

  /**
   * Read the user's arguments and get the song from youtube
   *
   * @param message the message that triggered this command
   * @param args the arguments of the user
   * @returns the song info of their desired song
   */
  private async getSongInfo(
    message: Message,
    args: string[]
  ): Promise<ytdl.videoInfo> {
    let songInfo = null;
    if (ytdl.validateURL(args[0])) {
      // Find the song details from URL
      songInfo = await ytdl.getInfo(args[0]);
      if (!songInfo) {
        this.createAndSendEmbed(
          message.channel,
          "Could not find details from youtube"
        );
      }
    } else {
      try {
        const searchString = await ytsr.getFilters(args.join(" "));
        const videoSearch = searchString.get("Type").get("Video");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results: any = await ytsr(videoSearch.url, {
          limit: 1,
        });
        songInfo = await ytdl.getInfo(results.items[0].url);
      } catch (error) {
        console.log(error);
        this.createAndSendEmbed(
          message.channel,
          "There was an error searching for that song"
        );
      }
    }
    return songInfo;
  }

  /**
   * Given the song details, create an audio player for the song, or throw an
   * error if it does not start playing in 5 seconds
   *
   * @param songInfo the details of the song
   * @returns a promise to the created audio player
   */
  private async playSong(songInfo: ytdl.videoInfo): Promise<AudioPlayer> {
    const player = createAudioPlayer();
    const stream = ytdl(songInfo.videoDetails.video_url, {
      filter: "audioonly",
    });
    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });
    player.play(resource);
    return entersState(player, AudioPlayerStatus.Playing, 5_000);
  }

  /**
   * Connect to a voice channel and returns the VoiceConnection. If we
   * cannot connect within 30 seconds, throw an error
   *
   * @param channel the voice channel to connect to
   * @returns the VoiceConnection after we connect
   */
  private async connectToChannel(
    channel: VoiceChannel | StageChannel
  ): Promise<VoiceConnection> {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
      return connection;
    } catch (error) {
      connection.destroy();
      throw error;
    }
  }

  // execute = async (message: Message, args: string[]): Promise<Message> => {
  //   message.channel.sendTyping();

  //   // Check if we are in a voice channel
  //   const voiceChannel = message.member.voice.channel;
  //   if (!voiceChannel) {
  //     return message.channel.send(
  //       "You need to be in a voice channel to play music!"
  //     );
  //   }

  //   // Check if the bot has permissions to play music in that server
  //   if (!this.hasPermissions(voiceChannel, message)) {
  //     return;
  //   }

  //   let songInfo: ytdl.videoInfo = null;
  //   if (ytdl.validateURL(args[0])) {
  //     // Find the song details from URL
  //     songInfo = await ytdl.getInfo(args[0]);
  //     if (!songInfo) {
  //       return this.createAndSendEmbed(
  //         message.channel,
  //         "Could not find details from youtube"
  //       );
  //     }
  //   } else {
  //     try {
  //       const searchString = await ytsr.getFilters(args.join(" "));
  //       const videoSearch = searchString.get("Type").get("Video");
  //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //       const results: any = await ytsr(videoSearch.url, {
  //         limit: 1,
  //       });
  //       songInfo = await ytdl.getInfo(results.items[0].url);
  //     } catch (error) {
  //       console.log(error);
  //       return this.createAndSendEmbed(
  //         message.channel,
  //         "There was an error searching for that song"
  //       );
  //     }
  //   }

  //   // Collect song details
  //   const duration = parseInt(songInfo.videoDetails.lengthSeconds);
  //   const song: ISong = {
  //     info: songInfo,
  //     title: songInfo.videoDetails.title,
  //     url: songInfo.videoDetails.video_url,
  //     duration: duration,
  //     formattedDuration: this.formatDuration(duration),
  //   };

  //   // Check if there is a music queue
  //   const musicQueue = this.client.musicQueue;
  //   const guild = message.guild;
  //   const guildId = guild.id;
  //   const serverQueue = musicQueue.get(guildId);

  //   if (!serverQueue) {
  //     // Create the new queue
  //     const queueConstruct: IServerMusicQueue = {
  //       voiceChannel: voiceChannel,
  //       textChannel: message.channel as TextChannel,
  //       connection: null,
  //       songs: [],
  //       playingMessage: null,
  //       playing: true,
  //       isRepeating: false,
  //     };

  //     // Add the queue
  //     musicQueue.set(guildId, queueConstruct);
  //     queueConstruct.songs.push(song);

  //     // Play the song
  //     try {
  //       // Join the voice channel
  //       queueConstruct.connection = joinVoiceChannel({
  //         channelId: voiceChannel.id,
  //         guildId: guildId,
  //         adapterCreator: guild.voiceAdapterCreator,
  //       });
  //       this.playSong(guildId, musicQueue);
  //     } catch (error) {
  //       // Catch error and remove the server's queue
  //       console.log(error);
  //       musicQueue.delete(message.guild.id);
  //     }
  //   } else {
  //     // Add the new song to the queue
  //     serverQueue.songs.push(song);
  //     this.createAndSendEmbed(
  //       message.channel,
  //       `Queued ${this.getFormattedLink(song)} (${song.formattedDuration})`
  //     );
  //     // If it is the only song in the queue
  //     if (serverQueue.songs.length === 1) {
  //       this.playSong(guildId, musicQueue);
  //     }
  //   }
  // };

  // /**
  //  * Plays the next song in the queue. Once the song ends, pop it from the
  //  * queue and recursively call this function
  //  *
  //  * @param guildId the id of the server the bot is playing music in
  //  * @param musicQueue a map from a server's id to it's music queue
  //  * @returns a message saying which song it is currently playing
  //  */
  // playSong(guildId: string, musicQueue: Map<string, IServerMusicQueue>): void {
  //   const serverQueue = musicQueue.get(guildId);
  //   if (!serverQueue) {
  //     return;
  //   }

  //   // Base case
  //   if (serverQueue.songs.length === 0) {
  //     return this.handleEmptyQueue(guildId, musicQueue, serverQueue, 60_000);
  //   }

  //   const stream = ytdl.downloadFromInfo(serverQueue.songs[0].info, {
  //     highWaterMark: 1 << 25,
  //     filter: "audioonly",
  //   });
  //   const resource = createAudioResource(stream, {
  //     inputType: StreamType.Arbitrary,
  //   });
  //   const player = createAudioPlayer();

  //   player.play(resource);
  //   serverQueue.connection.subscribe(player);

  //   player.on(AudioPlayerStatus.Idle, () =>
  //     this.handleSongFinish(guildId, musicQueue, serverQueue)
  //   );

  //   // Send to channel which song we are playing
  //   this.sendPlayingEmbed(serverQueue);
  // }

  // /**
  //  * Handles what to do when the the current song finishes. If the server has
  //  * repeat active, then add the new song. If the queue is not empty, plays the
  //  * next song.
  //  *
  //  * @param guildId the id of the relevant server
  //  * @param musicQueue the mapping of server ids to their music queue
  //  * @param serverQueue the relevant server's music queue
  //  */
  // handleSongFinish(
  //   guildId: string,
  //   musicQueue: Map<string, IServerMusicQueue>,
  //   serverQueue: IServerMusicQueue
  // ): void {
  //   if (serverQueue !== null) {
  //     const song = serverQueue.songs[0];
  //     if (serverQueue.isRepeating) {
  //       serverQueue.songs.push(song);
  //     }
  //     serverQueue.songs.shift();
  //     return this.playSong(guildId, musicQueue);
  //   }
  // }

  // /**
  //  * Handles what to do when the queue is empty. If there are no more members,
  //  * then leave immediate, else wait for a specified duration, and then leave.
  //  *
  //  * @param guildId the id of the relevant server
  //  * @param musicQueue the mapping of server ids to their music queue
  //  * @param serverQueue the relevant server's music queue
  //  * @param timeoutDuration how long to stay in the voice channel before leaving
  //  */
  // handleEmptyQueue(
  //   guildId: string,
  //   musicQueue: Map<string, IServerMusicQueue>,
  //   serverQueue: IServerMusicQueue,
  //   timeoutDuration: number
  // ): void {
  //   if (serverQueue.voiceChannel.members.size === 0) {
  //     // If there are no more members
  //     serverQueue.connection.destroy();
  //     serverQueue.textChannel.send(
  //       "Stopping music as all members have left the voice channel"
  //     );
  //     musicQueue.delete(guildId);
  //     return;
  //   }
  //   // Wait for 1 minute and if there is no new songs, leave
  //   setTimeout(() => {
  //     if (serverQueue.songs.length === 0) {
  //       serverQueue.connection.destroy();
  //       musicQueue.delete(guildId);
  //       return;
  //     }
  //   }, timeoutDuration);
  // }

  // /**
  //  * Sends a message about the current playing song. If the bot had sent a
  //  * message like this for the previous song it played, delete that message
  //  *
  //  * @param serverQueue the queue for the relevant server
  //  */
  // sendPlayingEmbed(serverQueue: IServerMusicQueue): void {
  //   const song = serverQueue.songs[0];
  //   const songLink = this.getFormattedLink(song);
  //   this.createAndSendEmbed(
  //     serverQueue.textChannel,
  //     `Now playing ${songLink} (${song.formattedDuration})`
  //   ).then((message) => {
  //     if (serverQueue.playingMessage !== null) {
  //       serverQueue.playingMessage.delete();
  //     }
  //     serverQueue.playingMessage = message;
  //   });
  //   return;
  // }
}
