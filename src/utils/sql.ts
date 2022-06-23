import { QuickDB } from "quick.db";
import { client } from "..";
import { CommandType } from "../typings/Command";
import { Schema } from "../typings/Schema";

export const sql = {
  async checkForData(id: string) {
    let profileData: Schema;
    if (!(await client.database.get(id))) {
      profileData = await client.database.set(
        id,
        new Schema(100, 0, 20, 10, 5, [], [], [])
      );
    } else {
      profileData = await client.database.get(id);
    }
    return profileData;
  },
  async update(id: string, item: string, amount: number, profileData: Schema) {
    await client.database.set(`${id}.${item}`, profileData[item] + amount);
  },
  async checkCooldown(command: CommandType, id: string, db: QuickDB) {
    let startTime = Date.now() + command.cooldown;
    if (command.cooldown && (await client.cooldowns.get(id)) != command.name) {
      client.cooldowns.set(id, command.name);
      setTimeout(async () => {
        await db.delete(id);
      }, command.cooldown);
      return { cd: false, t: startTime };
    } else return { cd: true, t: startTime };
  },
};
