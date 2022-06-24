import {
  IPokemonAbility,
  IPokemonBaseStats,
  IPokemonChain,
  IPokemonData,
  Move,
} from "pkmnapi";
import { pokemonUtils, utils } from "../general";

export interface IClientPokemon {
  name: string;
  types: string[];
  level: number;
  abilities: IPokemonAbility[];
  gender: string;
  base_stats: IPokemonBaseStats;
  IVs: IPokemonBaseStats;
  EVs: IPokemonBaseStats;
  stats: IPokemonBaseStats;
  data: IPokemonData;
  evolution_chain: IPokemonChain[];
  sprite: string;
}

export class ClientPokemon implements IClientPokemon {
  name: string;
  types: string[];
  level: number;
  abilities: IPokemonAbility[];
  gender: string;
  base_stats: IPokemonBaseStats;
  IVs: IPokemonBaseStats;
  EVs: IPokemonBaseStats;
  stats: IPokemonBaseStats;
  data: IPokemonData;
  evolution_chain: IPokemonChain[];
  moves: Move[];
  sprite: string;
  held_item?: string;
  constructor(
    name: string,
    types: string[],
    level: number,
    abilities: IPokemonAbility[],
    base_stats: IPokemonBaseStats,
    data: IPokemonData,
    evolution_chain: IPokemonChain[],
    moves: Move[],
    sprite: string,
    gender?: string
  ) {
    this.name = name;
    this.types = types;
    this.level = level;
    this.abilities = abilities;
    this.gender = gender;
    this.base_stats = base_stats;
    this.IVs = {
      hp: utils.rng(1, 31),
      attack: utils.rng(1, 31),
      defense: utils.rng(1, 31),
      special_attack: utils.rng(1, 31),
      special_defense: utils.rng(1, 31),
      speed: utils.rng(1, 31),
    };
    this.EVs = {
      hp: utils.rng(1, 252),
      attack: utils.rng(1, 252),
      defense: utils.rng(1, 252),
      special_attack: utils.rng(1, 252),
      special_defense: utils.rng(1, 252),
      speed: utils.rng(1, 252),
    };
    this.stats = pokemonUtils.setAllStats(this);
    this.data = data;
    this.evolution_chain = evolution_chain;
    this.moves = moves;
    this.sprite = sprite;
  }
}
