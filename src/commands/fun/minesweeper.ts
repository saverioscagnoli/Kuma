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
    const grid = [];
    const field: string[][] = [[], [], [], [], [], [], [], []];
    for (let i = 0; i < 8; i++) {
      for (let k = 0; k < 9; k++) {
        if (k == 8) {
          field[i].push("\n");
        } else {
          if (utils.rng(1, 3) == 1) {
            field[i][k] = `||${process.env.EMOJI_MINE}||`;
          } else {
            field[i][k] = `||${process.env.EMOJI_MINE}||`;
          }
        }
      }
    }
    for (let i = 0; i < field.length; i++) {
      grid.push(field[i].join(" "));
    }
    await interaction.editReply("\n" + String(grid.join(" ")));
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
