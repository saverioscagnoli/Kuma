import {
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
} from "discord.js";
import { pokemonAPI } from "pkmnapi";
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
    {
      name: "show",
      description: "Display one of your Pokémons.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "pokemon",
          description: "The Pokémon you want to display",
          type: "STRING",
          required: false,
        },
      ],
    },
    {
      name: "release",
      description: "Release one of your Pokémons.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "pokemon",
          description: "The Pokémon you want to release.",
          type: "STRING",
          required: true,
        },
      ],
    },
  ],
  execute: async ({ interaction, args, profileData, collectors }) => {
    const subCommand = interaction.options.getSubcommand();
    if (subCommand == "encounter") {
      let ballModifier: number;
      let wasCatched: boolean;
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
        files: [msgData.typesAtc],
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
      collectors.set(interaction.user.id, collector);
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
        utils.updateButtons(actionRow);
        await int.editReply({
          embeds: [msgData.embed],
          components: [actionRow],
        });
        const catchValue =
          (pokemon.base_stats.hp * pokemon.data.catch_rate * ballModifier) /
          (pokemon.base_stats.hp * 3);
        const catched = Math.floor(
          1048560 / Math.sqrt(Math.sqrt(16711680 / catchValue))
        );
        for (let i = 1; i <= 3; i++) {
          const rnd = utils.rng(0, 65535);
          msgData.embed.setFooter({
            text: `${i} shake${i > 1 ? "s" : ""}...`,
          });
          await int.editReply({
            embeds: [msgData.embed],
          });
          await utils.sleep(1500);
          if (rnd >= catched) {
            msgData.embed.setFooter({
              text: `Oh no! ${pokemon.name} broke free!`,
            });
            utils.updateButtons(actionRow, false);
            await int.editReply({
              embeds: [msgData.embed],
              components: [actionRow],
            });
            return;
          }
        }
        wasCatched = true;
        collector.stop();
        msgData.embed.setFooter({
          text: `Yes! ${pokemon.name} was caught!`,
        });
        await pokemonUtils.update(int.user.id, pokemon);
        await int.editReply({
          embeds: [msgData.embed],
        });
        await int.editReply({
          embeds: [msgData.embed],
          files: [msgData.typesAtc],
        });
      });
      collector.on("end", async () => {
        collectors.delete(interaction.user.id);
        if (wasCatched) {
          msgData.embed.setTitle(`**Yes! ${pokemon.name} was caught!**`);
        } else {
          msgData.embed.setTitle(`**${pokemon.name} ran away!**`);
        }
        await interaction.editReply({
          embeds: [msgData.embed],
        });
        return;
      });
      return;
    } else if (subCommand == "show") {
      const str = args.getString("pokemon", false);
      if (!str) {
        const allPkmns: string[] = [];
        for (const pokemon of profileData.pokemons) {
          allPkmns.push(
            `**\`${pokemon.name}\` - ${
              pokemon.gender == "male"
                ? process.env.EMOJI_MALE
                : process.env.EMOJI_FEMALE
            } **`
          );
        }
        const allPkmnsEmbed = utils.Embed(
          `**${
            interaction.user.username.endsWith("s")
              ? interaction.user.username + "'"
              : interaction.user.username + "'s"
          } Pokémons!**`,
          allPkmns.join("\n"),
          interaction.user.displayAvatarURL()
        );
        await interaction.editReply({
          embeds: [allPkmnsEmbed],
        });
        return;
      }
      const pokemon = pokemonUtils.findPokemon(str, profileData);
      if (!pokemon) {
        await interaction.editReply(`You don't have **\`${str}\`**!`);
        return;
      } else {
        const msgData = await pokemonUtils.setInEmbed(
          pokemon,
          false,
          interaction.user.username
        );
        await interaction.editReply({
          embeds: [msgData.embed],
          files: [msgData.typesAtc],
        });
        return;
      }
    } else if (subCommand == "release") {
      const str = args.getString("pokemon");
      const pokemon = pokemonUtils.findPokemon(str, profileData);
      if (!pokemon) {
        await interaction.editReply(`You don't have \`${str}\`!`);
        return;
      } else {
        const actionRow = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId("no")
            .setLabel("No")
            .setStyle("SECONDARY"),
          new MessageButton()
            .setCustomId("yes")
            .setLabel("Yes")
            .setStyle("DANGER")
        );
        await interaction.editReply({
          content: `Are you sure you want to release **\`${pokemon.name}\`**?`,
          components: [actionRow],
        });
        const filter = (int: MessageComponentInteraction) => {
          return interaction.user.id == int.user.id;
        };
        const collector = interaction.channel.createMessageComponentCollector({
          filter,
          max: 1,
          time: 60000,
        });
        collectors.set(interaction.user.id, collector);
        let released = false;
        collector.on("collect", async (int) => {
          await int.deferUpdate();
          if (int.customId == "yes") {
            await pokemonUtils.update(int.user.id, pokemon, true);
            released = true;
          }
        });
        collector.on("end", async () => {
          collectors.delete(interaction.user.id);
          if (released) {
            await interaction.editReply(
              `You did't release **\`${pokemon.name}\`**`
            );
          } else {
            await interaction.editReply(
              `You released **\`${pokemon.name}\`! Bye Bye!**`
            );
          }
          return;
        });
        return;
      }
    }
  },
});
