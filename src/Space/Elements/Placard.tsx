import React, {
  useCallback,
  useLayoutEffect,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Box3, Mesh, Object3D, Vector3 } from "three";
import { Text } from "@react-three/drei";
import fonts from "shared/fonts";
import {
  useConfigOrDefaultRecursive,
  useConfigOrThemeDefault,
} from "hooks/spaceHooks";
import ConfiguredMaterial from "./ConfiguredMaterial";
import Frame from "./Frame";
import { PlacardConfig } from "spaceTypes/text";
import { FONT_SCALE } from "./TextDisplay";
import { defaultPlacardTextSize } from "defaultConfigs";
import { InteractableContext, useInteractable } from "hooks/useInteractable";
import ModelInteraction from "./Model/interactable";
import { useCurrentValueFromObservable } from "hooks/useObservable";
import { HoverMeshFrame } from "./HoverMesh";
import { useGlobalPointerOverLayer } from "hooks/useLayers";
import { MaterialConfig } from "spaceTypes";
import { FrameConfiguration } from "spaceTypes/image";
import { Observable } from "rxjs";
import * as defaultTheme from "defaultConfigs/theme";
import { baseDefaultPlacardConfig } from "defaultConfigs/useDefaultNewElements";
import { useRefreshIfChanged } from "./Nft/NftDisplay";

export const usePlacardFontSize = (size?: number) => {
  const fontSize = useMemo(
    () => (size || defaultPlacardTextSize) * FONT_SCALE,
    [size]
  );

  return fontSize;
};

export const BoxAndFrame = ({
  hasBacking,
  boxParams,
  backingMaterial,
  hasFrame,
  frameConfig,
  setMesh,
  pointerOver$,
  interactable,
}: {
  hasBacking?: boolean;
  boxParams: BoxParams;
  backingMaterial?: MaterialConfig | null;
  setMesh?: (mesh: Object3D | null) => void;
  hasFrame?: boolean;
  frameConfig?: FrameConfiguration | null;
  pointerOver$: Observable<boolean> | undefined;
  interactable?: boolean;
}) => {
  const pointerOver = useCurrentValueFromObservable(pointerOver$, false);
  return (
    <group
      position-z={-0.01}
      position-x={boxParams.center.x}
      position-y={boxParams.center.y}
    >
      {hasBacking && (
        <mesh
          // castShadow={config.shadow?.cast}
          // receiveShadow={config.shadow?.receive}

          ref={setMesh}
        >
          <boxBufferGeometry args={[boxParams.size.x, boxParams.size.y, 0]} />
          <ConfiguredMaterial config={backingMaterial} />
        </mesh>
      )}
      )
      {hasFrame && (
        <Frame
          config={frameConfig}
          imageDimensions={[boxParams.size.x, boxParams.size.y]}
        />
      )}
      {interactable && (
        <group visible={pointerOver}>
          <HoverMeshFrame
            elementWidth={boxParams.size.x}
            elementHeight={boxParams.size.y}
            frameConfig={frameConfig}
          />
        </group>
      )}
    </group>
  );
};

export interface BoxParams {
  center: Vector3;
  size: Vector3;
}

const PlacardDisplay = ({
  config,
  elementId,
  handleLoaded,
}: {
  config: PlacardConfig;
  elementId: string;
  handleLoaded?: (loaded: boolean) => void;
}) => {
  const values = useConfigOrDefaultRecursive(config, baseDefaultPlacardConfig);

  const [mesh, setMesh] = useState<Mesh | null>(null);
  const [boxParams, setBoxParams] = useState<BoxParams>();

  const displaySettings = useConfigOrThemeDefault(
    config.display,
    defaultTheme.placardDisplay
  );

  useEffect(() => {
    if (mesh) {
      setTimeout(() => {
        const bbox = new Box3();

        mesh.geometry.computeBoundingBox();

        bbox.copy(mesh.geometry.boundingBox as Box3);
        bbox.expandByScalar(displaySettings.backingOffsetScale || 0);

        const center = new Vector3();
        const size = new Vector3();

        bbox.getCenter(center);

        bbox.getSize(size);

        setBoxParams({
          center,
          size,
        });
      });
    }
  }, [mesh, displaySettings.backingOffsetScale]);

  const fontSize = usePlacardFontSize(displaySettings.fontSize);

  const interactableContext = useInteractable(elementId, config);

  const setMeshForDynamicLayer = useGlobalPointerOverLayer(
    interactableContext?.enablePointerOverLayer$
  );

  const pointerOver = useCurrentValueFromObservable(
    interactableContext?.pointerOver$,
    false
  );

  const aggregateSetMesh = useCallback(
    (mesh: Mesh | null) => {
      setMeshForDynamicLayer(mesh);
      setMesh(mesh);
    },
    [setMeshForDynamicLayer, setMesh]
  );

  useLayoutEffect(() => {
    if (!handleLoaded) return;

    if (boxParams) {
      handleLoaded(true);
    } else {
      handleLoaded(false);
    }
  }, [boxParams, handleLoaded]);

  const backOffset = useMemo(() => {
    if (config.offsetFromBack) {
      return displaySettings.frameConfig?.depth;
    }
    return 0;
  }, [displaySettings.frameConfig?.depth, config.offsetFromBack]);

  const refreshText = useRefreshIfChanged(config.text);
  const refreshAnchorX = useRefreshIfChanged(config.anchorX);
  const refreshAnchorY = useRefreshIfChanged(config.anchorY);
  const refreshMaxWidth = useRefreshIfChanged(config.maxWidth);
  const refreshDisplay = useRefreshIfChanged(config.display);

  if (
    refreshText ||
    refreshAnchorX ||
    refreshAnchorY ||
    refreshMaxWidth ||
    refreshDisplay
  )
    return null;

  return (
    <InteractableContext.Provider value={interactableContext}>
      <group position-z={backOffset}>
        <Text
          castShadow={displaySettings.shadow?.cast}
          receiveShadow={displaySettings.shadow?.receive}
          color={displaySettings.primaryFontColor}
          fontSize={fontSize}
          maxWidth={config.maxWidth || undefined}
          anchorX={config.anchorX}
          anchorY={config.anchorY}
          textAlign={config.textAlign}
          // @ts-ignore
          font={fonts[displaySettings.font || "Roboto"]}
          onSync={aggregateSetMesh}
        >
          {config.text}
        </Text>
        {boxParams && (
          <BoxAndFrame
            boxParams={boxParams}
            hasBacking={displaySettings.hasBacking}
            backingMaterial={displaySettings.backingMaterial}
            frameConfig={displaySettings.frameConfig}
            hasFrame={displaySettings.hasFrame}
            pointerOver$={interactableContext?.pointerOver$}
            interactable={values.interactable}
          />
        )}
        {pointerOver && boxParams && (
          <HoverMeshFrame
            elementWidth={boxParams.size.x}
            elementHeight={boxParams.size.y}
            frameConfig={
              displaySettings.frameConfig && displaySettings.hasFrame
                ? displaySettings.frameConfig
                : undefined
            }
          />
        )}
        {!interactableContext?.disableInteractivity &&
          config.interactable &&
          config.interactableConfig && (
            <ModelInteraction interactionConfig={config.interactableConfig!} />
          )}
      </group>
    </InteractableContext.Provider>
  );
};

export default PlacardDisplay;
