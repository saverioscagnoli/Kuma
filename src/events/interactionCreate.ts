import { CommandInteractionOptionResolver } from "discord.js";
import { client } from "..";
import { CommandType, ExtendedInteraction } from "../typings/Command";
import { Event } from "../typings/Event";
import { sql } from "../utils/sql";

export default new Event("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  await interaction.deferReply();
  const command: CommandType = client.commands.get(interaction.commandName);
  const profileData = await sql.checkForData(interaction.user.id);
  try {
    await command.execute({
      args: interaction.options as CommandInteractionOptionResolver,
      client,
      interaction: interaction as ExtendedInteraction,
      profileData: profileData,
    });
  } catch (e) {
    console.log(e);
  }
  return;
});
