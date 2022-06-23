import { Event } from "../typings/Event";

export default new Event("ready", () => {
  console.log("Ready.");
});
