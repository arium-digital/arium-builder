import React, { useCallback, useMemo } from "react";
import { Text } from "@react-three/drei";
import { useCurrentValueFromObservable } from "hooks/useObservable";

import { Auction } from "../../../../shared/nftTypes/superrare";

import { formatCurrentBid, toFormattedEthString } from "./boxUtils";
import { FontSizes, Fonts, sectionMargin } from "./shared";
import { ariumRed } from "css/styleVariables";
import { useTimeRemaining } from "./lib";
import { Box, Flex, useReflow } from "@react-three/flex";
import { storedArrayLikeToArray } from "./HistoryDisplay";
import { SuperrareTokenHistory } from "../../../../shared/nftTypes";
import { boxProps } from "./types";

// const CountdownText = ({
//   timeRemaining$,
//   fontSizes,
//   setMesh,
//   fonts,
//   visible,
// }: {
//   timeRemaining$: Observable<TimeRemaining>;
//   fontSizes: FontSizes;
//   setMesh: (mesh: Mesh) => void;
//   fonts: Fonts;
//   visible?: boolean;
// }) => {
//   const timeRemaining = useCurrentValueFromObservable(timeRemaining$, null);

//   return (
//     <Text
//       fontSize={fontSizes.subHeader}
//       {...fonts.standard}
//       color={ariumRed}
//       outlineWidth={fonts.bold.outlineWidth * 2}
//       outlineColor={ariumRed}
//       onSync={setMesh}
//       visible={visible}
//     >
//       {timeRemaining &&
//         `${timeRemaining.hours} hours, ${timeRemaining.minutes} minutes, ${timeRemaining.seconds} seconds`}
//     </Text>
//   );
// };

const minorMargin = sectionMargin / 4;

export const AuctionStatus = ({
  text,
  fontSizes,
  fonts,
  visible,
  maxWidth,
  reflow,
}: {
  text: string;
  fontSizes: FontSizes;
  maxWidth: number;
  fonts: Fonts;
  visible?: boolean;
  reflow: () => void;
}) => {
  return (
    <Text
      fontSize={fontSizes.body}
      {...fonts.bold}
      maxWidth={maxWidth}
      // color="white"
      // outlineColor="white"
      onSync={reflow}
      visible={visible}
    >
      {text}
    </Text>
  );
};

type RunningAuctionDisplayProps = {
  auction: Auction;
  fontSizes: FontSizes;
  fonts: Fonts;
  visible: boolean | undefined;
  maxWidth: number;
  reflow: () => void;
};

export const RunningAuctionDisplay = ({
  auction,
  fontSizes,
  fonts,
  visible,
  maxWidth,
  reflow,
}: RunningAuctionDisplayProps) => {
  const formattedCurrentBid = useMemo(() => {
    const currentAuctionBids = storedArrayLikeToArray(
      auction.currentAuctionBids
    );
    if (!currentAuctionBids || currentAuctionBids.length === 0) return "";
    return `Current high bid:\n${formatCurrentBid(
      auction.currentAuctionBids[0]
    )}`;
  }, [auction.currentAuctionBids]);

  const reservePrice = useMemo(
    () => toFormattedEthString(+auction.reservePrice),
    [auction.reservePrice]
  );

  const timeRemaining$ = useTimeRemaining({ auction });

  const timeRemaining = useCurrentValueFromObservable(timeRemaining$, null);

  return (
    <>
      <Box marginTop={sectionMargin} {...boxProps}>
        <AuctionStatus
          text="Running Auction"
          fontSizes={fontSizes}
          fonts={fonts}
          visible={visible}
          maxWidth={maxWidth}
          reflow={reflow}
        />
      </Box>
      <Box marginTop={minorMargin} {...boxProps}>
        <Text
          fontSize={fontSizes.subHeader}
          {...fonts.bold}
          onSync={reflow}
          visible={visible}
        >
          {reservePrice ? `Reserve Price Met: ${reservePrice}` : ""}
        </Text>
      </Box>
      <Box marginTop={minorMargin} {...boxProps}>
        <Text
          fontSize={fontSizes.subHeader}
          {...fonts.standard}
          color={ariumRed}
          outlineWidth={fonts.bold.outlineWidth * 2}
          outlineColor={ariumRed}
          onSync={reflow}
          visible={visible}
        >
          {timeRemaining &&
            `${timeRemaining.hours} hours, ${timeRemaining.minutes} minutes, ${timeRemaining.seconds} seconds`}
        </Text>
      </Box>
      <Box marginTop={minorMargin} {...boxProps}>
        <Text
          fontSize={fontSizes.body}
          {...fonts.bold}
          lineHeight={fontSizes.body * 25}
          onSync={reflow}
          visible={visible}
        >
          {formattedCurrentBid}
        </Text>
      </Box>
    </>
  );
};

const PendingAuctionDisplay = ({
  auction,
  fontSizes,
  fonts,
  maxWidth,
  reflow,
  visible,
}: {
  auction: Auction;
  fontSizes: FontSizes;
  fonts: Fonts;
  maxWidth: number;
  reflow: () => void;
  visible?: boolean;
}) => {
  const reservePrice = useMemo(
    () => toFormattedEthString(+auction.reservePrice),
    [auction.reservePrice]
  );

  return (
    <>
      <Box marginTop={sectionMargin} {...boxProps}>
        <AuctionStatus
          text="Pending Auction"
          fontSizes={fontSizes}
          fonts={fonts}
          maxWidth={maxWidth}
          visible={visible}
          reflow={reflow}
        />
      </Box>
      <Box {...boxProps}>
        <Text
          fontSize={fontSizes.subHeader}
          {...fonts.bold}
          onSync={reflow}
          maxWidth={maxWidth}
          visible={visible}
        >
          {reservePrice ? `Reserve Price: ${reservePrice}` : ""}
        </Text>
      </Box>
    </>
  );
};

type SuperrareAuctionDisplayProps = {
  tokenHistory: SuperrareTokenHistory;
  fontSizes: FontSizes;
  fonts: Fonts;
  maxWidth: number;
  reflow: () => void;
  visible: boolean | undefined;
};

const SuperrareAuctionDisplayInner = (props: SuperrareAuctionDisplayProps) => {
  const thisReflow = useReflow();

  const { reflow: parentReflow } = props;

  const reflow = useCallback(() => {
    thisReflow();
    setTimeout(() => {
      parentReflow();
    });
  }, [thisReflow, parentReflow]);

  if (!props.tokenHistory.auction) return null;
  return (
    <>
      {props.tokenHistory.auction.auctionState === "RUNNING_AUCTION" ? (
        <RunningAuctionDisplay
          {...props}
          auction={props.tokenHistory.auction}
          reflow={reflow}
        />
      ) : (
        <PendingAuctionDisplay
          {...props}
          auction={props.tokenHistory.auction}
          reflow={reflow}
        />
      )}
    </>
  );
};

export const SuperrareAuctionDisplay = (
  props: SuperrareAuctionDisplayProps
) => {
  return (
    <Box {...boxProps}>
      <Flex {...boxProps}>
        <SuperrareAuctionDisplayInner {...props} />
      </Flex>
    </Box>
  );
};
