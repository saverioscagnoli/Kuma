import { client } from "../..";
import { Command } from "../../typings/Command";
import { utils } from "../../utils/general";

export default new Command({
  name: "ping",
  description: "ping",
  execute: async ({ interaction, profileData }) => {
    interaction.editReply(
      `🏓Latency is ${
        Date.now() - interaction.createdTimestamp
      }ms. API Latency is ${Math.round(client.ws.ping)}ms`
    );
  },
});
