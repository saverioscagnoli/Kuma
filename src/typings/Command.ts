import {
  ApplicationCommandDataResolvable,
  ChatInputApplicationCommandData,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  PermissionResolvable,
} from "discord.js";
import { GoofyAhhClient } from "./Client";
import { Schema } from "./Schema";

export interface ExtendedInteraction extends CommandInteraction {
  member: GuildMember;
}

interface ExecuteOptions {
  client: GoofyAhhClient;
  interaction: CommandInteraction;
  args: CommandInteractionOptionResolver;
  profileData: Schema;
}

type ExecuteFunction = (options: ExecuteOptions) => any;

export type CommandType = {
  userPermissions?: PermissionResolvable[];
  cooldown?: number;
  hasCollector?: boolean;
  execute: ExecuteFunction;
} & ChatInputApplicationCommandData;

export class Command {
  constructor(commandOptions: CommandType) {
    Object.assign(this, commandOptions);
  }
}

export interface registerCommandsOptions {
  guildID?: string;
  commands: ApplicationCommandDataResolvable[];
}
