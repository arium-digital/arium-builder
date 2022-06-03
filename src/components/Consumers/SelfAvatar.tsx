import React, { useEffect, useState, memo, useMemo } from "react";
import { PossiblyNullStringDict } from "../../types";
import { AvatarMeshes } from "./AvatarMesh";
import { METADATA_KEYS } from "hooks/usePeersMetadata";
import {
  AudioPreviewFromMesh,
  NameDisplay,
} from "components/Consumers/AvatarMesh";
import AvatarCameraSurfaces from "./AvatarCameraSurfaces";
import { Color, Material, Mesh, Object3D, Texture, Vector3 } from "three";
import { useBehaviorSubjectFromCurrentValue } from "hooks/useObservable";
import {
  imageTextureForPhotoUrl$,
  videoTextureForElement$,
} from "hooks/usePeerInSpace";
import { combineLatest, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { useAudioMeter } from "components/utils/audio-meter";
import { useFrame, useThree } from "@react-three/fiber";
import { createMediaElement } from "./hooks/useConsumers";

export interface AvatarTextures {
  toShow: Texture | null | undefined;
  videoTexture: Texture | null | undefined;
  imageTexture: Texture | null | undefined;
}

export interface SelfAvatar {
  volume$: Observable<number>;
  textures: AvatarTextures;
  videoElement: HTMLVideoElement | null | undefined;
  videoTrack: MediaStreamTrack | null | undefined;
}

export const useSelfAvatar = ({
  audioContext,
  videoTrack,
  audioStream,
  selfMetadata$,
  videoPaused,
}: {
  audioContext: AudioContext | undefined;
  videoTrack: MediaStreamTrack | undefined;
  audioStream: MediaStreamTrack | undefined;
  selfMetadata$: Observable<PossiblyNullStringDict | undefined>;
  videoPaused: boolean;
}): SelfAvatar => {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement>();

  const videoElement$ = useBehaviorSubjectFromCurrentValue(videoElement);

  const cameraPaused$ = useBehaviorSubjectFromCurrentValue(videoPaused);

  const volume$ = useAudioMeter({
    audioContext,
    audioStreamTrack: audioStream,
  });

  useEffect(() => {
    if (videoTrack) {
      const videoElement = createMediaElement({
        kind: "webcamVideo",
        track: videoTrack,
      });

      setVideoElement(videoElement as HTMLVideoElement);

      return () => {
        setTimeout(() => {
          videoElement.pause();
          document.body.removeChild(videoElement);
        }, 2000);
      };
    }
  }, [videoTrack]);

  const [textures, setTextures] = useState<AvatarTextures>({
    imageTexture: null,
    videoTexture: null,
    toShow: null,
  });

  useEffect(() => {
    const videoTexture$ = videoTextureForElement$(videoElement$);

    const imageTexture$ = imageTextureForPhotoUrl$(selfMetadata$);

    const sub = combineLatest([videoTexture$, imageTexture$, cameraPaused$])
      .pipe(
        map(([videoTexture, imageTexture, cameraPaused]) => {
          let toShow: Texture | null | undefined;
          if (cameraPaused) {
            toShow = imageTexture;
          } else {
            toShow = videoTexture || imageTexture;
          }

          return {
            toShow,
            videoTexture,
            imageTexture,
          };
        })
      )
      .subscribe(setTextures);

    return () => sub.unsubscribe();
  }, [cameraPaused$, selfMetadata$, videoElement$]);

  return {
    textures,
    volume$,
    videoElement,
    videoTrack,
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
  if (preferVideoOrPhotoTexture) {
    if (preferVideoOrPhotoTexture === "photo") return textures.imageTexture;
    return textures.videoTexture;
  }

  return textures.toShow;
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
    const { textures, volume$ } = selfAvatar;

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
              {avatarMeshes.audioPreview && (
                <AudioPreviewFromMesh
                  mesh={avatarMeshes.audioPreview}
                  volume$={volume$}
                />
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
