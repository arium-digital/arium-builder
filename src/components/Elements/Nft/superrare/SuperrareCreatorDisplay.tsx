import React, { useMemo } from "react";
import { CommonProps } from "../shared";
import { formatDateTime, storedArrayLikeToArray } from "../HistoryDisplay";
import { Box } from "@react-three/flex";
import { Text } from "@react-three/drei";
import { HasSuperrareNft } from "../../../../../shared/nftTypes";
import { boxProps } from "../types";

const SuperrareCreatorDisplay = ({
  fontSizes,
  maxWidth,
  config,
  fonts,
  visible,
  sdfGlyphSize,
}: {
  config: HasSuperrareNft;
} & CommonProps & {
    sdfGlyphSize: number;
  }) => {
  const createdBy = config?.token?.creator?.userName;
  const tokenEvents = config.superrareTokenHistory?.events;
  const createdOnDate = useMemo(() => {
    if (!tokenEvents) return;
    const events = storedArrayLikeToArray(tokenEvents);

    const createdOnEvent = events?.find(
      (event) => event.nftEventType === "CREATION"
    );

    if (!createdOnEvent) return;

    const dateTime = Date.parse(createdOnEvent.timestamp);
    return formatDateTime(dateTime);
  }, [tokenEvents]);
  return (
    <>
      {config.superrareVersion !== "custom" && (
        <Box {...boxProps}>
          <Text
            fontSize={fontSizes.body}
            {...fonts.bold}
            maxWidth={maxWidth}
            visible={visible}
            // sdfGlyphSize={sdfGlyphSize}
          >
            Superrare Token {config.tokenId}
          </Text>
        </Box>
      )}

      <Box {...boxProps}>
        <Text
          fontSize={fontSizes.body}
          {...fonts.bold}
          maxWidth={maxWidth}
          visible={visible}
          // @ts-ignore
          sdfGlyphSize={sdfGlyphSize}
        >
          Minted by @{createdBy} {createdOnDate ? `on ${createdOnDate}` : ""}
        </Text>
      </Box>
    </>
  );
};

export default SuperrareCreatorDisplay;
