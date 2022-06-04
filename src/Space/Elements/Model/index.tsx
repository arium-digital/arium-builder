import React, { useEffect, useState, FC, Suspense, useContext } from "react";
import { Object3D } from "three/src/core/Object3D";

import { useFileDownloadUrlWithLoaded } from "fileUtils";
import { Material } from "three/src/materials/Material";
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Group,
  Mesh,
  MeshStandardMaterial,
} from "three";
import { useFrame } from "@react-three/fiber";
import ModelHoverMaterial from "./ModelHoverMaterial";
import ModelInteraction from "./interactable";
import {
  IModelContainerProps,
  IModelAnimatorProps,
  IModelMaterialOverrideProps,
} from "./types";
import {
  useBehaviorSubjectFromCurrentValue,
  useCurrentValueFromObservable,
} from "hooks/useObservable";
import {
  COLLISION_DETECTION_LAYER,
  GLOBAL_POINTER_OVER_LAYER,
  GROUND_DETECTION_LAYER,
  CURSOR_POSITION_DETECTION_LAYER,
} from "config";
import {
  distinctUntilChanged,
  withLatestFrom,
  startWith,
  map,
} from "rxjs/operators";
import { interval, combineLatest, from } from "rxjs";
import { ModelConfig } from "spaceTypes";
import useModelFile from "./useModelFile";
import { ElementsContext } from "../Tree/ElementsTree";
import { SpaceContext } from "hooks/useCanvasAndModalContext";
import { InteractableContext, useInteractable } from "hooks/useInteractable";
import { PointerOverContext } from "hooks/useGlobalPointerOver";
import ConfiguredMaterial from "../ConfiguredMaterial";
import { Optional } from "types";
import { defaultModel } from "defaultConfigs";
import { useConfigOrDefaultRecursive } from "hooks/spaceHooks";

const ModelMaterialOverride: FC<IModelMaterialOverrideProps> = ({
  model,
  material,
}) => {
  // Effect to update model material parameters
  useEffect(() => {
    model.traverse((child: Object3D) => {
      const asMesh = child as Mesh;
      // @ts-ignore
      if (!asMesh.originalMaterial)
        // @ts-ignore
        asMesh.originalMaterial = asMesh.material;
    });

    return () => {
      model.traverse((child: Object3D) => {
        const asMesh = child as Mesh;
        // @ts-ignore
        if (asMesh.originalMaterial)
          // @ts-ignore
          asMesh.material = asMesh.originalMaterial;
      });
    };
  }, [model]);

  useEffect(() => {
    model.traverse((child: Object3D) => {
      const asMesh = child as Mesh;
      asMesh.material = material;
    });
  }, [model, material]);

  return null;
};

export const ModelAnimator: FC<IModelAnimatorProps> = ({
  model,
  animations,
  timeScale,
  syncAcrossSessions,
}) => {
  const [animationMixer, setAnimationMixer] = useState<AnimationMixer>();
  const animationMixer$ = useBehaviorSubjectFromCurrentValue(animationMixer);
  // const animationDuration$ = useBehaviorSubjectFromCurrentValue(animationDuration);
  useEffect(() => {
    let clipActions: AnimationAction[];

    (async () => {
      if (animations.length === 0) {
        setAnimationMixer(undefined);
        return;
      }
      const animationMixer = new AnimationMixer(model);

      clipActions = animations.map((clip) => animationMixer.clipAction(clip));

      clipActions.forEach((action) => action.play());

      setAnimationMixer(animationMixer);
    })();

    return () => {
      clipActions?.forEach((action) => action.stop());
    };
  }, [animations, model]);

  const { serverTimeOffset$ } = useContext(SpaceContext) || {};

  useEffect(() => {
    if (!syncAcrossSessions) return;

    const interval$ = interval(5000).pipe(startWith([0]));

    const animationTime$ = interval$.pipe(
      withLatestFrom(serverTimeOffset$ || from([0])),
      map(([, serverTimeOffset]) => {
        const currentTime = (new Date().getTime() + serverTimeOffset) / 1000;

        return currentTime;
      })
    );

    const sub = combineLatest([animationMixer$, animationTime$]).subscribe({
      next: ([animationMixer, animationTime]) => {
        if (!animationMixer || !animationTime) return;

        animationMixer.setTime(animationTime);
      },
    });

    return () => sub.unsubscribe();
  }, [serverTimeOffset$, animationMixer$, syncAcrossSessions]);

  useEffect(() => {
    if (typeof timeScale !== "undefined" && animationMixer) {
      animationMixer.timeScale = timeScale;
    }
  }, [animationMixer, timeScale]);

  useFrame((_, delta) => {
    animationMixer?.update(delta);
  });

  return null;
};

type ModelProps = {
  config: ModelConfig;
  meshesChanged?: () => void;
  handleLoaded?: (loaded: boolean) => void;
  overrideMaterial?: Optional<Material>;
  disableCursorIntersectionDetection?: boolean;
};

const Model = ({
  config,
  meshesChanged,
  handleLoaded,
  model,
  overrideMaterial,
  animations,
  disableCursorIntersectionDetection,
}: ModelProps & {
  model: Group | undefined;
  animations: AnimationClip[] | undefined;
}) => {
  const [allMeshes, setMeshes] = useState<Object3D[]>([]);

  const { dontPreload } = config;

  useEffect(() => {
    if (model || dontPreload) {
      handleLoaded && handleLoaded(true);
    }
  }, [model, handleLoaded, dontPreload]);

  // Effect to update model collidable parameters
  useEffect(() => {
    const meshes: Object3D[] = [];
    if (model) {
      model.traverse((child: Object3D) => {
        // @ts-ignore
        if (child.isMesh) {
          meshes.push(child);
          // if the  model is marked as collidable, add all child meshes to our collidable mesh lists
          if (config.isCollidable || child.userData.collidable) {
            child.layers.enable(COLLISION_DETECTION_LAYER);
          } else {
            child.layers.disable(COLLISION_DETECTION_LAYER);
          }
          if (config.isGround || child.userData.ground) {
            child.layers.enable(GROUND_DETECTION_LAYER);
          } else {
            child.layers.disable(GROUND_DETECTION_LAYER);
          }

          const castShadow = child.userData.castShadow || !!config.shadow?.cast;
          child.castShadow = castShadow;

          const receiveShadow =
            child.userData.receiveShadow || !!config.shadow?.receive;
          child.receiveShadow = receiveShadow;

          child.visible = !child.userData.invisible;

          // @ts-ignore
          const material = child.material as MeshStandardMaterial;
          // material.metalnessMap = null;
          // material.metalness=0;
          material.envMapIntensity = config.envMapIntensity || 0.2;
          // material.roughnessMap = null;
          // material.roughness =1;

          //only consider models when detect position
          if (disableCursorIntersectionDetection)
            child.layers.disable(CURSOR_POSITION_DETECTION_LAYER);
          else child.layers.enable(CURSOR_POSITION_DETECTION_LAYER);
        }
        // @ts-ignore
        if (child.isLight) {
          child.visible = false;
        }
      });
      meshesChanged && meshesChanged();
    }
    setMeshes(meshes);
    return () => {
      if (model) {
        meshesChanged && meshesChanged();
      }
    };
  }, [
    model,
    config.isCollidable,
    config.isGround,
    config.envMapIntensity,
    config.shadow?.cast,
    config.shadow?.receive,
    meshesChanged,
    disableCursorIntersectionDetection,
  ]);

  const { enablePointerOverLayer$ } = useContext(PointerOverContext) || {};
  const { pointerOver$ } = useContext(InteractableContext) || {};

  useEffect(() => {
    if (!enablePointerOverLayer$) return;
    const sub = enablePointerOverLayer$
      ?.pipe(distinctUntilChanged())
      .subscribe((enable) => {
        allMeshes.forEach((mesh) => {
          if (enable) mesh.layers.enable(GLOBAL_POINTER_OVER_LAYER);
          else mesh.layers.disable(GLOBAL_POINTER_OVER_LAYER);
        });
      });

    return () => {
      sub?.unsubscribe();
    };
  }, [allMeshes, enablePointerOverLayer$]);

  const pointerOver = useCurrentValueFromObservable(pointerOver$, false);

  return (
    <>
      <primitive object={model} />
      {overrideMaterial && model && (
        <ModelMaterialOverride model={model} material={overrideMaterial} />
      )}

      {config.interactable && model && (
        <ModelHoverMaterial model={model} enabled={pointerOver} />
      )}
      {model && animations && config.animated && (
        <ModelAnimator
          model={model}
          animations={animations}
          timeScale={config.animationTimeScale}
          syncAcrossSessions={config.syncAnimation}
        />
      )}
    </>
  );
};

export const ModelWrapper = (
  props: ModelProps & {
    modelUrl: string;
  }
) => {
  const { modelUrl, handleLoaded } = props;
  const { model, animations, loadAttemptComplete } = useModelFile(modelUrl);

  useEffect(() => {
    if (!handleLoaded) return;

    if (!modelUrl || loadAttemptComplete) {
      handleLoaded(true);
    }
  }, [modelUrl, loadAttemptComplete, handleLoaded]);

  if (!model) return null;

  return <Model {...props} model={model} animations={animations} />;
};

const ModelContainer = ({
  elementId,
  config: original,
  handleLoaded,
  disableCursorIntersectionDetection,
}: IModelContainerProps) => {
  const [groupRef, setGroupRef] = useState<THREE.Group | null>(null);

  const config = useConfigOrDefaultRecursive(original, defaultModel);

  const interactableContext = useInteractable(elementId, config);

  const { filePath: modelUrl, loaded } = useFileDownloadUrlWithLoaded(
    config.modelFile
  );

  const [overrideMaterial, setOverrideMaterial] = useState<Material>();

  const bundledMaterial = config.bundledMaterial !== false;

  useEffect(() => {
    if (!modelUrl && loaded) {
      if (handleLoaded) handleLoaded(true);
    }
  }, [modelUrl, loaded, handleLoaded]);

  return (
    <InteractableContext.Provider value={interactableContext}>
      <group ref={setGroupRef}>
        {groupRef && modelUrl && (
          <Suspense fallback={null}>
            <SpaceContext.Consumer>
              {(spaceContext) => (
                <ElementsContext.Consumer>
                  {(elementsContext) =>
                    spaceContext && (
                      <>
                        <ModelWrapper
                          modelUrl={modelUrl}
                          config={config}
                          meshesChanged={elementsContext?.meshesChanged}
                          handleLoaded={handleLoaded}
                          overrideMaterial={overrideMaterial}
                          disableCursorIntersectionDetection={
                            disableCursorIntersectionDetection
                          }
                        />
                        {!bundledMaterial && (
                          <ConfiguredMaterial
                            config={config.materialConfig}
                            handleMaterialSet={setOverrideMaterial}
                            useThreeColor
                          />
                        )}
                      </>
                    )
                  }
                </ElementsContext.Consumer>
              )}
            </SpaceContext.Consumer>
          </Suspense>
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

export default ModelContainer;
