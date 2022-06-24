import { ClientPokemon } from "../utils/misc/Pokemon";

export interface ISchema {
  bananas: number;
  deposit: number;
  pokeballs: number;
  greatballs: number;
  ultraballs: number;
  pokemons: ClientPokemon[];
  pc: ClientPokemon[];
  items: any[];
}

export class Schema implements ISchema {
  bananas: number;
  deposit: number;
  pokeballs: number;
  greatballs: number;
  ultraballs: number;
  pokemons: ClientPokemon[];
  pc: ClientPokemon[];
  items: any[];
  constructor(
    bananas: number,
    deposit: number,
    pokeballs: number,
    greatballs: number,
    ultraballs: number,
    pokemons: ClientPokemon[],
    pc: ClientPokemon[],
    items: any[]
  ) {
    this.bananas = bananas;
    this.deposit = deposit;
    this.pokeballs = pokeballs;
    this.greatballs = greatballs;
    this.ultraballs = ultraballs;
    this.pokemons = pokemons;
    this.pc = pc;
    this.items = items;
  }
}
