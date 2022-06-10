import React from "react";
import { CommonProps, sectionMargin } from "../shared";
import HistoryDisplay from "../HistoryDisplay";
import { Box } from "@react-three/flex";
import { Text } from "@react-three/drei";
import { toFormattedEthString } from "../boxUtils";

import { HasSuperrareNft } from "../../../../../shared/nftTypes";
import { boxProps } from "../types";

export const SuperrareAuctionInfo = ({
  config,
  fontSizes,
  fonts,
  maxWidth,
  visible,
  reflow,
  sdfGlyphSize,
}: { config: HasSuperrareNft } & CommonProps & {
    sdfGlyphSize: number;
  }) => {
  const tokenHistory = config.superrareTokenHistory;

  return (
    <>
      {tokenHistory?.auction?.reservePrice && (
        <Box marginTop={sectionMargin} {...boxProps}>
          <Text
            fontSize={fontSizes.subHeader}
            {...fonts.bold}
            onSync={reflow}
            maxWidth={maxWidth}
            visible={visible}
            // @ts-ignore
            sdfGlyphSize={sdfGlyphSize}
          >
            Reserve Price:{" "}
            {toFormattedEthString(+tokenHistory?.auction?.reservePrice)}
          </Text>
        </Box>
      )}
      {tokenHistory?.currentPrice && (
        <Box marginTop={sectionMargin} {...boxProps}>
          <Text
            fontSize={fontSizes.subHeader}
            {...fonts.bold}
            onSync={reflow}
            maxWidth={maxWidth}
            visible={visible}
            // @ts-ignore
            sdfGlyphSize={sdfGlyphSize}
          >
            List Price: {toFormattedEthString(tokenHistory?.currentPrice)}
          </Text>
        </Box>
      )}
    </>
  );
};

const SuperrareHistory = ({
  config,
  fontSizes,
  fonts,
  visible,
  maxWidth,
  reflow,
}: { config: HasSuperrareNft } & CommonProps) => {
  const tokenHistory = config.superrareTokenHistory;
  if (!tokenHistory) return null;
  return (
    <Box marginTop={sectionMargin * 2} {...boxProps}>
      <HistoryDisplay
        token={tokenHistory}
        fontSizes={fontSizes}
        maxWidth={maxWidth}
        fonts={fonts}
        visible={visible}
        reflow={reflow}
      />
    </Box>
  );
};

export default SuperrareHistory;
