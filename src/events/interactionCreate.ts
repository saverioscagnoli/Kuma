import {
  CacheType,
  CommandInteractionOptionResolver,
  InteractionCollector,
  MessageComponentInteraction,
} from "discord.js";
import { client } from "..";
import { CommandType, ExtendedInteraction } from "../typings/Command";
import { Event } from "../typings/Event";
import { pokemonUtils } from "../utils/general";
import { sql } from "../utils/sql";
export const collectorMap: Map<
  string,
  InteractionCollector<MessageComponentInteraction<CacheType>>
> = new Map();

export default new Event("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  await interaction.deferReply();
  const command: CommandType = client.commands.get(interaction.commandName);
  const profileData = await sql.checkForData(interaction.user.id);
  if (collectorMap.has(interaction.user.id)) {
    collectorMap.get(interaction.user.id).stop();
  }
  const lvlUp = await pokemonUtils.levelUp(interaction.user.id);
  if (lvlUp) {
    await interaction.channel.send(
      `Yo ${interaction.user}! your ${lvlUp.name} has leveled from **\`${
        lvlUp.level - 1
      }\`** to **\`${lvlUp.level}\`**!`
    );
  }
  try {
    await command.execute({
      args: interaction.options as CommandInteractionOptionResolver,
      client,
      interaction: interaction as ExtendedInteraction,
      collectors: collectorMap,
      profileData: profileData,
    });
  } catch (e) {
    console.log(e);
  }
  return;
});
