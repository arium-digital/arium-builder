import { useBehaviorSubjectFromCurrentValue } from "hooks/useObservable";
import React, { useCallback, useEffect, useState } from "react";
// @ts-ignore
import { createRoot } from "react-dom/client";
import { from, Observable } from "rxjs";
import { first, pluck, switchMap } from "rxjs/operators";
import { PeerPlayerPositions } from "types";
import { Billboard, Html } from "@react-three/drei";
import { Vector3 } from "three";
import { SyntheticEvent } from "react-draft-wysiwyg";
import { functions } from "db";

const banPeer = async (sessionId: string) => {
  await functions().httpsCallable("banUser")({
    sessionId,
  });
};

const HtmlInject = ({ children }: { children: React.ReactChild }) => {
  useEffect(() => {
    const domElement = document.createElement("div");
    document.body.appendChild(domElement);

    const root = createRoot(domElement);
    root.render(<div>{children}</div>);
    return () => {
      root.unmount();

      document.body.removeChild(domElement);
    };
  }, [children]);
  return null;
};
const ModerationDisplay = ({
  peerPositions$,
  moderatingPeer$,
  selectPeer,
}: {
  peerPositions$: Observable<PeerPlayerPositions>;
  moderatingPeer$: Observable<string | null>;
  selectPeer: (peerId: string | null) => void;
}) => {
  const moderatingPeer = useBehaviorSubjectFromCurrentValue(moderatingPeer$);

  const [moderatingPosition, setModeratingPosition] = useState<Vector3 | null>(
    null
  );

  useEffect(() => {
    const sub = moderatingPeer$
      .pipe(
        switchMap((moderatingPeer) => {
          if (!moderatingPeer) return from([null]);

          return peerPositions$.pipe(pluck(moderatingPeer));
        })
      )
      .subscribe({
        next: (position) => {
          if (!position) {
            setModeratingPosition(null);
            return;
          }

          setModeratingPosition(
            new Vector3(position[0], position[1] + 1, position[2])
          );
        },
      });

    return () => {
      sub.unsubscribe();
    };
  }, [moderatingPeer$, peerPositions$]);

  const [banningPeer, setBanningPeer] = useState(false);

  const openBan = useCallback(
    async (e: SyntheticEvent) => {
      e.preventDefault();
      const ban = window.confirm("Kick out this user?");

      if (ban) {
        setBanningPeer(true);
        const peerId = await moderatingPeer$.pipe(first()).toPromise();
        if (peerId) {
          await banPeer(peerId);
          selectPeer(null);
        }
        setBanningPeer(false);
      }
    },
    [moderatingPeer$, selectPeer]
  );

  return (
    <>
      <HtmlInject>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 200,
            backgroundColor: "red",
            padding: 10,
            textAlign: "center",
          }}
        >
          Moderating Users
        </div>
      </HtmlInject>

      {moderatingPeer && moderatingPosition && (
        <>
          <Billboard
            follow={true} // Follow the camera (default=true)
            lockX={false} // Lock the rotation on the x axis (default=false)
            lockY={false} // Lock the rotation on the y axis (default=false)
            lockZ={false} // Lock the rotation on the z axis (default=false)
            position={moderatingPosition}
            visible={false}
          >
            <Html>
              <button
                onClick={openBan}
                style={{ width: 100, height: 100 }}
                disabled={banningPeer}
              >
                Kick User
              </button>
            </Html>
          </Billboard>
        </>
      )}
    </>
  );
};

export default ModerationDisplay;
