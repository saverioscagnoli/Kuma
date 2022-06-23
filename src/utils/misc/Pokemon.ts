import {
  IPokemonAbility,
  IPokemonBaseStats,
  IPokemonChain,
  IPokemonData,
  Move,
} from "pkmnapi";

export interface IClientPokemon {
  name: string;
  types: string[];
  level: number;
  abilities: IPokemonAbility[];
  gender: string;
  base_stats: IPokemonBaseStats;
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
    gender?: string,
  ) {
    this.name = name;
    this.types = types;
    this.level = level;
    this.abilities = abilities;
    this.gender = gender;
    this.base_stats = base_stats;
    this.data = data;
    this.evolution_chain = evolution_chain;
    this.moves = moves;
    this.sprite = sprite;
  }
}
