import {
  Message,
  TextChannel,
  VoiceChannel,
  VoiceConnection,
} from "discord.js";

import ytdl = require("ytdl-core");

/**
 * Contains data for a hero in the counter command
 */
export interface IHero {
  name: string;
  count: number;
  winrate: number;
  disadvantage: number;
}

/**
 * Contains all the data for each song in the play song command
 */
export interface ISong {
  info: ytdl.videoInfo;
  title: string;
  url: string;
  duration: number;
  formattedDuration: string;
}

/**
 * Contains data for the music queue of a server
 */
export interface IServerMusicQueue {
  voiceChannel: VoiceChannel;
  textChannel: TextChannel;
  connection: VoiceConnection;
  songs: ISong[];
  playingMessage: Message;
  playing: boolean;
  isRepeating: boolean;
}

/**
 * Contains data for the player profile in profile command
 */
export interface IPlayerData {
  name: string;
  accountId: number;
  mmrEstimate: number;
  country: string;
  avatar: string;
  win: number;
  lose: number;
  winRate: number;
  rankTier: number;
  leaderboardRank: number;
  heroes: IPlayerHeroData[];
  recent: IPlayerRecentData;
}

/**
 * Contains data for one hero in the profile command
 */
export interface IPlayerHeroData {
  name: string;
  games: number;
  winRate: number;
  percentile: string;
}

/**
 * Contains data about the player's recent match in the profile command
 */
export interface IPlayerRecentData {
  outcome: string;
  skill: string;
  lobbyType: string;
  gameMode: string;
  hero: string;
  kills: number;
  deaths: number;
  assists: number;
  goldPerMin: number;
  expPerMin: number;
  date: string;
  duration: string;
}

/**
 * Contains data for a hero in the meta command
 */
export interface IMetaHeroData {
  name: string;
  pickRate: string;
  winRate: string;
}
