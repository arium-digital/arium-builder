import React, {
  memo,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import fontsList from "shared/fonts";
import { CommonProps, Fonts, FontSizes, sectionMargin } from "./shared";
import { Box, useReflow } from "@react-three/flex";
import FlexBoxAndFrame from "./FlexBoxAndFrame";
import { Text } from "@react-three/drei";
import { Object3D } from "three";
import { NftPlacardSettings } from "spaceTypes/nftConfig";
import { useEffect } from "react";
import useLodProperties from "hooks/useLodProperties";
import { Concrete } from "hooks/spaceHooks";
import { usePlacardFontSize } from "../Placard";
import { HasNft } from "../../../../shared/nftTypes";
import {
  isSuperrareToken,
  isTezosToken,
  TokenTextInfo,
} from "./tokenConversion";
import { throttle } from "lodash";
import { useGlobalPointerOverLayer } from "hooks/useLayers";
import { InteractableContext } from "hooks/useInteractable";
import { PlacardDisplayConfig } from "spaceTypes/placard";
import { PricingInfoData } from "@zoralabs/nft-hooks/dist/fetcher/AuctionInfoTypes";
import AuctionInfoDisplay from "./AuctionInfoDisplay";
import SuperrareCreatorDisplay from "./superrare/SuperrareCreatorDisplay";
import SuperrareHistory from "./superrare/SuperrareHistory";
import { SuperrareAuctionDisplay } from "./RunningAuctionDisplay";
import { parseTezosTokenValues } from "./tezos/parseTezosToken";
import { boxProps } from "./types";

const GenericCreatorDisplay = ({
  fontSizes,
  maxWidth,
  textInfo,
  fonts,
  visible,
  sdfGlyphSize,
}: {
  textInfo: TokenTextInfo;
} & CommonProps & {
    sdfGlyphSize: number;
  }) => {
  return (
    <>
      <Box {...boxProps}>
        <Text
          fontSize={fontSizes.body}
          {...fonts.bold}
          maxWidth={maxWidth}
          visible={visible}
          // @ts-ignore
          sdfGlyphSize={sdfGlyphSize}
        >
          Created by @{textInfo.creatorName}{" "}
        </Text>
      </Box>
    </>
  );
};

const NftPlacard = memo(
  ({
    settings,
    placardDisplay: displaySettings,
    config,
    size: [width, height],
    maxWidth,
    textInfo,
    parentReflow,
    pricing,
  }: {
    settings: Concrete<NftPlacardSettings>;
    placardDisplay: Concrete<PlacardDisplayConfig>;
    size: [number, number];
    maxWidth: number;
    config: HasNft;
    textInfo: TokenTextInfo;
    parentReflow: () => void;
    pricing?: PricingInfoData;
  }) => {
    const reflow = useReflow();

    const fontSize = usePlacardFontSize(displaySettings.fontSize);

    const fontSizes = useMemo(
      (): FontSizes => ({
        header: fontSize,
        subHeader: fontSize * 0.7,
        body: fontSize * 0.5,
      }),
      [fontSize]
    );

    const {
      showDescription,
      showTitle,
      showHistory,
      showPrice,
      showCreator,
      showOwner,
    } = settings;

    const owner = textInfo?.ownerName;
    const creator = textInfo?.creatorName;

    const hasOwner = useMemo(() => owner && owner !== "" && owner !== creator, [
      owner,
      creator,
    ]);

    const ownedByText = useMemo(() => {
      if (!hasOwner || !showOwner) return null;
      return `Owned by @${owner}`;
    }, [hasOwner, owner, showOwner]);

    useEffect(() => {
      setTimeout(() => {
        reflow();
        parentReflow();
      }, 1000);
    }, [reflow, parentReflow]);

    useLayoutEffect(() => {
      setTimeout(() => {
        reflow();
        setTimeout(() => {
          parentReflow();
        }, 300);
      }, 300);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings, config, textInfo, parentReflow]);

    const [groupRef, setGroupRef] = useState<Object3D | null>(null);

    const distancePropertiesMemoized = useMemo(
      () => ({
        titleVisible: settings.titleVisibleDistance,
        highResText: settings.detailsVisibleDistance,
        detailsVisible: settings.detailsVisibleDistance,
      }),
      [settings.detailsVisibleDistance, settings.titleVisibleDistance]
    );

    const lodProperties = useLodProperties({
      mesh: groupRef,
      distancedProperties: distancePropertiesMemoized,
    });

    const fonts = useMemo((): Fonts => {
      const fontColor = displaySettings?.primaryFontColor || "black";
      // @ts-ignore
      const font = fontsList[displaySettings?.font || "Roboto"];
      const standard = {
        font: font,
        anchorX: "left",
        anchorY: "top",
        color: fontColor,
        depthOffset: -1,
      };

      const bold = {
        ...standard,
        outlineWidth: 0.0015,
        outlineColor: fontColor,
      };

      return {
        standard,
        bold,
      };
    }, [displaySettings?.primaryFontColor, displaySettings?.font]);

    const sdfGlyphSize = lodProperties?.highResText ? 64 : 8;

    const throttledReflow = useCallback(() => {
      throttle(reflow, 500, {
        leading: false,
        trailing: true,
      });
    }, [reflow]);

    const interactableContext = useContext(InteractableContext);

    const setMesh = useGlobalPointerOverLayer(
      interactableContext?.enablePointerOverLayer$
    );

    const parsedTezosSupply = isTezosToken(config)
      ? parseTezosTokenValues(config.tezosToken)?.totalSupply
      : undefined;

    return (
      <group ref={setGroupRef}>
        {showTitle && textInfo.name && (
          <Box marginBottom={sectionMargin} {...boxProps}>
            <Text
              fontSize={fontSizes.header}
              lineHeight={fontSizes.header * 8}
              {...fonts.bold}
              maxWidth={maxWidth}
              onSync={throttledReflow}
              visible={lodProperties?.titleVisible}
              // @ts-ignore
              sdfGlyphSize={sdfGlyphSize}
            >
              {textInfo.name}
            </Text>
          </Box>
        )}
        {showCreator && creator && (
          <>
            {isSuperrareToken(config) && (
              <SuperrareCreatorDisplay
                config={config}
                fontSizes={fontSizes}
                fonts={fonts}
                visible={lodProperties?.detailsVisible}
                maxWidth={maxWidth}
                reflow={throttledReflow}
                sdfGlyphSize={sdfGlyphSize}
              />
            )}
            {!isSuperrareToken(config) && (
              <GenericCreatorDisplay
                textInfo={textInfo}
                fontSizes={fontSizes}
                fonts={fonts}
                visible={lodProperties?.detailsVisible}
                maxWidth={maxWidth}
                reflow={throttledReflow}
                sdfGlyphSize={sdfGlyphSize}
              />
            )}
          </>
        )}
        {parsedTezosSupply && (
          <Box {...boxProps}>
            <Text
              fontSize={fontSizes.body}
              {...fonts.bold}
              maxWidth={maxWidth}
              onSync={throttledReflow}
              visible={lodProperties?.detailsVisible}
              // @ts-ignore
              sdfGlyphSize={sdfGlyphSize}
            >
              {parsedTezosSupply} editions
            </Text>
          </Box>
        )}

        {ownedByText && (
          <Box {...boxProps}>
            <Text
              fontSize={fontSizes.body}
              {...fonts.bold}
              maxWidth={maxWidth}
              onSync={throttledReflow}
              visible={lodProperties?.detailsVisible}
              // @ts-ignore
              sdfGlyphSize={sdfGlyphSize}
            >
              {ownedByText}
            </Text>
          </Box>
        )}
        {showDescription && textInfo.description && (
          <Box marginTop={sectionMargin} {...boxProps}>
            <Text
              fontSize={fontSizes.body}
              {...fonts.standard}
              onSync={throttledReflow}
              maxWidth={maxWidth}
              visible={lodProperties?.detailsVisible}
              // @ts-ignore
              sdfGlyphSize={sdfGlyphSize}
            >
              {textInfo.description}
            </Text>
          </Box>
        )}
        {showPrice && isSuperrareToken(config) && config.superrareTokenHistory && (
          <SuperrareAuctionDisplay
            tokenHistory={config.superrareTokenHistory}
            fontSizes={fontSizes}
            fonts={fonts}
            visible={lodProperties?.detailsVisible}
            maxWidth={maxWidth}
            reflow={throttledReflow}
            // sdfGlyphSize={sdfGlyphSize}
          />
        )}
        {showHistory && pricing && (
          <AuctionInfoDisplay
            pricing={pricing}
            visible={lodProperties?.detailsVisible}
            fontSizes={fontSizes}
            fonts={fonts}
            maxWidth={maxWidth}
            reflow={throttledReflow}
          />
        )}
        {showHistory &&
          isSuperrareToken(config) &&
          !(
            showPrice &&
            config.superrareTokenHistory?.auction?.auctionState ===
              "RUNNING_AUCTION"
          ) && (
            <SuperrareHistory
              config={config}
              fontSizes={fontSizes}
              fonts={fonts}
              visible={lodProperties?.detailsVisible}
              maxWidth={maxWidth}
              reflow={throttledReflow}
            />
          )}
        <FlexBoxAndFrame
          boxConfig={displaySettings}
          size={[width, height]}
          setMesh={setMesh}
          pointerOver$={interactableContext?.pointerOver$}
        />
      </group>
    );
  }
);

export default NftPlacard;
