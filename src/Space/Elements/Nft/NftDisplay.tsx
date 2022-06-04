import React, { useContext, useMemo, useState } from "react";
import { useCurrentValueFromObservable } from "hooks/useObservable";
import { NftConfig } from "spaceTypes/nftConfig";
import {} from "../../../../shared/nftTypes/superrare";
import { InteractableContext, useInteractable } from "hooks/useInteractable";
import {
  AssetDetailFileType,
  InteractableElement,
  InteractionType,
  ShowModalConfig,
} from "spaceTypes/interactable";
import ModelInteraction from "../Model/interactable";
import {
  useConfigOrDefaultRecursive,
  useConfigOrThemeDefault,
} from "hooks/spaceHooks";
import { Transform } from "spaceTypes";
import NftMediaAndPlacardDisplay from "./NftMediaAndPlacardDisplay";
import { TokenMedia } from "./tokenConversion";
import AssetDetailsContents from "./AssetDetailsContents";
import { PointerOverContext } from "hooks/useGlobalPointerOver";
import { getMediaFileAndType, useTokenMetadata } from "./tokenConversion";
import { useEffect } from "react";
import isEqual from "lodash/isEqual";
import * as themeDefaults from "defaultConfigs/theme";
import { baseDefaultNftConfig } from "defaultConfigs/useDefaultNewElements";
import { OptionsType, useNftPricing } from "./zoraWrappers";
import { HasEthNft } from "../../../../shared/nftTypes";
import { Observable } from "rxjs";

export const bidOffset = -0.15;
function assetDetailsProps({
  originalMediaFileType: mediaType,
  originalMediaFile: mediaFile,
}: TokenMedia): Pick<
  ShowModalConfig,
  "showDetail" | "detailFile" | "detailFileType"
> {
  let detailFileType: AssetDetailFileType;

  if (mediaType === "image" || mediaType === "gif" || mediaType === "svg")
    detailFileType = "image";
  else if (mediaType === "video") detailFileType = "video";
  else if (mediaType === "model") detailFileType = "model";
  else detailFileType = "image";

  return {
    showDetail: true,
    detailFile: mediaFile,
    detailFileType,
  };
}

export function useRefreshIfChanged(object: any | undefined | null) {
  // const [lastValue, setLastValue] = useState<string | undefined>();

  const [lastState, setLastState] = useState<{
    lastValue: any | undefined;
    refresh: boolean;
  }>({
    lastValue: undefined,
    refresh: false,
  });

  useEffect(() => {
    const newValue = object;
    setLastState(({ lastValue }) => {
      if (!lastValue) {
        return {
          lastValue: newValue,
          refresh: false,
        };
      }

      const refresh = !isEqual(lastValue, newValue);

      return {
        lastValue: newValue,
        refresh,
      };
    });
  }, [object]);

  useEffect(() => {
    if (lastState.refresh) {
      setTimeout(() => {
        setLastState((existing) => ({
          ...existing,
          refresh: false,
        }));
      });
    }
  }, [lastState.refresh]);

  return lastState.refresh;
}

export const useRefreshOnObserved = (observable$: Observable<any>) => {
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const sub = observable$.subscribe({
      next: () => {
        setRefresh(true);
        setTimeout(() => {
          setRefresh(false);
        });
      },
    });

    return () => sub.unsubscribe();
  }, [observable$]);

  return refresh;
};

const options: OptionsType = {
  refreshInterval: 30 * 1000,
};

const NftDisplay = ({
  config: original,
  elementId,
  handleLoaded,
  muted,
  elementTransform,
  showHelper,
}: {
  config: NftConfig;
  elementId: string;
  elementTransform?: Transform;
  handleLoaded?: (loaded: boolean) => void;
  muted?: boolean;
  showHelper?: boolean;
}) => {
  const values = useConfigOrDefaultRecursive(original, baseDefaultNftConfig);

  const { disableInteractivity$ } = useContext(PointerOverContext) || {};

  const disableInteractivity = useCurrentValueFromObservable(
    disableInteractivity$,
    false
  );

  const tokenMetadata = useTokenMetadata(values);

  const tokenMedia = useMemo(() => getMediaFileAndType(values), [values]);

  const assetDetailsContents = useMemo(
    () =>
      tokenMetadata && (
        <AssetDetailsContents values={values} tokenMetadata={tokenMetadata} />
      ),
    [tokenMetadata, values]
  );

  const shouldPullPricing = !!values.fetchPricing;

  const contractAddress = (values as HasEthNft).tokenAddress;

  const nftPricing = useNftPricing({
    contractAddress: shouldPullPricing ? contractAddress : undefined,
    tokenId: shouldPullPricing ? values.tokenId || undefined : undefined,
    options,
  });

  const interactableConfig = useMemo(
    (): InteractableElement => ({
      interactable: values.interactable !== false,
      interactableConfig: {
        action: InteractionType.showModal,
        payload: {
          contentHTML: assetDetailsContents,
          backgroundColor: "white",
          ...assetDetailsProps(tokenMedia),
        },
      },
    }),
    [tokenMedia, assetDetailsContents, values.interactable]
  );
  const interactableContext = useInteractable(elementId, interactableConfig);

  const nftDisplayConfig = values.display;

  const mediaFrame = useConfigOrThemeDefault(
    values.display?.mediaFrame,
    themeDefaults?.defaultFrame
  );

  const zOffset = values.offsetFromBack
    ? mediaFrame?.frameConfig?.depth || 0
    : 0;

  const refreshCauseOfMedia = useRefreshIfChanged(tokenMedia);
  const refreshCauseOfText = useRefreshIfChanged(tokenMetadata);

  return (
    <InteractableContext.Provider value={interactableContext}>
      <group key={1} position-z={zOffset}>
        {!refreshCauseOfMedia && !refreshCauseOfText && (
          <NftMediaAndPlacardDisplay
            config={values}
            displayConfig={nftDisplayConfig}
            handleLoaded={handleLoaded}
            tokenMedia={tokenMedia}
            tokenTextInfo={tokenMetadata}
            muted={muted}
            pricing={nftPricing.pricing}
            elementTransform={elementTransform}
            showHelper={showHelper}
          />
        )}
      </group>
      {!disableInteractivity &&
        interactableConfig.interactable &&
        interactableConfig.interactableConfig && (
          <ModelInteraction
            // elementFile={values.storedVideos?.mp4 || values.storedVideos?.webm}
            interactionConfig={interactableConfig.interactableConfig}
          />
        )}
    </InteractableContext.Provider>
  );
};

export default NftDisplay;
