import { catchBlockCode } from "auction-service-common";
import { getEndedAuctions } from "../lib/getEndedAuctions";
import { closeAuction } from "../lib/closeAuction";

// CLosing auctions exceeding 1hour of creation
async function processAuctions(event) {
  try {
    console.log(`Processing Auctions!`);
    const auctionsToClose = await getEndedAuctions();
    const promises = auctionsToClose.map((auction) => closeAuction(auction));
    await Promise.all(promises);
    return { closed: promises.length };
  } catch (error) {
    catchBlockCode(error);
  }
}

export const handler = processAuctions;