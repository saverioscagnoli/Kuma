import {
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
} from "discord.js";
import { Command } from "../../typings/Command";
import { utils } from "../../utils/general";

export default new Command({
  name: "minesweeper",
  description: "Play Minesweeper!",
  execute: async ({ interaction }) => {
    const grid: MessageActionRow[] = [];
    const field: string[][] = [[], [], [], [], [], [], [], []];
    for (let i = 0; i < 8; i++) {
      for (let k = 0; k < 8; k++) {
        if (utils.rng(1, 3) == 1) {
          field[i][k] = `||${process.env.EMOJI_MINE}||`;
        } else {
          field[i][k] = "||aa||";
        }
      }
    }
    await interaction.editReply(String(field.join(" ")));
    const filter = (int: MessageComponentInteraction) => {
      return int.user.id == interaction.user.id;
    };
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
    });
    collector.on("collect", async (int) => {
      await int.deferUpdate();
      await interaction.editReply({
        components: grid,
      });
      return;
    });
    return;
  },
});
