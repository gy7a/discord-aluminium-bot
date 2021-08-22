import { prefix, activity } from "../../config.json";
import { Event } from "./Event";

export default class Ready extends Event {
  run = async (args: any[]): Promise<void> => {
    try {
      this.client.user.setActivity(`${prefix}${activity}`);
      console.log(`Active in ${this.client.guilds.cache.size} servers!`);
      console.log(`${this.client.user.tag} is ready!`);
    } catch (err) {
      console.log(err);
    }
  };
}
