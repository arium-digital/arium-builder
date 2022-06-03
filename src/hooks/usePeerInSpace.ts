import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  from,
  fromEvent,
  Observable,
  ReplaySubject,
} from "rxjs";
import { AggregateObservedConsumers, PeersMetaData } from "communicationTypes";
import { useEffect, useState } from "react";
import {
  filter,
  map,
  switchMap,
  pluck,
  distinctUntilChanged,
  publishReplay,
  startWith,
} from "rxjs/operators";
import {
  PeerPlayerPositions,
  PlayerPosition,
  PlayerQuaternion,
  PossiblyNullStringDict,
  StringDict,
} from "../types";
import { filterUndefined } from "libs/rx";
import { sRGBEncoding, Texture, TextureLoader, Vector2 } from "three";
import { METADATA_KEYS } from "./usePeersMetadata";
import { observePeerPlayerQuarternions, StateChange } from "stateFromDb";
import { useCurrentValueFromBehaviorSubject } from "./useObservable";
import VideoTexture from "components/utils/VideoTexture";
import {
  cropToOffsetAndScale,
  squareCropFromSize,
} from "components/Elements/Video/videoUtils";

export interface QuaternionUpdate {
  sessionId: string;
  quaternion: PlayerQuaternion;
}

export const useObservePlayerQuaternion = (
  spaceId$: Observable<string>,
  sessionId$: Observable<string | undefined>,
  activeSessions$: Observable<Set<string>>
) => {
  const [playerQuaternions$] = useState(
    () => new ReplaySubject<QuaternionUpdate>(5)
  );

  useEffect(() => {
    const observed$ = combineLatest([spaceId$, sessionId$]).pipe(
      switchMap(([spaceId, sessionId]) => {
        if (!sessionId) return EMPTY;
        return observePeerPlayerQuarternions({
          spaceId,
          sessionId,
          activeSessions$,
        });
      }),
      filter((x) => !x.remove),
      map((update) => ({
        sessionId: update.sessionId,
        quaternion: (update as StateChange<PlayerQuaternion>).change,
      }))
    );

    const sub = observed$.subscribe(playerQuaternions$);

    return () => sub.unsubscribe();
  }, [activeSessions$, playerQuaternions$, sessionId$, spaceId$]);

  return playerQuaternions$;
};

export interface PeerObject3d {
  position: [number, number, number];
  quaternion: [number, number, number, number];
}

export interface AvatarDisplay {
  name: string | null;
  textureToUse: Texture | null;
  metadata?: StringDict;
}

const getTextureForPhoto = async (photoUrl: string) => {
  if (!photoUrl) return undefined;

  const imageTexture = await loadImageTexture(photoUrl);

  imageTexture.flipY = false;
  imageTexture.needsUpdate = true;

  return imageTexture;
};

export const videoTextureForElement$ = (
  videoElement$: Observable<HTMLVideoElement | undefined>
) => {
  return videoElement$.pipe(
    switchMap((video) => {
      if (!video) return from([null]);
      const texture = new VideoTexture(video);
      texture.encoding = sRGBEncoding;
      texture.flipY = false;
      texture.needsUpdate = true;

      const videoSize$ = observeVideoSize(video).pipe(startWith(null));

      return videoSize$.pipe(
        map((videoSize) => {
          cropTextureToBox(texture, videoSize);

          return texture;
        })
      );
    })
  );
};

export const imageTextureForPhotoUrl$ = (
  metadata$: Observable<PossiblyNullStringDict | null | undefined>
) => {
  const imageTexture$ = metadata$.pipe(
    distinctUntilChanged(),
    map((metadata) => metadata || {}),
    pluck(METADATA_KEYS.photo),
    distinctUntilChanged(),
    switchMap(async (photoUrl) => {
      if (photoUrl) return getTextureForPhoto(photoUrl);

      return null;
    })
  );

  return imageTexture$;
};

const usePeerInSpace = ({
  sessionId,
  consumers$,
  peerPositions$,
  peerMetadata$,
  visiblePeers$,
  tweenedPeers$,
  playerQuaternions$,
  textVisiblePeers$,
}: {
  sessionId: string;
  visiblePeers$: Observable<Set<string>>;
  tweenedPeers$: Observable<Set<string>>;
  consumers$: Observable<AggregateObservedConsumers>;
  peerPositions$: Observable<PeerPlayerPositions>;
  peerMetadata$: Observable<PeersMetaData | undefined>;
  playerQuaternions$: Observable<QuaternionUpdate>;
  textVisiblePeers$: Observable<Set<string>>;
}) => {
  const [avatar, setAvatar] = useState<{
    textureToUse: Texture | null | undefined;
    metadata: PossiblyNullStringDict | undefined;
  }>({
    textureToUse: undefined,
    metadata: undefined,
  });

  const [visible$] = useState(new BehaviorSubject<boolean>(false));

  useEffect(() => {
    const metadataOfPeer$ = peerMetadata$.pipe(
      filterUndefined(),
      pluck(sessionId),
      distinctUntilChanged()
    );

    const avatarInfoFromMetaData$ = metadataOfPeer$.pipe(
      publishReplay(1, undefined, (metadata$) => {
        // todo: dispose image texture on complete
        const imageTexture$ = imageTextureForPhotoUrl$(metadata$);

        return combineLatest([imageTexture$, metadata$]).pipe(
          map(([imageTexture, metadata]) => ({
            imageTexture,
            metadata,
          }))
        );
      }),
      startWith({
        imageTexture: undefined,
        metadata: undefined,
      })
    );

    const webcamConsumer$ = consumers$.pipe(
      pluck(sessionId),
      distinctUntilChanged(),
      pluck("webcamVideo"),
      distinctUntilChanged()
    );

    const consumerWithTexture$ = webcamConsumer$
      .pipe(
        publishReplay(1, undefined, (consumer$) => {
          const videoElement$ = consumer$.pipe(
            filterUndefined(),
            map((consumer) => consumer.mediaElement as HTMLVideoElement),
            distinctUntilChanged()
          );

          const texture$ = videoTextureForElement$(videoElement$);

          return combineLatest([consumer$, texture$]).pipe(
            map(([consumer, texture]) => ({
              ...consumer,
              texture,
            }))
          );
        })
      )
      .pipe(startWith(undefined));

    const sub = combineLatest([
      avatarInfoFromMetaData$,
      consumerWithTexture$,
      visible$,
    ])
      .pipe(
        map(([{ imageTexture, metadata }, webcamConsumer, visible]) => {
          const showVideo = !webcamConsumer?.paused && webcamConsumer?.texture;

          const textureToUse = showVideo
            ? webcamConsumer?.texture
            : imageTexture || null;

          return {
            textureToUse,
            metadata,
            visible,
          };
        })
      )
      .subscribe(setAvatar);

    const subB = visiblePeers$
      .pipe(
        map((visiblePeers) => visiblePeers.has(sessionId)),
        distinctUntilChanged()
      )
      .subscribe(visible$);

    return () => {
      sub.unsubscribe();
      subB.unsubscribe();
    };
  }, [consumers$, peerMetadata$, sessionId, visible$, visiblePeers$]);

  const [targetPosition, setPosition] = useState<PlayerPosition>();
  const [targetQuaternion, setQuarternion] = useState<PlayerQuaternion>();
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    const sub = textVisiblePeers$
      .pipe(map((visible) => visible.has(sessionId)))
      .subscribe(setTextVisible);

    return () => sub.unsubscribe();
  }, [textVisiblePeers$, sessionId]);

  useEffect(() => {
    const subA = peerPositions$
      .pipe(pluck(sessionId), distinctUntilChanged())
      .subscribe({ next: (p) => setPosition(p) });

    const subB = playerQuaternions$
      .pipe(
        filter((x) => x.sessionId === sessionId),
        map((x) => x.quaternion)
      )
      .subscribe({ next: (r) => setQuarternion(r) });

    return () => {
      subA.unsubscribe();
      subB.unsubscribe();
    };
  }, [peerPositions$, playerQuaternions$, sessionId]);

  const [animate, setAnimated] = useState(false);

  useEffect(() => {
    const sub = tweenedPeers$
      .pipe(map((x) => x.has(sessionId)))
      .subscribe(setAnimated);

    return () => sub.unsubscribe();
  }, [tweenedPeers$, sessionId]);

  const visible = useCurrentValueFromBehaviorSubject(visible$);

  return {
    avatar,
    visible,
    targetPosition,
    targetQuaternion,
    animate,
    textVisible,
  };
};

export default usePeerInSpace;

const loadImageTexture = async (photoUrl: string): Promise<Texture> => {
  const loader = new TextureLoader();

  // load a resource
  return new Promise<Texture>((resolve, reject) => {
    loader.load(
      // resource URL
      photoUrl,

      // onLoad callback
      function (texture) {
        texture.encoding = sRGBEncoding;
        resolve(texture);
      },

      // onProgress callback currently not supported
      undefined,

      // onError callback
      function (err) {
        reject(err);
      }
    );
  });
};
function observeVideoSize(
  video: HTMLVideoElement
): Observable<{ width: number; height: number } | null> {
  if (video.videoWidth && video.videoHeight)
    return from([
      {
        width: video.videoWidth,
        height: video.videoHeight,
      },
    ]);

  return fromEvent(video, "loadedmetadata").pipe(
    map(() => {
      if (video.videoWidth && video.videoHeight)
        return {
          width: video.videoWidth,
          height: video.videoHeight,
        };

      return null;
    })
  );
}

function cropTextureToBox(
  texture: VideoTexture,
  videoSize: { width: number; height: number } | null
) {
  texture.center.setX(0.5);
  texture.center.setY(0.5);

  if (videoSize) {
    const crop = squareCropFromSize(videoSize);

    const { offset, scale } = cropToOffsetAndScale(crop);
    texture.offset = new Vector2(offset.x, offset.y);

    texture.repeat.set(scale.x, scale.y);
  }
}
