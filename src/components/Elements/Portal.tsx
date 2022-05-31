import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Sphere } from "@react-three/drei";
import { useIsInRange } from "hooks/useIsInRange";
import { createPortal, useThree } from "@react-three/fiber";
import {
  defaultPortalConfig,
  DEFAULT_PORTAL_RADIUS,
  PortalConfig,
} from "spaceTypes/portal";
import { Transform } from "spaceTypes";
import { useConfigOrDefaultRecursive } from "hooks/spaceHooks";
import { usePrevious } from "hooks/usePrevious";
import { Object3D, Vector3 } from "three";
import { useGlobalPointerOverLayer } from "hooks/useLayers";
import { StringDict } from "types";
import { SpaceRouteKeys } from "components/SpaceRoute/useSpaceQueryParams";
import { getQuery } from "libs/pathUtils";
import { useContext } from "react";
import { ElementsContext } from "./Tree/ElementsTree";
import { SpaceContext } from "hooks/useCanvasAndModalContext";
import { PointerOverContext } from "hooks/useGlobalPointerOver";
import { spaceSlugForId } from "hooks/useSpaceIdForSlug";

const portalColor = "#2c62d7";
const portalColorActive = "#0e218f";
type PortalWraperProps = {
  transform?: Transform;
  config?: PortalConfig;
};

type PortalProps = PortalWraperProps & {
  config: PortalConfig;
  // transform: Transform;
  anchorWorldPosition: Vector3;
  anchorWorldScaleX: number;
};
type Target = Record<"position" | "lookAt", Vector3>;

const TargetHelper: FC<{
  target: Target;
}> = ({ target: { position } }) => {
  return (
    <group>
      <Sphere position={position}>
        <meshBasicMaterial
          attach="material"
          color="yellow"
          transparent
          opacity={0.4}
        />
      </Sphere>
      {/* <arrowHelper args={[rotation, position, 2]} /> */}
    </group>
  );
};

const TriggerHelper: FC<{
  radius: number;
}> = ({ radius }) => {
  return (
    <mesh>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshBasicMaterial
        attach="material"
        color="#2c62d7"
        transparent
        opacity={0.4}
      />
    </mesh>
  );
};

const toQuery = (params: any) =>
  Object.keys(params)
    .map((key) => {
      return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
    })
    .join("&");

const Portal = ({
  anchorWorldPosition,
  anchorWorldScaleX,
  config: {
    targetPosition,
    targetLookAt,
    targetSpaceId,
    toAnotherSpace,
    showHelper,
    visible,
    specifyLandingPosition,
    radius = DEFAULT_PORTAL_RADIUS,
  },
}: PortalProps) => {
  const { scene, camera } = useThree();
  const triggerDistance = useMemo(() => anchorWorldScaleX * radius, [
    anchorWorldScaleX,
    radius,
  ]);
  const target: Target = useMemo(
    () => ({
      position: new Vector3(
        targetPosition?.x,
        targetPosition?.y,
        targetPosition?.z
      ),
      lookAt: new Vector3(targetLookAt?.x, targetLookAt?.y, targetLookAt?.z),
    }),
    [targetPosition, targetLookAt]
  );

  const elementsContext = useContext(ElementsContext);

  const playerPositionRef = elementsContext?.playerPositionRef;
  const spaceContext = useContext(SpaceContext);
  const spaceSlugFromPath = spaceContext?.spaceSlugFromPath;
  const router = spaceContext?.router;

  const isInZone = useIsInRange(anchorWorldPosition, triggerDistance);
  const prevInZone = usePrevious(isInZone);
  const transport = useCallback(async () => {
    if (!router || !playerPositionRef) return;
    if (toAnotherSpace) {
      if (targetSpaceId) {
        const query: StringDict = specifyLandingPosition
          ? {
              [SpaceRouteKeys.x]: target.position.x.toString(),
              [SpaceRouteKeys.y]: target.position.y.toString(),
              [SpaceRouteKeys.z]: target.position.z.toString(),
              [SpaceRouteKeys.lx]: target.lookAt.x.toString(),
              [SpaceRouteKeys.ly]: target.lookAt.y.toString(),
              [SpaceRouteKeys.lz]: target.lookAt.z.toString(),
            }
          : {};

        copyCurrentParamsToQuery(query, [SpaceRouteKeys.bodyColor]);

        if (targetSpaceId !== spaceSlugFromPath) {
          const spaceSlug = await spaceSlugForId(targetSpaceId);
          query[SpaceRouteKeys.portalTo] = spaceSlug;
        }

        const queryString = toQuery(query);

        router.push(`/spaces/${spaceSlugFromPath}?${queryString}`, undefined, {
          shallow: true,
        });
      }
    } else {
      playerPositionRef.current?.set(...target.position.toArray());
      setTimeout(() => camera.lookAt(target.lookAt), 30);
    }
  }, [
    toAnotherSpace,
    playerPositionRef,
    target.position,
    target.lookAt,
    camera,
    targetSpaceId,
    specifyLandingPosition,
    spaceSlugFromPath,
    router,
  ]);

  const pointerOverContext = useContext(PointerOverContext);
  const setMesh = useGlobalPointerOverLayer(
    pointerOverContext?.enablePointerOverLayer$
  );

  useEffect(() => {
    if (isInZone && !prevInZone) {
      transport();
    }
  }, [isInZone, prevInZone, transport]);

  const depth = 0.1;
  return (
    <>
      {showHelper &&
        !toAnotherSpace &&
        createPortal(<TargetHelper target={target} />, scene)}
      {showHelper && <TriggerHelper radius={radius} />}
      <mesh visible={visible} ref={setMesh}>
        <cylinderGeometry args={[radius, radius, depth, 16]} />
        <meshBasicMaterial
          color={isInZone ? portalColorActive : portalColor}
          transparent
          opacity={0.4}
        />
      </mesh>
    </>
  );
};

const getWorldPosition = (obj?: Object3D): Vector3 | null => {
  return obj?.parent?.localToWorld(new Vector3(0, 0, 0)) || null;
};

const getWorldScale = (obj?: Object3D): Vector3 | null => {
  const objMatrix4 = obj?.parent?.matrixWorld;

  return objMatrix4 == null
    ? null
    : new Vector3().setFromMatrixScale(objMatrix4);
};

function copyCurrentParamsToQuery(query: StringDict, keysToCopy: string[]) {
  const existingQuery = getQuery();

  keysToCopy.forEach((keyToCopy) => {
    if (existingQuery.get(keyToCopy)) {
      query[keyToCopy] = existingQuery.get(keyToCopy) as string;
    }
  });
}

const PortalWrapper = ({ config, transform }: PortalWraperProps) => {
  const values = useConfigOrDefaultRecursive(config, defaultPortalConfig);
  const anchorRef = useRef<THREE.Object3D>();
  const [
    anchorWorldPosition,
    setAnchorWorldPosition,
  ] = useState<Vector3 | null>();
  const [anchorWorldScaleX, setAnchorWorldScaleX] = useState<number | null>();

  useEffect(() => {
    setTimeout(() => {
      setAnchorWorldPosition(getWorldPosition(anchorRef.current));
      setAnchorWorldScaleX(getWorldScale(anchorRef.current)?.x);
    }, 1000);
  }, [transform, anchorRef.current?.matrixWorld]);

  return (
    <mesh ref={anchorRef} rotation-x={config?.rotatedHalfPi ? Math.PI / 2 : 0}>
      {anchorWorldPosition != null && anchorWorldScaleX != null && (
        <Portal
          anchorWorldPosition={anchorWorldPosition}
          anchorWorldScaleX={anchorWorldScaleX}
          config={values}
          // transform={transform}
        />
      )}
    </mesh>
  );
};
export default PortalWrapper;
