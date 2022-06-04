import React, { useEffect, useState, memo, useMemo } from "react";
import { PossiblyNullStringDict } from "../../types";
import { AvatarMeshes } from "./AvatarMesh";
import { METADATA_KEYS } from "hooks/usePeersMetadata";
import { NameDisplay } from "components/Consumers/AvatarMesh";
import AvatarCameraSurfaces from "./AvatarCameraSurfaces";
import { Color, Material, Mesh, Object3D, Texture, Vector3 } from "three";
import { imageTextureForPhotoUrl$ } from "hooks/usePeerInSpace";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { useFrame, useThree } from "@react-three/fiber";

export interface AvatarTextures {
  imageTexture: Texture | null | undefined;
}

export interface SelfAvatar {
  textures: AvatarTextures;
  volume$: Observable<number>;
}

export const useSelfAvatar = ({
  selfMetadata$,
}: {
  selfMetadata$: Observable<PossiblyNullStringDict | undefined>;
}): SelfAvatar => {
  const [textures, setTextures] = useState<AvatarTextures>({
    imageTexture: null,
  });

  const volume$ = useMemo(() => new BehaviorSubject(0), []);

  useEffect(() => {
    const imageTexture$ = imageTextureForPhotoUrl$(selfMetadata$);

    const sub = imageTexture$
      .pipe(map((imageTexture) => ({ imageTexture })))
      .subscribe(setTextures);

    return () => sub.unsubscribe();
  }, [selfMetadata$]);

  return {
    textures,
    volume$,
  };
};

type SelfAvatarProps = {
  metadata: PossiblyNullStringDict | undefined;
  preferVideoOrPhotoTexture?: "photo" | "video";
};

function getTextureToShow(
  preferVideoOrPhotoTexture: string | undefined,
  textures: AvatarTextures
) {
  return textures.imageTexture;
}

const SetPositionFromCamera = ({
  object,
  avatarCameraPosition,
}: {
  object: Object3D;
  avatarCameraPosition: Vector3;
}) => {
  const { camera } = useThree();

  // const lookAtVector = useRef(new Vector3());

  useFrame(() => {
    object.position.copy(camera.position).add(avatarCameraPosition);

    // lookAtVector.current.set(0,0,-1);
    // lookAtVector.current.applyQuaternion(camera.quaternion);
    // lookAtVector.current.normalize()
  });

  return null;
};

const SelfAvatarComponent = memo(
  ({
    metadata,
    preferVideoOrPhotoTexture,
    selfAvatar,
    avatarMeshes,
    setPositionFromCamera,
  }: SelfAvatarProps & {
    selfAvatar: SelfAvatar;
    avatarMeshes: AvatarMeshes | undefined;
    setPositionFromCamera?: boolean;
  }): JSX.Element | null => {
    const { textures } = selfAvatar;

    const bodyColorValue = metadata?.[METADATA_KEYS.bodyColor];
    const color = useMemo(() => {
      if (!bodyColorValue) return undefined;
      return new Color(bodyColorValue);
    }, [bodyColorValue]);

    const [bodyMeshes, setBodyMeshes] = useState<Mesh[] | undefined>();

    useEffect(() => {
      if (!avatarMeshes?.body) {
        setBodyMeshes(undefined);
      } else if (!color) {
        setBodyMeshes(avatarMeshes.body);
      } else {
        const clonedMeshes = avatarMeshes.body.map((x) => x.clone(true));
        clonedMeshes.forEach((mesh) => {
          const modifiedMaterial = (mesh.material as Material).clone();

          // @ts-ignore
          if (modifiedMaterial.color) modifiedMaterial.color = color;

          mesh.material = modifiedMaterial;
        });

        setBodyMeshes(clonedMeshes);

        return () => {
          clonedMeshes.forEach((mesh) => mesh.geometry?.dispose());
        };
      }
    }, [color, avatarMeshes?.body]);

    const [groupRef, setGroupRef] = useState<Object3D | null>(null);

    const textureToShow = getTextureToShow(preferVideoOrPhotoTexture, textures);
    return (
      <>
        <group ref={setGroupRef}>
          {avatarMeshes && (
            <>
              {bodyMeshes?.map((mesh, i) => (
                <primitive key={i} object={mesh} />
              ))}
              <AvatarCameraSurfaces
                cameraTexture={textureToShow}
                meshes={avatarMeshes.cameraSurfaces}
              />
              {metadata && metadata[METADATA_KEYS.name] && (
                <group position={avatarMeshes.namePosition}>
                  <NameDisplay name={metadata[METADATA_KEYS.name]} visible />
                </group>
              )}
            </>
          )}
        </group>
        {setPositionFromCamera && groupRef && avatarMeshes?.cameraPosition && (
          <SetPositionFromCamera
            object={groupRef}
            avatarCameraPosition={avatarMeshes.cameraPosition}
          />
        )}
      </>
    );
  }
);

export default SelfAvatarComponent;
