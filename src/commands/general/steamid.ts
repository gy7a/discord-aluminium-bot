import { Message } from "discord.js";
import { User, UserModel } from "../../database/User";
import { IBot, ICommand } from "../../interfaces/Bot";

export default class SetPrefix implements ICommand {
  name: string = "steamid";
  description: string = "Change the prefix of the bot for the current server";
  information: string = "Stores or updates your steam ID (it should consist of only numbers and be the number that you see as your steam friend id or in your steam URL, or the number at the end of your dotabuff/ opendota URL). Once your steam ID is saved, you do not need to type your steamID the next time you use the opendota command. If you would like to remove your steamID info from the database, you can use `steamid 0`.";
  aliases: string[] = [];
  args: boolean = true;
  usage: string = "[Steam32 ID]";
  example: string = "193480093";
  cooldown: number = 0;
  category: string = "general";
  guildOnly: boolean = false;
  execute: (message: Message, args: string[], client: IBot) => void =
    steamid;
}

function steamid(message, args, client) {
  const discordID = message.author.id;
  const steamID = args[0];

  const query = { discordID: discordID };
  const update = { steamID: steamID };
  const options = { returnNewDocument: true };

  // Remove steamID from the database
  if (steamID === "0") {
    UserModel.remove(query)
      .then(() => {
        message.channel.send("Successfully removed steamID from database!");
      })
      .catch((err) =>
        message.channel.send(
          `${message.author} Failed to find and remove steamID ${err}`
        )
      );
    return;
  }

  // Basic check if the steamID is valid
  if (isNaN(steamID) || isNaN(parseInt(steamID))) {
    message.channel.send(
      `${message.author} Invalid steamID. It should only consist of numbers.`
    );
    return;
  }

  // Update the steamID in the database
  UserModel.findOneAndUpdate(query, update)
    .then((updatedDocument) => {
      if (updatedDocument) {
        message.channel.send(
          `${message.author} Successfully updated Steam ID to be **${steamID}**!`
        );
      } else {
        const newUser = new UserModel({ discordID, steamID });
        newUser
          .save()
          .then(() => {
            message.channel.send(
              `${message.author} Added Steam ID to be **${steamID}**.`
            );
          })
          .catch((err) => message.channel.send("Error: " + err));
      }
    })
    .catch((err) =>
      message.channel.send(
        `${message.author} Failed to find and add/ update ID. ${err}`
      )
    );
}
