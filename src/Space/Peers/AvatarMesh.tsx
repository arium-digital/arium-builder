import useModelFile from "Space/Elements/Model/useModelFile";
import { BASE_CAMERA_HEIGHT } from "config";
import { useFileDownloadUrl } from "fileUtils";
import { useCurrentValueFromObservable } from "hooks/useObservable";
import { memo, useEffect, useState } from "react";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Theme } from "spaceTypes/theme";
import { Mesh, MeshBasicMaterial, MeshStandardMaterial, Vector3 } from "three";
import { Text } from "@react-three/drei";
import fonts from "shared/fonts";
import { AvatarConfig } from "spaceTypes/AvatarConfig";
import { IVector3 } from "spaceTypes/shared";

export interface AvatarMeshes {
  cameraSurfaces: Mesh[];
  body: Mesh[];
  audioPreview: Mesh | undefined;
  namePosition: Vector3;
  cameraPosition: Vector3;
  selfViewPosition?: Vector3;
  selfViewRotation?: Vector3;
}

// avatarPosition={{
//             x: 0,
//             y: -0.8,
//             z: 2.2,
//           }}
//           avatarRotation={{
//             x: 0.27,
//             y: -0.27,
//           }}

const parseAvatarMeshes = ({
  nodes,
  selfViewPosition = {
    x: 0,
    y: -1.2,
    z: 2.4,
  },
  selfViewRotation = {
    x: 0,
    y: -0.27,
    z: 0,
  },
}: {
  nodes: Mesh[];
  selfViewPosition?: IVector3;
  selfViewRotation?: IVector3;
}): AvatarMeshes => {
  const cameraSurfaces = Object.values(nodes)
    .filter((x) => {
      if (!x.isMesh) return false;

      return !!x.userData.cameraSurface;
    })
    .map((x) => {
      const modifiedMesh = x.clone(true) as Mesh;

      const existingMaterial = modifiedMesh.material as MeshStandardMaterial;
      const color = existingMaterial.color || 0xffffff;

      modifiedMesh.material = new MeshBasicMaterial({
        color,
      });

      return modifiedMesh;
    });

  const body = Object.values(nodes).filter((x) => {
    if (!x.isMesh) return false;

    return !!x.userData.body;
  });

  const nameObject = Object.values(nodes).find((x) => !!x.userData.nameDisplay);
  const namePosition = nameObject?.position || new Vector3(0, 0.7, 0.5);

  const cameraObject = Object.values(nodes).find((x) => !!x.userData.camera);

  const audioPreviewMesh = Object.values(nodes).find(
    (x) => x.isMesh && !!x.userData.audioLevelIndicator
  );

  const cameraPosition =
    cameraObject?.position || new Vector3(0, BASE_CAMERA_HEIGHT, 0);

  return {
    cameraSurfaces,
    body,
    namePosition,
    cameraPosition,
    audioPreview: audioPreviewMesh,
    selfViewPosition: new Vector3(
      selfViewPosition.x || 0,
      selfViewPosition.y || 0,
      selfViewPosition.z || 0
    ),
    selfViewRotation: new Vector3(
      selfViewRotation.x || 0,
      selfViewRotation.y || 0,
      selfViewRotation.z || 0
    ),
  };
};

export const useAvatarMeshes = (theme$: Observable<Theme | undefined>) => {
  const [meshes, setMeshes] = useState<AvatarMeshes>();

  const [avatarConfig, setAvatarFileLocation] = useState<
    AvatarConfig | undefined
  >();

  useEffect(() => {
    const sub = theme$
      .pipe(
        map((theme) => {
          return theme?.defaultAvatar || undefined;
        })
      )
      .subscribe(setAvatarFileLocation);

    return () => sub.unsubscribe();
  }, [theme$]);

  const avatarFileUrl = useFileDownloadUrl(avatarConfig?.avatarFile, true);

  const { model } = useModelFile(avatarFileUrl);

  useEffect(() => {
    if (model) {
      setMeshes(
        parseAvatarMeshes({
          nodes: model.children as Mesh[],
          selfViewPosition: avatarConfig?.selfViewPosition || undefined,
          selfViewRotation: avatarConfig?.selfViewRotation || undefined,
        })
      );
    }
  }, [
    avatarConfig?.selfViewPosition,
    avatarConfig?.selfViewRotation,
    model,
    setMeshes,
  ]);

  return meshes;
};

export const AudioPreviewFromMesh = ({
  mesh,
  volume$,
}: {
  mesh: Mesh;
  volume$: Observable<number>;
}) => {
  const volume = useCurrentValueFromObservable(volume$, 0);
  return (
    <mesh
      position={mesh.position}
      rotation={mesh.rotation}
      scale={mesh.scale}
      geometry={mesh.geometry}
    >
      <meshBasicMaterial
        transparent={true}
        opacity={volume * 3}
        color={`rgba(255,255,0,1)`}
      />
    </mesh>
  );
};

export const NameDisplay = memo(
  ({ name, visible }: { name: string | null; visible?: boolean }) => {
    return (
      <Text
        color="white"
        outlineColor="black"
        outlineWidth={0.005}
        anchorX="center"
        anchorY="middle"
        font={fonts.Comfortaa}
        fontSize={0.3}
        // position-y={0.35}
        // position-z={0.5}
        visible={visible}
      >
        {name}
      </Text>
    );
  }
);
