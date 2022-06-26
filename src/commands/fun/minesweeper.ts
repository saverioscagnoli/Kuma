import { MessageActionRow, MessageButton } from "discord.js";
import { Command } from "../../typings/Command";

export default new Command({
  name: "minesweeper",
  description: "Play Minesweeper!",
  execute: async ({ interaction }) => {
    const grid: MessageActionRow[] = [];
    for (let i = 0; i < 5; i++) {
      const row = new MessageActionRow();
      for (let k = 0; k < 5; k++) {
        row.addComponents(
          new MessageButton()
            .setCustomId(`${i} - ${k}`)
            .setLabel(" ")
            .setStyle("SECONDARY")
        );
      }
      grid.push(row);
    }
    await interaction.editReply({
      components: grid,
    });
    return;
  },
});
