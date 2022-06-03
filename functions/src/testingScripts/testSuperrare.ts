import * as superrare from "../nft/lib/superrare";

// type NFT_EVENT_TYPE = "CREATION" | "SALE_PRICE_SET" | "ACCEPT_BID" | "CANCEL_BID" | "BID" | "AUCTION_BID" | "AUCTION_ENDED" | "SCHEDULED_AUCTION_STARTED";

const main = async () => {
  const result = await superrare.getBidHistory(19319, "v2", undefined);

  // const { events } = result;
  // console.log(require('util').inspect(events, { depth: null }));
  // console.log(events);
  // delete result.events;
  // delete result.moreWorksByArtist;
  delete result.events;
  console.log(require("util").inspect(result, { depth: null }));
};

main();
