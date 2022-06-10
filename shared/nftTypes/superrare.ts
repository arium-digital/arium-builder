export interface Creator {
  username: string;
  avatar: string;
  ethaddress: string;
  ethereumAddress: string;
}

interface Creation {
  firstOwnerAddress: string;
  firstOwner: {
    username: string;
    avatar: string;
    ethaddress: string;
    ethereumAddress: string;
    minimumBid: 1;
  };
}
interface BidBase {
  bidderAddress: string;
}

interface Bidder {
  username: string;
  avatar: string;
  ethaddress: string;
  ethereumAddress: string;
  minimumBid: 0;
}

export interface Owner extends Creator {
  minimumBid: 1;
}

interface Bid extends BidBase {
  ownerAddress: string;
  amount: number;
  bidder: Bidder;
  owner: Owner;
}

export interface AcceptBid {
  bidder?: Owner;
  seller?: Owner;
  usdAmount?: number;
  amount: number;
}

interface CancelBid {
  bidderAddress: string;
  ownerAdderss: string;
  amount: number;
  bidder: Bidder;
  owner: Owner;
}

export interface AuctionBid extends BidBase {
  eventId: string;
  amount: number;
  startedAuction: false;
  auction: any;
  bidder: Bidder;
  Owner: Owner;
}

interface AuctionEnded {
  blockNumber: string;
  amount: number;
  usdAmount: number;
  bidderAddress: string;
  bidder: Bidder;
}

interface AuctionStarted {
  blockNumber: string;
  auction: {
    minimumBid: string;
    auctionCreatorAddress: string;
  };
  auctionCreator: Owner;
}

export type BidEvent = {
  nftEventType: "BID";
  bid?: Bid;
};

export type AcceptBidEvent = {
  nftEventType: "ACCEPT_BID";
  acceptBid?: AcceptBid;
};

export type AuctionBidEvent = {
  nftEventType: "AUCTION_BID";
  auctionBid: AuctionBid;
};

export type SalePriceSetEvent = {
  nftEventType: "SALE_PRICE_SET";
  salePriceSet: {
    amount: number;
  };
};

export type AuctionStartedEvent = {
  nftEventType: "AUCTION_STARTED";
  auctionStarted: AuctionStarted;
};

export type ScheduledAuctionStartedEvent = {
  nftEventType: "SCHEDULED_AUCTION_STARTED";
  scheduledAuctionStarted: AuctionStarted;
};

export type AuctionEndedEvent = {
  nftEventType: "AUCTION_ENDED";
  auctionEnded: AuctionEnded;
};

export type CreationEvent = {
  nftEventType: "CREATION";
  creation: Creation;
};

export type CancelBidEvent = {
  nftEventType: "CANCEL_BID";
  cancelBid: CancelBid;
};

export type TransferNft = {
  from: Owner;
  to: Owner;
};

export type TransferEvent = {
  nftEventType: "TRANSFER";
  transfer: TransferNft;
};

export type Sale = {
  buyer: Owner;
  seller: Owner;
  usdAmount: number;
  amount: number;
};

export type SaleEvent = {
  nftEventType: "SALE";
  sale: Sale;
};

export type SuperrareEvent = {
  timestamp: string;
  id: string;
  nftEventType?: string;
} & (
  | CreationEvent
  | BidEvent
  | CancelBidEvent
  | AuctionBid
  | AuctionStartedEvent
  | SalePriceSetEvent
  | AuctionBidEvent
  | AuctionEndedEvent
  | ScheduledAuctionStartedEvent
  | TransferEvent
  | SaleEvent
);

interface NftImage {
  imageMedium: string | null;
  imageSmall: string | null;
  imageBlurred: string | null;
  imageVideoSmall: null | null;
  imageVideoMedium: null | null;
}

export interface Media {
  uri: string;
  size: string;
  mimeType: string;
  dimensions: string;
}
export interface Metadata {
  name: string;
  tags: string[];
  image: string;
  media: Media;
  createdBy: string;
  description: string;
  yearCreated: string;
}

type AuctionState = "RUNNING_AUCTION" | "PENDING_AUCTION";
type AuctionType = "SCHEDULED_AUCTION";

export interface Auction {
  id: string;
  tokenId: number;
  auctionState: AuctionState;
  auctionContractAddress: string;
  lengthOfAuction: string;
  startingBlock: string;
  reservePrice: string;
  minimumBid: string;
  auctionType: AuctionType;
  auctionCreatorAddress: "0x0da07e67c2ca3a3cfcb58af115e1c0ed64f69f96";
  allAuctionBids: StoredArrayLike<AuctionBid>;
  currentAuctionBids: StoredArrayLike<AuctionBid>;
}

export interface NftEvent {
  auctionSettled: {
    amount: string;
    usdAmount: number;
  } | null;
}

// firestore will sometimes store an array as an object with values indexed by array position
export type StoredArrayLike<T> = Array<T> | { [id: number]: T };

export interface SuperrareToken {
  events?: StoredArrayLike<SuperrareEvent>;
  nftImage: NftImage;
  image: string;
  metadata?: Metadata;
  media?: Media;
  standardImage: string;
  thumbnailImage: string;
  description: string;
  creator: Creator | null;
  owner: Owner | null;
  nftEvents: {
    nodes: StoredArrayLike<NftEvent> | null;
  } | null;
  tokenId: string;
  tags?: string[];
  editionNumber: number;
  totalEditions?: number;
  currentPrice?: number;
  moreWorksByArtist: any;
  auction: Auction | null;
}

export type SuperrareContractVersion = "v1" | "v2" | "custom";
