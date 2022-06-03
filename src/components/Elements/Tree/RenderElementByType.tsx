import React, { useCallback, useLayoutEffect } from "react";

import Placard from "../Placard";
import Model from "../Model";
import Light from "../Light";
import VideoPlayer from "../Video/VideoElement";

import dynamic from "next/dynamic";
import * as typeChecks from "../elementTypeChecks";

import { ElementProps } from "./Element";
import { ElementType } from "spaceTypes";
import AudioElement from "../Audio/AudioElement";

const GeneratedTerrain = dynamic(() => import("../GeneratedTerrain"));
const NftDisplay = dynamic(() => import("../Nft/NftDisplay"));
const Portal = dynamic(() => import("components/Elements/Portal"));
const ImageDisplay = dynamic(() => import("components/Elements/ImageDisplay"));
const TextDisplay = dynamic(() => import("../TextDisplay"));
const ReflectorSurface = dynamic(
  () => import("components/Elements/ReflectorSurface")
);
const Water = dynamic(() => import("components/Elements/Water"));

export type MinimalElementProps = Omit<
  ElementProps,
  "elementsCollectionRef" | "editorState" | "handleElementLoaded"
> & {
  disableCursorIntersectionDetection?: boolean;
  showHelper?: boolean;
};

const RenderElementByTypeInner = (
  props: MinimalElementProps & {
    handleLoaded: (loaded: boolean) => void;
  }
): JSX.Element | null => {
  const { elementConfig } = props;

  return (
    <>
      {typeChecks.isModel(elementConfig) && (
        <Model {...props} config={elementConfig.model} />
      )}
      {typeChecks.isText(elementConfig) && (
        <TextDisplay config={elementConfig.text} {...props} />
      )}
      {typeChecks.isImage(elementConfig) && (
        <ImageDisplay {...props} config={elementConfig.image} />
      )}
      {typeChecks.isLight(elementConfig) && (
        <Light config={elementConfig.light} />
      )}
      {typeChecks.isVideo(elementConfig) && (
        <VideoPlayer
          {...props}
          config={elementConfig.video}
          lastActive={elementConfig.lastActive}
          elementTransform={elementConfig.transform}
        />
      )}
      {typeChecks.isAudio(elementConfig) && (
        <AudioElement
          {...props}
          config={elementConfig.audio}
          lastActive={elementConfig.lastActive}
          elementTransform={elementConfig.transform}
        />
      )}
      {typeChecks.isTerrain(elementConfig) && (
        <GeneratedTerrain config={elementConfig.terrain} {...props} />
      )}
      {typeChecks.isPlacard(elementConfig) && (
        <Placard {...props} config={elementConfig.placard} />
      )}
      {typeChecks.isNft(elementConfig) && (
        <NftDisplay
          {...props}
          config={elementConfig.nft}
          elementTransform={elementConfig.transform}
        />
      )}
      {typeChecks.isReflectorSurface(elementConfig) && (
        <ReflectorSurface
          {...props}
          transform={elementConfig.transform}
          config={elementConfig.reflectorSurface}
        />
      )}
      {typeChecks.isPortal(elementConfig) && (
        <Portal
          {...props}
          transform={elementConfig.transform}
          config={elementConfig.portal}
        />
      )}
      {typeChecks.isWater(elementConfig) && (
        <Water {...props} config={elementConfig.water} />
      )}
    </>
  );
};

const elementsToLoad: ElementType[] = [
  ElementType.model,
  ElementType.image,
  ElementType.video,
  ElementType.nft,
  ElementType.water,
  ElementType.terrain,
];

const RenderElementByType = (
  props: MinimalElementProps & {
    handleElementLoaded: ((elementId: string) => void) | undefined;
  }
) => {
  const {
    elementId,
    handleElementLoaded,
    elementConfig: { elementType, active, deleted },
  } = props;
  const handleLoaded = useCallback(
    (enoughForPreload: boolean) => {
      if (enoughForPreload && handleElementLoaded) {
        handleElementLoaded(elementId);
      }
    },
    [handleElementLoaded, elementId]
  );

  useLayoutEffect(() => {
    const shouldAutoPreload =
      active === false || !!deleted || !elementsToLoad.includes(elementType);

    if (shouldAutoPreload) handleLoaded(true);
  }, [handleLoaded, elementType, active, deleted]);

  return <RenderElementByTypeInner {...props} handleLoaded={handleLoaded} />;
};

export default RenderElementByType;
