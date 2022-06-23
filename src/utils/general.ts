import { createCanvas, loadImage } from "canvas";
import {
  CacheType,
  ColorResolvable,
  EmbedFooterData,
  InteractionCollector,
  MessageActionRow,
  MessageAttachment,
  MessageComponentInteraction,
  MessageEmbed,
} from "discord.js";
import { client } from "..";
import { Schema } from "../typings/Schema";
import { ClientPokemon } from "./misc/Pokemon";
import { types } from "./misc/Types";

export const utils = {
  rng(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  pick(array: any[], picked: number = 1, unique: boolean = false): [] | any {
    if (picked > array.length && unique) return undefined;
    const pickedArr: any[] = [];
    while (picked > pickedArr.length) {
      let index = utils.rng(0, array.length - 1);
      if (unique) {
        while (pickedArr.includes(array[index])) {
          index = utils.rng(0, array.length - 1);
        }
      }
      pickedArr.push(array[index]);
    }
    return picked == 1 ? pickedArr[0] : pickedArr;
  },
  bool(likelyhood: number) {
    return utils.rng(0, 100) < likelyhood;
  },
  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
  toMS(hours: number): number {
    return hours * 360000;
  },
  Embed(
    title: string,
    description: string,
    thumbnail?: string,
    image?: string,
    color?: ColorResolvable,
    footer?: EmbedFooterData
  ): MessageEmbed {
    return new MessageEmbed()
      .setTitle(title)
      .setDescription(description)
      ?.setThumbnail(thumbnail)
      ?.setImage(image)
      ?.setColor(color)
      ?.setFooter(footer ? footer : null);
  },
  manageCollectors(id: string) {},
  updateButtons(actionRow: MessageActionRow, disable: boolean = true) {
    for (let i = 0; i < actionRow.components.length; i++) {
      actionRow.components[i].setDisabled(disable);
    }
  },
};

export const pokemonUtils = {
  async setInEmbed(pokemon: ClientPokemon, wild: boolean, username: string) {
    const canvas = createCanvas(pokemon.types.length == 1 ? 100 : 200, 100);
    const ctx = canvas.getContext("2d");
    for (let i = 0; i < pokemon.types.length; i++) {
      const img = await loadImage(types.get(pokemon.types[i]));
      if (i == 1) {
        ctx.drawImage(img, 100, 0, 100, 100);
      } else {
        ctx.drawImage(img, 0, 0, 100, 100);
      }
    }
    const atc = new MessageAttachment(
      canvas.toBuffer("image/png"),
      "types.png"
    );
    const embed = utils.Embed(
      wild
        ? `**A wild ${pokemon.name} appeared!**`
        : `**${username.endsWith("s") ? username + "'" : username + "'s"} ${
            pokemon.name
          }**`,
      `**Level: \`${pokemon.level}\`
        HP: \`${pokemon.base_stats.hp}\`
        Attack: \`${pokemon.base_stats.attack}\`
        Defense: \`${pokemon.base_stats.defense}\`
        Special Attack: \`${pokemon.base_stats.special_attack}\`
        Special Defense: \`${pokemon.base_stats.special_defense}\`
        Speed: \`${pokemon.base_stats.speed}\`
        
        Moves: 
        1. \`${pokemon.moves[0].name}\`
        2. \`${pokemon.moves[1].name}\`
        3. \`${pokemon.moves[2].name}\`
        4. \`${pokemon.moves[3].name}\`**`,
      "attachment://types.png",
      pokemon.sprite,
      pokemon.data.pokedex_color == "gray"
        ? "GREY"
        : pokemon.data.pokedex_color == "pink"
        ? "LUMINOUS_VIVID_PINK"
        : (pokemon.data.pokedex_color.toUpperCase() as ColorResolvable)
    );
    return { embed, atc };
  },
  async update(id: string, pokemon: ClientPokemon, releasing: boolean = false) {
    if (releasing) {
      client.database.pull(`${id}.pokemons`, pokemon);
    } else {
      client.database.push(`${id}.pokemons`, pokemon);
    }
  },
  async Catch(
    int: MessageComponentInteraction,
    ballModifier: number,
    embed: MessageEmbed,
    actionRow: MessageActionRow,
    pokemon: ClientPokemon,
    collector: InteractionCollector<MessageComponentInteraction<CacheType>>
  ) {
    utils.updateButtons(actionRow);
    await int.editReply({
      embeds: [embed],
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
      embed.setFooter({
        text: `${i} shake${i > 1 ? "s" : ""}...`,
      });
      await int.editReply({
        embeds: [embed],
      });
      await utils.sleep(1500);
      if (rnd >= catched) {
        embed.setFooter({
          text: `Oh no! ${pokemon.name} broke free!`,
        });
        utils.updateButtons(actionRow, false);
        await int.editReply({
          embeds: [embed],
          components: [actionRow],
        });
        return false;
      }
    }
    collector.stop();
    embed.setFooter({
      text: `Yes! ${pokemon.name} was caught!`,
    });
    await pokemonUtils.update(int.user.id, pokemon);
    await int.editReply({
      embeds: [embed],
    });
    return true;
  },
};
