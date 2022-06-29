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
    const typesAtc = new MessageAttachment(
      canvas.toBuffer("image/png"),
      "types.png"
    );
    let genderEmoji: string;
    if (pokemon.gender == "male") {
      genderEmoji = process.env.EMOJI_MALE;
    } else if (pokemon.gender == "female") {
      genderEmoji = process.env.EMOJI_FEMALE;
    }
    const embed = utils.Embed(
      wild
        ? `**A wild ${pokemon.name} ${genderEmoji} appeared!**`
        : `**${username.endsWith("s") ? username + "'" : username + "'s"} ${
            pokemon.name
          } ${genderEmoji}**`,
      `**Level: \`${pokemon.level}\`
        HP: \`${pokemon.stats.hp}\`
        Attack: \`${pokemon.stats.attack}\`
        Defense: \`${pokemon.stats.defense}\`
        Special Attack: \`${pokemon.stats.special_attack}\`
        Special Defense: \`${pokemon.stats.special_defense}\`
        Speed: \`${pokemon.stats.speed}\`
        
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
    return { embed, typesAtc };
  },
  async update(id: string, pokemon: ClientPokemon, releasing: boolean = false) {
    let dbID = `${id}.pokemons`;
    const pokemons: ClientPokemon[] = await client.database.get(dbID);
    if (pokemons.length >= 6) {
      dbID = `${id}.pc`;
    }
    if (releasing) {
      pokemons.splice(
        pokemons.indexOf(pokemons.find((p) => p.name == pokemon.name)),
        1
      );
      await client.database.set(dbID, pokemons);
    } else {
      await client.database.push(dbID, pokemon);
    }
  },
  findPokemon(name: string, profileData: Schema) {
    let found: boolean | ClientPokemon = false;
    for (const pokemon of profileData.pokemons) {
      if (pokemon.name == name) {
        found = pokemon;
      }
    }
    return found;
  },
  setAllStats(pokemon: ClientPokemon) {
    return (pokemon.stats = {
      hp: calcStat(pokemon, "hp"),
      attack: calcStat(pokemon, "attack"),
      defense: calcStat(pokemon, "defense"),
      special_attack: calcStat(pokemon, "special_attack"),
      special_defense: calcStat(pokemon, "special_defense"),
      speed: calcStat(pokemon, "speed"),
    });
  },
  async levelUp(id: string) {
    const team: ClientPokemon[] = await client.database.get(`${id}.pokemons`);
    if (team.length < 1) return false;
    const pokemon: ClientPokemon = utils.pick(team);
    await client.database.set(
      `${id}.pokemons[${team.indexOf(pokemon)}].exp`,
      (pokemon.exp += utils.rng(20, 35))
    );
    console.log(pokemon.name);
    console.log(pokemon.exp);
    if (pokemon.exp >= 100) {
      await client.database.set(
        `${id}.pokemons[${team.indexOf(pokemon)}].level`,
        (pokemon.level += 1)
      );
      await client.database.set(
        `${id}.pokemons[${team.indexOf(pokemon)}].exp`,
        0
      );
      await client.database.set(
        `${id}.pokemons[${team.indexOf(pokemon)}].stats`,
        pokemonUtils.setAllStats(pokemon)
      );
      return pokemon;
    } else return false;
  },
};

function calcStat(pokemon: ClientPokemon, stat: string) {
  if (stat == "hp") {
    const calc =
      Math.floor(
        0.01 *
          (2 * pokemon.base_stats.hp +
            pokemon.IVs.hp +
            Math.floor(0.25 * pokemon.EVs.hp)) *
          pokemon.level
      ) +
      pokemon.level +
      10;
    return calc;
  } else {
    const calc =
      Math.floor(
        0.01 *
          (2 * pokemon.base_stats[stat] +
            pokemon.IVs[stat] +
            Math.floor(0.25 * pokemon.EVs[stat])) *
          pokemon.level
      ) + 5;
    return calc;
  }
}
