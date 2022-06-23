import { MessageAttachment } from "discord.js";
import { Command } from "../../typings/Command";
import figlet from "figlet";

export default new Command({
  name: "ascii",
  description: "Send your message in an ASCII way1!",
  options: [
    {
      name: "message",
      description: "The message you want to send.",
      type: "STRING",
      required: true,
    },
  ],
  execute: async ({ interaction, args }) => {
    const str: string = args.getString("message");
    await figlet(str, async (e: Error, data: string) => {
      if (e) {
        console.log(e);
        await interaction.editReply(process.env.ERROR_MESSAGE);
        return;
      }
      const atc = new MessageAttachment(
        Buffer.from(data, "ascii"),
        "coolmsg.txt"
      );
      await interaction.editReply({
        files: [atc],
      });
      return;
    });
    return;
  },
});
