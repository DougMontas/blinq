import cron from "node-cron";
import { runPhaseTwoInvites } from "../cron/checkInvites";

cron.schedule("*/1 * * * *", async () => {
  console.log("⏰ Checking for expired job invitations...");
  await runPhaseTwoInvites();
});
