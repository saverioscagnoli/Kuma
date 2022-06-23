import {
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
} from "discord.js";
import { Pokemon, pokemonAPI } from "pkmnapi";
import { client } from "../..";
import { Command } from "../../typings/Command";
import { pokemonUtils, utils } from "../../utils/general";
import { ClientPokemon } from "../../utils/misc/Pokemon";
import { sql } from "../../utils/sql";

export default new Command({
  name: "pokemon",
  description: "Pokémon macro command.",
  options: [
    {
      name: "encounter",
      description: "Encounter a wild Pokémon!",
      type: "SUB_COMMAND",
    },
  ],
  execute: async ({ interaction, profileData }) => {
    const subCommand = interaction.options.getSubcommand();
    if (subCommand == "encounter") {
      let ballModifier: number;
      let catched: boolean;
      const actionRow = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("pokeballs")
          .setEmoji(process.env.EMOJI_POKEBALL)
          .setStyle("SECONDARY"),
        new MessageButton()
          .setCustomId("greatballs")
          .setEmoji(process.env.EMOJI_GREATBALL)
          .setStyle("SECONDARY"),
        new MessageButton()
          .setCustomId("ultraballs")
          .setEmoji(process.env.EMOJI_ULTRABALL)
          .setStyle("SECONDARY")
      );
      const id = utils.rng(1, 898);
      const request = await pokemonAPI.getPokemon(`${id}`);
      const pokemon = new ClientPokemon(
        request.name,
        request.types.map((t) => t),
        utils.rng(1, 10),
        utils.pick(request.abilities),
        request.base_stats,
        request.data,
        request.evolution_chain,
        utils.pick(request.learned_moves, 4, true),
        request.sprite,
        request.gender_ratio.male > 100
          ? null
          : utils.bool(request.gender_ratio.female)
          ? "female"
          : "male"
      );
      const msgData = await pokemonUtils.setInEmbed(
        pokemon,
        true,
        interaction.user.username
      );
      await interaction.editReply({
        embeds: [msgData.embed],
        files: [msgData.atc],
        components: [actionRow],
      });
      const filter = async (int: MessageComponentInteraction) => {
        if (int.user.id != interaction.user.id) return false;
        profileData = await sql.checkForData(int.user.id);
        if (profileData[int.customId] <= 0) {
          const errorMsg = await interaction.channel.send(
            `**You have 0 \*${int.customId}\*!**`
          );
          await utils.sleep(1500);
          await errorMsg.delete();
          return false;
        }
        return true;
      };
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: utils.rng(50000, 100000),
      });
      collector.on("collect", async (int) => {
        await int.deferUpdate();
        await sql.update(int.user.id, int.customId, 0, profileData);
        switch (int.customId) {
          case "pokeballs":
            ballModifier = 1;
            break;
          case "greatballs":
            ballModifier = 1.5;
            break;
          case "ultraballs":
            ballModifier = 2;
            break;
        }
        catched = await pokemonUtils.Catch(
          int,
          ballModifier,
          msgData.embed,
          actionRow,
          pokemon,
          collector
        );
        await int.editReply({
          embeds: [msgData.embed],
          files: [msgData.atc],
        });
      });
      collector.on("end", async () => {
        if (catched) return;
        else {
          msgData.embed.setTitle(`**${pokemon.name} ran away!**`);
          await interaction.editReply({
            embeds: [msgData.embed],
          });
          return;
        }
      });
      return;
    }
  },
});
