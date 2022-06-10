import { useCallback, useEffect, useState, Fragment } from "react";
import {
  AuctionType,
  PricingInfo,
  PricingInfoData,
} from "@zoralabs/nft-hooks/dist/fetcher/AuctionInfoTypes";
import { CommonProps } from "./shared";
import { Box } from "@react-three/flex";
import {
  AuctionStateInfo,
  useZoraUsername,
  useENSAddress,
} from "@zoralabs/nft-hooks";
import { Text } from "@react-three/drei";
import { boxProps } from "./types";

export const Strings = {
  /**
   * Collected, used in the full page ownership view
   * @default Collected by:
   */
  COLLECTED: "Collected by: ",
  /**
   * Created by, used in the thumbnail image view
   */
  CREATED: "Created by: ",
  /**
   * View on zora in proof of authenticity box
   * @default View on Zora
   */
  VIEW_ZORA: "View on Zora",
  /**
   * Proof of authenticity box header
   * @default Proof of authenticity
   */
  PROOF_AUTHENTICITY: "Proof of authenticity",
  /**
   * Etherscan tx view in proof of authenticity box
   * @default View on Etherscan
   */
  ETHERSCAN_TXN: "View on Etherscan",
  /**
   * View on IPFS in proof of authenticity box
   * @default View on IPFS
   */
  VIEW_IPFS: "View on IPFS",
  /**
   * View metadata in proof of authenticity box
   * @default View Metadata
   */
  VIEW_METADATA: "View Metadata",
  /**
   * List price used in pricing components
   * @default List price
   */
  LIST_PRICE: "List price",
  /**
   * Highest Bid used in pricing components
   * @default Highest bid
   */
  HIGHEST_BID: "Highest bid",
  /**
   * Reserve price used in pricing components
   * @default Reserve price
   */
  RESERVE_PRICE: "Reserve price",
  /**
   * Top bid used in pricing components
   * @default Top bid
   */
  TOP_BID: "Top bid",
  /**
   * Sold for used in pricing components
   * @default Sold for
   * @group test
   */
  SOLD_FOR: "Sold for",
  /**
   * Created by text in preview card
   */
  CARD_CREATED_BY: "Created by",
  /**
   * Owned by text in preview card
   */
  CARD_OWNED_BY: "Owned by",
  /**
   * Ends in used in pricing components
   * @default Ends in
   */
  ENDS_IN: "Ends in",
  /**
   * Creator, used in the full page ownership view
   * @default Creator
   */
  CREATOR: "Creator",
  /**
   * Owner, used in the full page ownership view
   * @default Owner
   */
  OWNER: "Owner",
  /**
   * Used for full page when the auction ends
   * @default Auction ends
   */
  AUCTION_ENDS: "Auction ends",
  /**
   * Bidder display for full auction page
   * @default Bidder
   */
  BIDDER: "Bidder",
  /**
   * Header for NFT / bid history box on full view page
   * @default History
   */
  NFT_HISTORY: "History",
  /**
   * Title for auction duration informationbox
   * @default Auction duration
   */
  AUCTION_PENDING_DURATION: "Duration",
  /**
   * Header for the box to show creator equity
   * @default Creator equity
   */
  CREATOR_EQUITY: "Creator equity",
  /**
   * Information for curator fee box header
   * @default Curator fee
   */
  CURATOR_FEE: "Curator fee",
  /**
   * Header showing curator information on NFT full page
   * @default  of proceeds go to
   */
  CURATOR_PROCEEDS_DESC: " of proceeds go to",
  /**
   * Sold for view on full view page auction info box
   * @default Sold for
   */
  AUCTION_SOLD_FOR: "Sold for",
  /**
   * Placed a bid message for bid history box on full view page
   * @default placed a bid of
   */
  BID_HISTORY_BID: "placed a bid of",
  /**
   * Open offers from user box
   * @default Open offers
   */
  OPEN_OFFERS: "Open offers",
  /**
   * CTA to go to zora website to place a bid
   * @default Place bid
   */
  PLACE_BID: "Place bid",
  /**
   * CTA to go to zora website to place an offer
   * @default Place offer
   */
  PLACE_OFFER: "Place offer",
  /**
   * Winner of the auction on the full view page
   * @default Winner
   */
  WINNER: "Winner",
  /**
   * Listed in bid history text
   * @default listed the NFT
   */
  BID_HISTORY_LISTED: "listed the NFT",
  /**
   * Won the auction in bid history text
   * @default won the auction
   */
  BID_HISTORY_WON_AUCTION: "won the auction",
  /**
   * Link to transaction details from bid history
   * @default View Transaction
   */
  BID_HISTORY_VIEW_TRANSACTION: "View Transaction",
  /**
   * Minted by bid history text
   * @default minted the NFT
   */
  BID_HISTORY_MINTED: "minted the NFT",
  /**
   * Shown on media proposal card for proposed by user
   * @default Proposed by
   */
  PROPOSED_BY: "Proposed by",
  /**
   * Shown on media proposal card for curator share
   * @default Curator share
   */
  PROPOSAL_CURATOR_SHARE: "Curator share",
  /**
   * Shown on media proposal card for accepted auctions
   * @default Accepted
   */
  PROPOSAL_ACCEPTED: "Accepted",
  /**
   * String to show while pricing is loading
   * @default ...
   */
  PRICING_LOADING: "...",
  /**
   * No pricing placeholder, shown if no pricing information
   * exists but content is loaded
   * @default --
   */
  NO_PRICING_PLACEHOLDER: "--",
  /**
   * Play audio button description text
   *
   * @default Play audio
   */
  AUDIO_CONTROLS_PLAY: "Play audio",
  /**
   * Pause audio description text
   *
   * @default Pause audio
   */
  AUDIO_CONTROLS_PAUSE: "Pause audio",
  /**
   * aria-label for video controls container, announced when user selects video controls
   *
   * @default Video playback controls
   */
  VIDEO_CONTROLS_LABEL: "Video playback controls",
  /**
   * Fullscreen button accessible label
   * i
   * @default Fullscreen
   */
  VIDEO_CONTROLS_FULLSCREEN: "Fullscreen",
  /**
   * Play video button description text
   *
   * @default Play
   */
  VIDEO_CONTROLS_PLAY: "Play",
  /**
   * Pause video description text
   *
   * @default Pause
   */
  VIDEO_CONTROLS_PAUSE: "Pause",
  /**
   * Mute video controls description text
   *
   * @default Mute
   */
  VIDEO_CONTROLS_MUTE: "Mute",
  /**
   * Properties component title text
   *
   * @default Properties
   */
  PROPERTIES_TITLE: "Properties",
};

export type InfoContainerProps = {
  children: React.ReactNode;
  titleString: keyof typeof Strings;
  bottomPadding?: boolean;
};

const pricingString = ({
  pricing,
  showUSD = true,
}: {
  pricing: PricingInfo | undefined;
  showUSD?: boolean;
}) => {
  const { format } = new Intl.NumberFormat(
    typeof window === "undefined" ? "en-US" : navigator.language,
    {
      style: "decimal",
      maximumFractionDigits: 8,
    }
  );

  if (!pricing) return null;
  const pricingAmount = `${format(parseFloat(pricing.prettyAmount))} ${
    pricing.currency.symbol
  }`;
  const computedValue =
    showUSD &&
    pricing.computedValue &&
    `${format(parseInt(pricing.computedValue?.inUSD, 10))}`;

  return {
    pricingAmount,
    computedValue,
  };
};

const sectionMargin = 0.05;

const AddressView = ({
  address,
  showChars,
  prefix,
  ...rest
}: CommonProps & {
  address: string;
  showChars?: number;
  prefix: string;
}) => {
  // @ts-ignore (address can be undefined but not typed correctly for now)
  const ens = useENSAddress(address);
  const username = useZoraUsername(address);

  const addressFirst = address.slice(0, showChars || 6);
  const addressLast = address.slice(address.length - (showChars || 6));

  let text: string | null = null;

  if (ens.data) {
    text = ens.data;
  } else if (username.username?.username) {
    text = `@${username.username.username}`;
  }

  // Username loading
  else if (!username?.error && !username?.username) {
    text = "...";
  }

  // Ens loading
  else if (!ens.error && !ens.data) {
    text = "...";
  } else {
    text = `${addressFirst}...${addressLast}`;
  }

  return <StandardText {...rest} text={`${prefix}: ${text}`} />;
};

const HeaderText = ({
  text,
  fontSizes,
  maxWidth,
  fonts,
  visible,
}: {
  text: string;
} & CommonProps) => (
  <Box marginTop={sectionMargin} {...boxProps}>
    <Text
      fontSize={fontSizes.subHeader}
      {...fonts.bold}
      maxWidth={maxWidth}
      visible={visible}
    >
      {text}
    </Text>
  </Box>
);

const StandardText = ({
  text,
  fontSizes,
  maxWidth,
  fonts,
  visible,
}: {
  text: string;
} & CommonProps) => (
  <Box {...boxProps}>
    <Text
      fontSize={fontSizes.body}
      {...fonts.standard}
      maxWidth={maxWidth}
      visible={visible}
    >
      {text}
    </Text>
  </Box>
);

export type CountdownDisplayProps = {
  from?: number | string;
  to: number | string;
};

function getNumber(time: number | string) {
  if (typeof time === "string") {
    return parseInt(time, 10);
  }
  return time;
}

export const TimeDisplayMap = {
  d: "day",
  h: "hour",
  m: "minute",
  s: "second",
};

export const splitDurationSegments = (difference: number) => ({
  d: Math.floor(difference / (3600 * 24)),
  h: Math.floor(difference / 3600) % 24,
  m: Math.floor((difference / 60) % 60),
  s: Math.floor(difference % 60),
});

const getTimeLeft = (to: number, from?: number) => {
  if (from === undefined) {
    return null;
  }
  let difference = to - from;

  if (difference < 0) {
    difference = 0;
  }

  return splitDurationSegments(difference);
};

export const DurationDisplay = ({
  duration,
  ...rest
}: { duration: number; prefix: string } & CommonProps) => {
  const renderSegmentText = (
    segmentName: keyof typeof splitDurationSegments,
    segmentValue: number
  ) => {
    if (segmentValue === 0) {
      return "";
    }
    if (segmentValue === 1) {
      return `${segmentValue} ${TimeDisplayMap[segmentName]}`;
    }
    return `${segmentValue} ${TimeDisplayMap[segmentName]}s`;
  };
  const durationSegments = splitDurationSegments(duration);
  const singleSegment = Object.values(durationSegments)
    .map((segment) => segment === 0)
    .reduce((last, now) => last + (now ? 0 : 1), 0);
  if (singleSegment <= 1) {
    return (
      <Fragment>
        {Object.keys(durationSegments)
          .map((segment: string) =>
            // @ts-ignore: ignoring due to key type erasure with string
            renderSegmentText(segment, durationSegments[segment])
          )
          .join("")}
      </Fragment>
    );
  }
  return <CountdownDisplay from={0} to={duration} {...rest} />;
};

export const CountdownDisplay = (
  props: CountdownDisplayProps & CommonProps & { prefix?: string }
) => {
  const [timeLeft, setTimeLeft] = useState<{
    d: number;
    h: number;
    m: number;
    s: number;
  } | null>(
    getTimeLeft(
      getNumber(props.to),
      getNumber(
        props.from === undefined ? new Date().getTime() / 1000 : props.from
      )
    )
  );
  const updateTimeLeft = useCallback(() => {
    setTimeLeft(
      getTimeLeft(
        getNumber(props.to),
        getNumber(
          props.from === undefined ? new Date().getTime() / 1000 : props.from
        )
      )
    );
  }, [props.to, props.from]);

  useEffect(() => {
    const checkTimeout = setInterval(updateTimeLeft, 1000);
    return () => {
      clearInterval(checkTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!timeLeft) {
    return <Fragment />;
  }

  const timeString = [
    [timeLeft.d, "d"],
    [timeLeft.h, "h"],
    [timeLeft.m, "m"],
    [timeLeft.s, "s"],
  ]
    .filter((n) => n !== null)
    .reduce((lastString, [number, postfix]) => {
      if (!lastString.length && number === 0) {
        return "";
      }
      return `${lastString} ${number}${postfix}`;
    }, "");

  return (
    <StandardText {...props} text={`${props.prefix}: ${timeString || "0s"}`} />
  );
};

const AuctionInfoDisplay = ({
  pricing,
  showPerpetual = true,
  ...rest
}: { pricing?: PricingInfoData; showPerpetual?: boolean } & CommonProps) => {
  if (!pricing) {
    return <></>;
  }

  if (pricing.status === AuctionStateInfo.NO_PRICING) {
    return <></>;
  }

  if (
    pricing.status === AuctionStateInfo.PERPETUAL_ASK &&
    showPerpetual &&
    pricing
  ) {
    const pricingStrings = pricingString({
      pricing: pricing.perpetual?.ask?.pricing,
      showUSD: true,
    });
    return (
      <>
        {pricingStrings && (
          <>
            <HeaderText
              {...rest}
              text={`${Strings.LIST_PRICE}: ${pricingStrings.pricingAmount}`}
            />
            {/* <AuctionInfoWrapper titleString="LIST_PRICE">
            <PricingString pricing={pricing.perpetual.ask.pricing} />
            </AuctionInfoWrapper> */}
          </>
        )}
        <StandardText {...rest} text="Be the first one to bid on this piece!" />
      </>
    );
  }

  const reserve = pricing.reserve;

  if (
    pricing.reserve &&
    pricing.reserve.current.likelyHasEnded &&
    (pricing.reserve.status === "Finished" ||
      pricing.reserve.status === "Active")
  ) {
    const highestPreviousBid =
      pricing.reserve.currentBid || pricing.reserve.previousBids[0];
    const pricingStrings = pricingString({
      pricing: highestPreviousBid.pricing,
      showUSD: true,
    });
    return (
      <>
        {pricingStrings && (
          <>
            <HeaderText {...rest} text={Strings.AUCTION_SOLD_FOR} />
            <StandardText {...rest} text={pricingStrings.pricingAmount} />
            <AddressView
              {...rest}
              prefix={Strings.WINNER}
              address={highestPreviousBid.bidder.id}
            />
          </>
        )}
      </>
    );
  }

  if (
    reserve !== undefined &&
    !reserve.current.likelyHasEnded &&
    reserve.expectedEndTimestamp &&
    reserve.current.highestBid !== undefined
  ) {
    const pricingStrings = pricingString({
      pricing: reserve.current.highestBid.pricing,
      showUSD: true,
    });

    return (
      <>
        {pricingStrings && (
          <>
            <CountdownDisplay
              prefix={Strings.AUCTION_ENDS}
              to={reserve.expectedEndTimestamp}
              {...rest}
            />
            <StandardText
              {...rest}
              text={`${Strings.HIGHEST_BID}: ${pricingStrings.pricingAmount}`}
            />
            <AddressView
              {...rest}
              prefix={Strings.BIDDER}
              address={reserve.current.highestBid?.placedBy}
            />
          </>
        )}
      </>
      // <AuctionInfoWrapper titleString="AUCTION_ENDS">
      //   <div {...getStyles("pricingAmount")}>
      //     <CountdownDisplay to={reserve.expectedEndTimestamp} />
      //   </div>
      //   <div {...getStyles("fullInfoSpacer")} />
      //   <div {...getStyles("fullLabel")}>{getString("HIGHEST_BID")}</div>
      //   <div {...getStyles("fullInfoAuctionPricing")}>
      //     <PricingString pricing={reserve.current.highestBid.pricing} />
      //   </div>
      //   <div {...getStyles("fullInfoSpacer")} />
      //   <div {...getStyles("fullLabel")}>{getString("BIDDER")}</div>
      //   <AddressView address={reserve.current.highestBid?.placedBy} />
      // </AuctionInfoWrapper>
    );
  }

  if (
    showPerpetual &&
    pricing.auctionType === AuctionType.PERPETUAL &&
    pricing.perpetual.highestBid
  ) {
    const pricingStrings = pricingString({
      pricing: pricing.perpetual.highestBid?.pricing,
      showUSD: true,
    });
    return (
      pricingStrings && (
        <StandardText
          {...rest}
          text={`${Strings.HIGHEST_BID}: ${pricingStrings.pricingAmount}`}
        />
      )
    );
  }

  if (!showPerpetual && pricing.auctionType === AuctionType.PERPETUAL) {
    return <Fragment />;
  }

  const headerString =
    pricing.auctionType === AuctionType.PERPETUAL
      ? Strings.LIST_PRICE
      : Strings.RESERVE_PRICE;

  if (pricing.auctionType === AuctionType.PERPETUAL && pricing.perpetual.ask) {
    const pricingStrings = pricingString({
      pricing: pricing.perpetual.ask.pricing,
      showUSD: true,
    });

    return (
      <HeaderText
        {...rest}
        text={`${headerString}: ${pricingStrings?.pricingAmount}`}
      />
    );
  }

  if (
    pricing.auctionType === AuctionType.RESERVE &&
    pricing.reserve?.reservePrice
  ) {
    const pricingStrings = pricingString({
      pricing: pricing.reserve.reservePrice,
      showUSD: true,
    });

    return (
      <>
        <HeaderText
          {...rest}
          text={`${headerString}: ${pricingStrings?.pricingAmount}`}
        />
        <DurationDisplay
          prefix={Strings.AUCTION_PENDING_DURATION}
          duration={pricing.reserve.duration}
          {...rest}
        />
      </>
    );
  }

  return null;
  // return (
  //   <>
  //     {pricing.auctionType === AuctionType.PERPETUAL &&
  //       pricing.perpetual.ask && (
  //         <div>
  //           <PricingString pricing={ } />
  //         </div>
  //       )}
  //     && (
  //     <>
  //       <div {...getStyles("fullInfoAuctionPricing")}>
  //         <PricingString pricing={pricing.reserve.reservePrice} />
  //       </div>
  //       <div>
  //         <div {...getStyles("fullInfoSpacer")} />
  //         <div {...getStyles("fullLabel")}>
  //           {getString("AUCTION_PENDING_DURATION")}
  //         </div>
  //       </div>
  //     </>
  //       )}
  //   </div>
  //     </>
};

export default AuctionInfoDisplay;
