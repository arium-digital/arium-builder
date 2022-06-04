import React, { useState } from "react";
import { Object3D, Vector3 } from "three";
import { ArtworkDisplayConfig, NftConfig } from "spaceTypes/nftConfig";
import MediaDisplay from "./MediaDisplay";
import { Box, Flex, useReflow } from "@react-three/flex";
import { TokenTextInfo, TokenMedia } from "./tokenConversion";
import NftPlacard from "./NftPlacard";
import { useConfigOrThemeDefault } from "hooks/spaceHooks";
import { Transform } from "spaceTypes";
import { useLayoutEffect } from "react";
import * as themeDefaults from "defaultConfigs/theme";
import { PricingInfoData } from "@zoralabs/nft-hooks/dist/fetcher/AuctionInfoTypes";
import { boxProps } from "./types";

type NftMediaAndPlacardProps = {
  config: NftConfig;
  displayConfig: ArtworkDisplayConfig | undefined;
  handleLoaded?: (loaded: boolean) => void;
  elementTransform?: Transform;
  tokenTextInfo: TokenTextInfo;
  tokenMedia: TokenMedia;
  muted?: boolean;
  pricing?: PricingInfoData;
  showHelper: boolean | undefined;
};

export const booleanValueorDefault = (
  value: boolean | undefined,
  defaultValue: boolean
) => {
  return typeof value === "undefined" ? defaultValue : value;
};

export const showFromConfig = (
  displayConfig: ArtworkDisplayConfig | undefined
) => {
  return {
    showMedia: booleanValueorDefault(displayConfig?.showMedia, true),
    showPlacard: booleanValueorDefault(displayConfig?.showPlacard, true),
  };
};

const NftMediaAndPlacardInner = ({
  displayConfig,
  config,
  elementTransform,
  handleLoaded,
  tokenTextInfo,
  tokenMedia,
  muted,
  flexRef,
  pricing,
  ...rest
}: NftMediaAndPlacardProps & {
  flexRef: Object3D | null;
}) => {
  const [placardScale, setPlacardScale] = useState<Vector3>();

  const reflow = useReflow();

  useLayoutEffect(() => {
    if (!flexRef) return;
    const setScale = () => {
      const worldScale = new Vector3();
      flexRef.getWorldScale(worldScale);

      const worldNeutralScale = new Vector3(1, 1, 1);

      const placardScale = worldNeutralScale.clone().divide(worldScale);

      setPlacardScale(placardScale);
    };

    setScale();

    setTimeout(() => {
      setScale();
    }, 1000);
  }, [flexRef, elementTransform]);

  useLayoutEffect(() => {
    reflow();
  }, [placardScale, reflow]);

  const { showMedia, showPlacard } = showFromConfig(displayConfig);

  useLayoutEffect(() => {
    if (
      !showMedia ||
      !tokenMedia.inSpaceMediaFile ||
      !tokenMedia.originalMediaFileType
    ) {
      if (handleLoaded) handleLoaded(true);
    }
  }, [
    showMedia,
    handleLoaded,
    tokenMedia.inSpaceMediaFile,
    tokenMedia.originalMediaFileType,
  ]);

  const placardDisplay = useConfigOrThemeDefault(
    displayConfig?.placardDisplay,
    themeDefaults.placardDisplay
  );
  const placardSettings = useConfigOrThemeDefault(
    displayConfig?.nftPlacardSettings,
    themeDefaults.nftPlacard
  );

  // useEffect(() => {
  //   console.log({
  //     placardDisplay,
  //     fromConfig: displayConfig?.placardDisplay
  //   })

  // }, [placardDisplay, displayConfig?.placardDisplay
  // ])

  return (
    <>
      {showMedia &&
        tokenMedia.originalMediaFileType &&
        tokenMedia.inSpaceMediaFile && (
          <Box centerAnchor {...boxProps}>
            <MediaDisplay
              fileLocation={tokenMedia.inSpaceMediaFile}
              mediaType={tokenMedia.originalMediaFileType}
              {...rest}
              image={displayConfig?.image}
              video={displayConfig?.video}
              frame={displayConfig?.mediaFrame}
              handleLoaded={handleLoaded}
              muted={muted}
              elementTransform={elementTransform}
            />
          </Box>
        )}
      {showPlacard && (
        <Box {...boxProps}>
          <group scale={placardScale}>
            <Flex
              size={[placardSettings.width, 2, 0]}
              position-y={placardSettings.bottomOffset}
              position-x={placardSettings.leftOffset}
              {...boxProps}
            >
              <Box flexDirection="column" padding={0.05} {...boxProps}>
                {(width, height) => (
                  <>
                    <NftPlacard
                      placardDisplay={placardDisplay}
                      settings={placardSettings}
                      textInfo={tokenTextInfo}
                      config={config}
                      size={[width, height]}
                      maxWidth={width - 0.05 * 2}
                      parentReflow={reflow}
                      pricing={pricing}
                    />
                  </>
                )}
              </Box>
            </Flex>
          </group>
        </Box>
      )}
    </>
  );
};

const NftMediaAndPlacardDisplay = (props: NftMediaAndPlacardProps) => {
  // const token = config.superrareToken;
  const [flexRef, setFlexRef] = useState<Object3D | null>(null);

  return (
    <group ref={setFlexRef}>
      <Flex
        flexDirection="row"
        alignItems="flex-end"
        centerAnchor
        {...boxProps}
      >
        <NftMediaAndPlacardInner {...props} flexRef={flexRef} />
      </Flex>
    </group>
  );
};

export default NftMediaAndPlacardDisplay;
