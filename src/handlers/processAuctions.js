import { catchBlockCode } from "auction-service-common";
import { getEndedAuctions } from "../lib/getEndedAuctions";

async function processAuctions(event) {
    try {
        console.log(`Processing Auctions!`);
        const auctionsToClose = await getEndedAuctions();
        console.log(auctionsToClose);
    } catch (error) {
        catchBlockCode(error);
    }
}

export const handler = processAuctions;