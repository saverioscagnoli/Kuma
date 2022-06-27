import { Message } from "discord.js";
import { Command } from "../../typings/Command";
import { utils } from "../../utils/general";

export default new Command({
  name: "guess-the-number",
  description: "Guess a number",
  execute: async ({ interaction }) => {
    const num = utils.rng(1, 100);
    await interaction.editReply(
      `I chose a number between **\`1\`** and **\`100\`**! Try to guess it by typing in the chat!
        PS: You have only **\*5\*** guesses!`
    );
    const filter = (msg: Message) => {
      const guess = Number(msg.content);
      if (isNaN(guess) || msg.author.bot) return false;
      if (guess < 1 || guess > 100) return false;
      return msg.author.id == interaction.user.id;
    };
    const collector = interaction.channel.createMessageCollector({
      filter,
      max: 5,
      time: 120000,
    });
    let guessed = false;
    let i = 0;
    collector.on("collect", async (msg) => {
      i++;
      const guess = Number(msg.content);
      if (guess == num) {
        guessed = true;
        collector.stop();
      } else {
        let str: string;
        if (guess < num) {
          str = "Higher!";
        } else {
          str = "Lower!";
        }
        if (i < 5) {
          await interaction.channel.send(str);
        }
      }
    });
    collector.on("end", async (coll) => {
      if (coll.size == 0) {
        await interaction.editReply("Match canceled!");
        return;
      }
      if (guessed) {
        await interaction.channel.send(
          `You guessed it! The number was \`${num}\`!`
        );
      } else {
        await interaction.channel.send(
          `You didn't get it! The number was \`${num}\`! :(`
        );
      }
      return;
    });
  },
});
