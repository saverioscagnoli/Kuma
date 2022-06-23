import { Command } from "../../typings/Command";
import { utils } from "../../utils/general";

export default new Command({
  name: "balance",
  description: "Display your banana balace.",
  execute: async ({ interaction, profileData }) => {
    const embed = utils.Embed(
      `**${
        interaction.user.username.endsWith("s")
          ? interaction.user.username + "'"
          : interaction.user.username + "'s"
      } 🍌 balance!**`,
      `**Wallet: \`${profileData.bananas}\`
      Deposit: \`${profileData.deposit}\`
      Pokéballs ${process.env.EMOJI_POKEBALL}: \`${profileData.pokeballs}\`
      Greatballs ${process.env.EMOJI_GREATBALL}: \`${profileData.greatballs}\`
      Ultraballs ${process.env.EMOJI_ULTRABALL}: \`${profileData.ultraballs}\`**`,
      null,
      null,
      "YELLOW",
      {
        text: "potassium",
        iconURL: interaction.user.displayAvatarURL(),
      }
    );
    await interaction.editReply({
      embeds: [embed],
    });
    return;
  },
});
