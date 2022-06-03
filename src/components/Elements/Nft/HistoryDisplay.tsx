import React, { useMemo, Fragment, useCallback, memo } from "react";
import {
  AuctionBidEvent,
  AuctionEndedEvent,
  AuctionStartedEvent,
  ScheduledAuctionStartedEvent,
  BidEvent,
  CreationEvent,
  SaleEvent,
  SuperrareEvent,
  TransferEvent,
  StoredArrayLike,
  AcceptBidEvent,
  AcceptBid,
} from "../../../../shared/nftTypes/superrare";
import { Fonts, FontSizes } from "./shared";
import { Text } from "@react-three/drei";
import { toFormattedEthAndUsdString, toFormattedEthString } from "./boxUtils";
import { Box, Flex, useReflow } from "@react-three/flex";
import { SuperrareTokenHistory } from "../../../../shared/nftTypes";
import { boxProps } from "./types";

function parseAcceptBidEvent(acceptBid: AcceptBid | undefined) {
  if (!acceptBid) return;
  const { bidder, seller, amount, usdAmount } = acceptBid;

  if (!seller || !bidder) return;

  return `@${seller.username} accepted an offer of ${toFormattedEthAndUsdString(
    amount,
    usdAmount
  )} from @${bidder.username}`;
}

const formatEventString = (event: SuperrareEvent) => {
  switch (event.nftEventType) {
    case "CREATION":
      return `@${
        (event as CreationEvent).creation?.firstOwner?.username
      } minted`;

    case "BID":
      const bidEvent = event as BidEvent;
      const bid = bidEvent.bid;

      if (!bid?.bidder?.username || !bid?.amount) return null;

      return `@${bid?.bidder?.username} offered ${toFormattedEthString(
        bid?.amount
      )}`;

    case "SCHEDULED_AUCTION_STARTED":
    case "AUCTION_STARTED":
      const { auctionCreator } =
        (event as AuctionStartedEvent).auctionStarted ||
        (event as ScheduledAuctionStartedEvent).scheduledAuctionStarted;

      return `@${auctionCreator.username} started auction`;

    case "AUCTION_BID":
      const auctionBidEvent = event as AuctionBidEvent;
      const auctionBid = auctionBidEvent.auctionBid;
      // const bid = auctionBidEvent.auctionBid;

      if (!auctionBid?.bidder?.username || !auctionBid?.amount) return null;

      return `@${auctionBid?.bidder?.username} bid ${toFormattedEthString(
        auctionBid?.amount
      )}`;

    case "AUCTION_ENDED":
      const auctionEnded = (event as AuctionEndedEvent).auctionEnded;

      return `@${
        auctionEnded.bidder?.username
      } won auction with a bid of ${toFormattedEthAndUsdString(
        auctionEnded.amount,
        auctionEnded.usdAmount
      )}`;

    case "TRANSFER":
      const { to } = (event as TransferEvent).transfer;

      return `transfered ${to ? `to @${to.username}` : ""}`;

    case "ACCEPT_BID":
      return parseAcceptBidEvent((event as AcceptBidEvent).acceptBid);

    case "SALE":
      const { buyer, seller, amount, usdAmount } = (event as SaleEvent).sale;

      return `@${buyer.username} bought from @${
        seller.username
      } for ${toFormattedEthAndUsdString(amount, usdAmount)}`;

    default:
      return null;
  }
};

export const formatDateTime = (dateTime: number | undefined) => {
  if (!dateTime) return null;

  const date = new Date(dateTime);

  return date.toLocaleDateString();
};

const formatEvent = (event: SuperrareEvent) => {
  const eventString = formatEventString(event);

  if (!eventString) return null;
  const dateTime = Date.parse(event.timestamp);

  return {
    dateTime,
    description: eventString,
  };
};

export function storedArrayLikeToArray<T>(
  arrayLike?: StoredArrayLike<T>
): T[] | undefined {
  if (!arrayLike) return;
  if (Array.isArray(arrayLike)) return arrayLike;

  return Object.entries(arrayLike)
    .sort(([key]) => +key)
    .map(([, value]) => value);
}

export const formatEvents = (
  eventsArrayLike: StoredArrayLike<SuperrareEvent> | undefined
) => {
  const events = storedArrayLikeToArray(eventsArrayLike);
  if (!events) return null;
  const eventsFormatted = events
    .map((event) => formatEvent(event))
    .filter((x) => x !== null);

  //   const eventsAndDates = eventsFormatted.map(
  //     event => ()
  //   )
  // const formattedEvents = eventsFormatted
  //   .map((event) => event?.description)
  //   .join("\n");

  // const formattedDates = [
  //   ...eventsFormatted.map((event) => formatDateTime(event?.dateTime)),
  // ].join("\n");

  return eventsFormatted;
  // return { formattedEvents, formattedDates };
};

const textSpacing = 0.05;

type HistoryDisplayProp = {
  token: SuperrareTokenHistory;
  fontSizes: FontSizes;
  maxWidth: number;
  fonts: Fonts;
  visible?: boolean;
  reflow: () => void;
};

const HistoryDisplay = memo(
  ({
    token,
    fontSizes,
    maxWidth,
    fonts,
    visible,
    reflow: parentReflow,
  }: HistoryDisplayProp) => {
    const eventsFormatted = useMemo(() => formatEvents(token.events), [
      token.events,
    ]);

    const thisReflow = useReflow();

    const reflow = useCallback(() => {
      thisReflow();
      setTimeout(() => {
        parentReflow();
      });
    }, [thisReflow, parentReflow]);

    // useEffect(() => {
    //   console.log({ maxWidth });

    // }, [maxWidth]);

    return (
      <>
        <>
          <Box marginBottom={textSpacing / 2} {...boxProps}>
            <Text
              fontSize={fontSizes.body}
              lineHeight={fontSizes.body * 1.1}
              {...fonts.bold}
              maxWidth={maxWidth}
              visible={visible}
              onSync={reflow}
            >
              History:
            </Text>
          </Box>
          {eventsFormatted
            ?.filter((event) => event !== null)
            .map((event) => (
              <Fragment key={event?.dateTime}>
                <Box key="a" marginTop={(textSpacing * 2) / 3} {...boxProps}>
                  <Text
                    fontSize={fontSizes.body}
                    // lineHeight={fontSizes.body * 4}
                    {...fonts.standard}
                    maxWidth={maxWidth}
                    visible={visible}
                    // @ts-ignore
                    // whiteSpace="nowrap"
                    whiteSpace="overflowWrap"
                    onSync={reflow}
                    // clipRect={[0, 0, maxWidth, 1]}
                  >
                    {event?.description}
                  </Text>
                </Box>
                <Box key="b" marginTop={textSpacing / 3} {...boxProps}>
                  <Text
                    fontSize={fontSizes.body / 2}
                    lineHeight={fontSizes.body / 2}
                    visible={visible}
                    {...fonts.bold}
                    // position-y={-0.05}
                    // @ts-ignore
                    // whiteSpace="nowrap"
                    maxWidth={maxWidth}
                    onSync={reflow}
                  >
                    {formatDateTime(event?.dateTime)}
                  </Text>
                </Box>
              </Fragment>
            ))}
          {/* <Box>
          <Text
            fontSize={fontSizes.body}
            lineHeight={fontSizes.body * 32}
            {...fonts.standard}
            maxWidth={maxWidth}
            visible={visible}
            // @ts-ignore
            whiteSpace="nowrap"
            onSync={reflow}
          // clipRect={[0, 0, maxWidth, 1]}
          >
            {formattedEvents}
          </Text>

          <Text
            fontSize={fontSizes.body / 2}
            lineHeight={fontSizes.body * 64}
            visible={visible}
            {...fonts.bold}
            position-y={-0.05}
            // @ts-ignore
            whiteSpace="nowrap"
            maxWidth={maxWidth}
            onSync={reflow}
          >
            {formattedDates}
          </Text>
        </Box> */}
        </>
      </>
    );
  }
);

const HistoryDisplayWrapper = (props: HistoryDisplayProp) => {
  return (
    <Box {...boxProps}>
      <Flex {...boxProps}>
        <HistoryDisplay {...props} />
      </Flex>
    </Box>
  );
};

export default HistoryDisplayWrapper;
