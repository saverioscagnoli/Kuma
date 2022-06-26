import {
  Client,
  Collection,
  ClientEvents,
  ApplicationCommandDataResolvable,
} from "discord.js";
import { readdirSync } from "fs";
import { CommandType, registerCommandsOptions } from "./Command";
import { Event } from "./Event";
import { QuickDB } from "quick.db";

export class GoofyAhhClient extends Client {
  commands: Collection<string, CommandType> = new Collection();
  cooldowns: QuickDB;
  database: QuickDB;
  constructor() {
    super({
      intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_MEMBERS",
        "DIRECT_MESSAGES",
        "GUILD_WEBHOOKS",
      ],
    });
    this.database = new QuickDB({
      filePath: `${__dirname}../../../databases/SchemaTable.sqlite`,
    });
    this.cooldowns = new QuickDB({
      filePath: `${__dirname}../../../databases/cooldowns.sqlite`,
    });
  }
  async build() {
    this.login(process.env.TOKEN);
    this.register();
  }
  async registerSlashCommands({ commands, guildID }: registerCommandsOptions) {
    if (guildID) {
      await this.guilds.cache.get(guildID)?.commands.set(commands);
      console.log("Commands registered. (Locally)");
    } else {
      this.application.commands.set(commands);
      console.log("Command registered. (Globally)");
    }
  }
  async register() {
    const SlashCommands: ApplicationCommandDataResolvable[] = [];
    const commandFolders = readdirSync(`${__dirname}/../commands`);
    for (let i = 0; i < commandFolders.length; i++) {
      const commandFiles = readdirSync(
        `${__dirname}/../commands/${commandFolders[i]}`
      );
      for (let k = 0; k < commandFiles.length; k++) {
        const command: CommandType =
          require(`${__dirname}/../commands/${commandFolders[i]}/${commandFiles[k]}`).default;
        if (!command.name) return;
        this.commands.set(command.name, command);
        SlashCommands.push(command);
      }
    }
    this.on("ready", async () => {
      this.registerSlashCommands({
        commands: SlashCommands,
        guildID: process.env.GUILD,
      });
    });
    const eventFiles = readdirSync(`${__dirname}/../events`);
    for (let i = 0; i < eventFiles.length; i++) {
      const event: Event<keyof ClientEvents> =
        require(`${__dirname}/../events/${eventFiles[i]}`).default;
      this.on(event.event, event.run);
    }
  }
}
