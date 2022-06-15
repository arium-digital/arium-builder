import React, { memo, useState } from "react";
import { PeerPlayerPositions, PeersSettings } from "../../types";
import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import {
  useBehaviorSubjectFromCurrentValue,
  useCurrentValueFromObservable,
} from "../../hooks/useObservable";
import usePeerModerationControls from "hooks/usePeerModerationContrrols";
import ModerationDisplay from "./ModerationDisplay";
import PositionedAvatar, { InstancedComponent } from "./PositionedAvatar";
import { useObservePlayerQuaternion } from "hooks/usePeerInSpace";
import { PeerAndDistance } from "communicationTypes";
import { useEffect } from "react";
import { distinctUntilChanged, map, pluck } from "rxjs/operators";
import { usePeerMetadata } from "hooks/usePeersMetadata";
import { Merged } from "@react-three/drei";
import { AvatarMeshes } from "./AvatarMesh";
import { SessionPaths } from "shared/dbPaths";

export function setEquals<T>(as: Set<T>, bs: Set<T>) {
  if (as.size !== bs.size) return false;
  for (let a of Array.from(as.values())) {
    if (!bs.has(a)) return false;
  }
  return true;
}

const emptySet = new Set<string>();

const PeerAvatars = memo(
  ({
    peerPositions$,
    visiblePeersSortedByDistance$,
    activeSessions$,
    spaceId,
    sessionId$,
    spaceId$,
    peersSettings$,
    avatarMeshes,
    sessionPaths$,
  }: {
    visiblePeersSortedByDistance$: Observable<PeerAndDistance[]>;
    peerPositions$: Observable<PeerPlayerPositions>;
    peersSettings$: Observable<PeersSettings>;
    activeSessions$: Observable<Set<string>>;
    spaceId: string | undefined;
    sessionId$: Observable<string | undefined>;
    spaceId$: Observable<string>;
    avatarMeshes: AvatarMeshes | undefined;
    sessionPaths$: Observable<SessionPaths | undefined>;
  }) => {
    const moderation = usePeerModerationControls({ spaceId });

    const playerQuaternions$ = useObservePlayerQuaternion(
      spaceId$,
      sessionId$,
      activeSessions$
    );

    const activeSessions = useCurrentValueFromObservable(
      activeSessions$,
      emptySet
    );

    const [visiblePeers$] = useState(
      new BehaviorSubject<Set<string>>(emptySet)
    );
    const [tweenedPeers$] = useState(
      new BehaviorSubject<Set<string>>(emptySet)
    );
    const [textVisiblePeers$] = useState(
      new BehaviorSubject<Set<string>>(emptySet)
    );
    const peerMetadata = usePeerMetadata({ spaceId });
    const peerMetadata$ = useBehaviorSubjectFromCurrentValue(peerMetadata);

    useEffect(() => {
      const sub = combineLatest([visiblePeersSortedByDistance$, sessionId$])
        .pipe(
          map(([peers, sessionId]) => {
            return new Set<string>(
              peers.map((x) => x.id).filter((x) => x !== sessionId)
            );
          }),
          distinctUntilChanged(setEquals)
        )
        .subscribe(visiblePeers$);

      return () => sub.unsubscribe();
    }, [sessionId$, visiblePeers$, visiblePeersSortedByDistance$]);

    useEffect(() => {
      const maxTweened$ = peersSettings$.pipe(
        pluck("maxTweenedPeers"),
        distinctUntilChanged()
      );
      const sub = combineLatest([
        visiblePeersSortedByDistance$,
        sessionId$,
        maxTweened$,
      ])
        .pipe(
          map(([peers, sessionId, maxTweened]) => {
            return new Set<string>(
              peers
                .slice(0, maxTweened)
                .map((x) => x.id)
                .filter((x) => x !== sessionId)
                .slice()
            );
          }),
          distinctUntilChanged(setEquals)
        )
        .subscribe(tweenedPeers$);

      return () => sub.unsubscribe();
    }, [
      peersSettings$,
      sessionId$,
      tweenedPeers$,
      visiblePeersSortedByDistance$,
    ]);

    useEffect(() => {
      const maxTextDistance = 20;
      const distanceSquared = Math.pow(maxTextDistance, 2);
      const sub = visiblePeersSortedByDistance$
        .pipe(
          map((peers) => {
            return new Set<string>(
              peers
                .filter((x) => x.distance <= distanceSquared)
                .map((x) => x.id)
            );
          }),
          distinctUntilChanged(setEquals)
        )
        .subscribe(textVisiblePeers$);

      return () => sub.unsubscribe();
    }, [textVisiblePeers$, visiblePeersSortedByDistance$]);

    return (
      <>
        {avatarMeshes && (
          <Merged meshes={avatarMeshes.body}>
            {(...instancedMeshes: InstancedComponent[]) =>
              Array.from(activeSessions).map((sessionId) => (
                <PositionedAvatar
                  key={sessionId}
                  sessionId={sessionId}
                  moderation={moderation}
                  peerPositions$={peerPositions$}
                  playerQuaternions$={playerQuaternions$}
                  instancedMeshes={instancedMeshes}
                  cameraSurfaces={avatarMeshes.cameraSurfaces}
                  visiblePeers$={visiblePeers$}
                  tweenedPeers$={tweenedPeers$}
                  peerMetadata$={peerMetadata$}
                  textVisiblePeers$={textVisiblePeers$}
                  namePosition={avatarMeshes.namePosition}
                  sessionPaths$={sessionPaths$}
                />
              ))
            }
          </Merged>
        )}

        {moderation.enable && (
          <ModerationDisplay
            peerPositions$={peerPositions$}
            moderatingPeer$={moderation.moderatingPeer$}
            selectPeer={moderation.selectPeer}
          />
        )}
      </>
    );
  }
);

export default PeerAvatars;
