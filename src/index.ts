import { GoofyAhhClient } from "./typings/Client";
import "dotenv/config";

export const client = new GoofyAhhClient();
client.build();
