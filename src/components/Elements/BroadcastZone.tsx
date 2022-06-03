import React, { useCallback, useEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import { Mesh, Raycaster, Vector3 } from "three";
import { UserInfo } from "communicationTypes";
import {
  defaultBroadcastZoneConfig,
  defaultCircleConfig,
  defaultFlatShapeConfig,
  defaultRectangleConfig,
} from "defaultConfigs";
import { Concrete, useConfigOrDefault } from "hooks/spaceHooks";
import { toMediaPath } from "libs/utils";
import {
  BroadcastZoneConfig,
  CircleConfig,
  RectangleConfig,
  FlatShapeConfig,
} from "spaceTypes";
import { peersDb, serverTime } from "db";
import { setIsBroadcastingInZone } from "stateFromDb";
import { useGlobalPointerOverLayer } from "hooks/useLayers";
import { useContext } from "react";
import { ElementsContext } from "./Tree/ElementsTree";
import { PointerOverContext } from "hooks/useGlobalPointerOver";

const depth = 0.1;

const Cylinder = ({ config }: { config: CircleConfig | undefined }) => {
  const values = useConfigOrDefault(config, defaultCircleConfig);

  return (
    <cylinderBufferGeometry
      args={[
        values.radius,
        values.radius,
        depth,
        values.segments,
        undefined,
        undefined,
        values.thetaStart,
        values.thetaEnd,
      ]}
    />
  );
};

const Box = ({ config }: { config: RectangleConfig | undefined }) => {
  const values = useConfigOrDefault(config, defaultRectangleConfig);

  return <boxBufferGeometry args={[values.width, depth, values.height]} />;
};

const BroadcastZoneShape = ({
  config,
  visualize,
  setShape,
  isInZone,
}: {
  config: FlatShapeConfig | undefined;
  visualize: boolean | undefined;
  setShape: (shape: THREE.Mesh | null) => void;
  isInZone: boolean;
}) => {
  const values = useConfigOrDefault(config, defaultFlatShapeConfig);

  const pointerOverContext = useContext(PointerOverContext);

  const setMeshForDynamicLayer = useGlobalPointerOverLayer(
    pointerOverContext?.enablePointerOverLayer$
  );

  const aggregateSetMesh = useCallback(
    (mesh: Mesh | null) => {
      setMeshForDynamicLayer(mesh);
      setShape(mesh);
    },
    [setMeshForDynamicLayer, setShape]
  );
  return (
    <mesh ref={aggregateSetMesh} visible={visualize}>
      {values.kind === "circle" && <Cylinder config={values.circle} />}
      {values.kind === "rectangle" && <Box config={values.rectangle} />}
      <meshBasicMaterial
        color={isInZone ? "red" : "white"}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
};

const setRaycasterAboveLookingDown = (
  raycaster: Raycaster,
  cameraPosition: Vector3
) => {
  raycaster.set(
    new Vector3(cameraPosition.x, cameraPosition.y + 10, cameraPosition.z),
    new Vector3(0, -1, 0)
  );
};

async function storeIsInZone(
  { userInfo, path }: { userInfo: UserInfo; path: string },
  isInZone: boolean
) {
  const docRef = peersDb.ref(
    `broadcastZones/${userInfo.spaceId}/${path}/${userInfo.sessionId}`
  );

  await docRef.set({
    userId: userInfo.userId,
    inZone: isInZone,
    lastChanged: serverTime(),
  });
}

const subscribeToAnyoneInZone = (
  { path, spaceId }: { path: string; spaceId: string },
  setAnyoneInZone: (anyoneInZone: boolean) => void
) => {
  const docRef = peersDb
    .ref(`broadcastZones/${spaceId}/${path}`)
    .orderByChild("inZone")
    .equalTo(true);

  docRef.on("value", (docs) => {
    const anyoneInZone = docs.numChildren() > 0;
    setAnyoneInZone(anyoneInZone);
  });

  const unsubsribe = () => {
    docRef.off("value");
  };

  return unsubsribe;
};

const unsetHasBroadcastInZoneWhenDisconnects = ({
  userInfo,
  path,
}: {
  userInfo: Concrete<UserInfo>;
  path: string;
}) => {
  const docRef = peersDb.ref(
    `broadcastZones/${userInfo.spaceId}/${path}/${userInfo.sessionId}`
  );

  // Create a reference to the special '.info/connected' path in
  // Realtime Database. This path returns `true` when connected
  // and `false` when disconnected.
  peersDb.ref(".info/connected").on("value", function (snapshot) {
    // If we're not currently connected, don't do anything.
    if (snapshot.val() === false) {
      return;
    }

    docRef.onDisconnect().set({
      userId: userInfo.userId,
      inZone: false,
      lastChanged: serverTime(),
    });
  });
};

const BroadcastZone = ({
  config,
  path,
  ...rest
}: {
  config?: BroadcastZoneConfig;
  path: string[];
}) => {
  const values = useConfigOrDefault(config, defaultBroadcastZoneConfig);

  const [mediaPath] = useState(() => toMediaPath(path));

  const { camera } = useThree();

  const raycaster = useRef(new Raycaster());
  const [zoneShape, setZoneShape] = useState<Mesh | null>(null);

  const [hasSetInZone, setHasSetInZone] = useState(false);
  const [isInZone, setIsInZone] = useState(false);

  const checkAndUpdateIfBroadcasting = useCallback(() => {
    if (!camera || !zoneShape) return;

    const caster = raycaster.current;

    setRaycasterAboveLookingDown(caster, camera.position);

    const isInZone = caster.intersectObject(zoneShape).length > 0;

    setIsInZone(isInZone);
  }, [camera, zoneShape]);

  const elementsContext = useContext(ElementsContext);
  const userInfo = elementsContext?.userInfo;

  useEffect(() => {
    if (!userInfo || !userInfo.sessionId) return;
    if (isInZone) {
      // console.log("storing in zone");
      storeIsInZone(
        {
          userInfo,
          path: mediaPath,
        },
        true
      );

      setIsBroadcastingInZone(
        {
          ...(userInfo as Concrete<UserInfo>),
          audio: config?.sound,
          zonePath: mediaPath,
        },
        true
      );
      setHasSetInZone(true);

      return () => {
        // on unmount, or when no longer in zone, remove from set is in zone.
        storeIsInZone({ userInfo, path: mediaPath }, false);
        // cleanup - when unmounted, and if has set in zone, remove
        // this from broadcasting in zone.
        setIsBroadcastingInZone(
          {
            ...(userInfo as Concrete<UserInfo>),
            zonePath: mediaPath,
          },
          false
        );
      };
    }
  }, [config?.sound, isInZone, mediaPath, userInfo]);

  const [anyoneInZone, setAnyoneInZone] = useState(false);

  useEffect(() => {
    if (!elementsContext?.spaceId) return;
    const unsub = subscribeToAnyoneInZone(
      { path: mediaPath, spaceId: elementsContext?.spaceId },
      setAnyoneInZone
    );

    return () => {
      unsub();
    };
  }, [elementsContext?.spaceId, mediaPath]);

  useEffect(() => {
    if (!userInfo || !userInfo.sessionId) return;
    if (hasSetInZone) {
      unsetHasBroadcastInZoneWhenDisconnects({
        userInfo: userInfo as Concrete<UserInfo>,
        path: mediaPath,
      });
    }
  }, [userInfo, mediaPath, hasSetInZone]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkAndUpdateIfBroadcasting();
    }, 100);

    return () => {
      clearInterval(interval);
    };
  });

  return (
    <BroadcastZoneShape
      {...rest}
      config={values.shape}
      visualize={values.visualize}
      setShape={setZoneShape}
      isInZone={anyoneInZone}
    />
  );
};

export default BroadcastZone;
