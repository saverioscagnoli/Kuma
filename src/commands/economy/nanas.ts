import { Command } from "../../typings/Command";
import { utils } from "../../utils/general";
import { sql } from "../../utils/sql";

export default new Command({
  name: "nanas",
  description: "Earn some bananas!",
  cooldown: utils.toMS(0.01),
  execute: async ({ interaction, profileData }) => {
    const events: string[] = [
      "You begged for some bananas, and you got",
      "Some strange monkey in the forest gave you some bananas, and you got",
      "You got some bananas from a tree, and you got",
      "Bananas are raining from the sky! You got",
      "The banana god gave you some bananas, and you got",
      "You got some bananas from a banana tree, and you got",
      "You got some bananas from a banana bush, and you got",
      "Trees are alive and kicking! You got",
      "You got some bananas from today's market! You got",
    ];
    const amount = utils.rng(20, 50);
    await sql.update(interaction.user.id, "bananas", amount, profileData);
    await interaction.editReply(
      `${utils.pick(events)} **\`${amount}\`** bananas! 🍌`
    );
    return;
  },
});
