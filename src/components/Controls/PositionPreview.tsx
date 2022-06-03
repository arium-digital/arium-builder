import React, { FC, useEffect, /*useMemo,*/ useRef, useState } from "react";
import { Observable, interval } from "rxjs";
import { PlayerLocation } from "types";
import { Html /*useHelper*/ } from "@react-three/drei";
import { useCurrentValueFromObservable } from "hooks/useObservable";
import { useAuthentication } from "hooks/auth/useAuthentication";
import { useShortcutToggledBoolean } from "hooks/useMousetrap";
// import { CursorIntersection, useCursorIntersection } from "hooks/useCursorIntersection";
import { /*ArrowHelper, Mesh,*/ Object3D, Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";
// import { animated as a } from '@react-spring/three';
import { map } from "rxjs/operators";
// import { VertexNormalsHelper } from "three-stdlib/helpers/VertexNormalsHelper";

const roundToPrecision = (value: number, precision: number) => {
  return Math.round(value * precision) / precision;
};

// const arrowNormal = new Vector3(0, 1, 0);

// const IntersectionRender = ({ intersection }: {
//   intersection: React.RefObject<CursorIntersection>
// }) => {
//   // const arrow = useMemo(() => {
//   //   return new ArrowHelper(
//   //     normal || new Vector3(0, 1, 0), // intersection.point
//   //     intersection.point
//   //   );
//   // }, [intersection.point, normal]);

//   // const { scene } = useThree();

//   // useEffect(() => {
//   //   scene.add(arrow);
//   //   return () => {
//   //     scene.remove(arrow);
//   //   };
//   // }, [arrow, scene]);
//   const arrowMeshRef = useRef<Mesh>();

//   useHelper(arrowMeshRef, ArrowHelper, arrowNormal);

//   return (
//     <>
//       <a.mesh position={intersection.current?.intersection?.point} visible={!!intersection.current?.intersection} ref={arrowMeshRef}>
//         <sphereGeometry args={[0.1, 10, 10]} />
//         <meshBasicMaterial color="red" />
//       </a.mesh>
//     </>
//   );
// };

const DisplayPosition = ({
  playerLocation$,
}: {
  playerLocation$: Observable<PlayerLocation>;
}) => {
  const playerLocation = useCurrentValueFromObservable(
    playerLocation$,
    undefined
  );

  const [lookAt, setLookAt] = useState<Vector3>();

  const { camera } = useThree();

  // const cursorIntersection = useCursorIntersection();

  const htmlContainerRef = useRef<Object3D | null>(null);

  const containerPositionRef = useRef(new Vector3(0, 0, -1));

  useFrame(() => {
    if (!htmlContainerRef.current) return;

    camera.getWorldDirection(containerPositionRef.current);
    containerPositionRef.current.normalize();
    containerPositionRef.current.add(camera.position);

    htmlContainerRef.current.position.copy(containerPositionRef.current);
  });

  useEffect(() => {
    const sub = interval(250)
      .pipe(
        map(() => {
          const lookAtVector = new Vector3(0, 0, -1);
          lookAtVector.applyQuaternion(camera.quaternion);
          return lookAtVector;
        })
      )
      .subscribe(setLookAt);
    return () => sub.unsubscribe();
  }, [camera]);

  if (!playerLocation) return null;

  return (
    <>
      <group ref={htmlContainerRef}>
        <Html
          center
          // @ts-ignore
          position={null}
        >
          <>
            <div
              style={{
                position: "absolute",
                top: "60px",
                left: "17px",
                width: "250px",
              }}
            >
              your position: {roundToPrecision(playerLocation.position[0], 2)},{" "}
              {roundToPrecision(playerLocation.position[1], 2)},{" "}
              {roundToPrecision(playerLocation.position[2], 2)}
              {lookAt && (
                <>
                  <br />
                  your look at: {roundToPrecision(lookAt.x * 100, 2)},{" "}
                  {roundToPrecision(lookAt.y * 100, 2)},{" "}
                  {roundToPrecision(lookAt.z * 100, 2)}
                </>
              )}
              <br />
              {`type 'p' to close`}
            </div>
          </>
        </Html>
      </group>
      {/* <IntersectionRender
        intersection={cursorIntersection}
      /> */}
    </>
  );
};

const PositionPreview: FC<{
  playerLocation$: Observable<PlayerLocation>;
}> = ({ playerLocation$ }) => {
  const { authenticated, isAnonymous } = useAuthentication({
    ensureSignedInAnonymously: false,
  });

  const [show] = useShortcutToggledBoolean("p");

  if (!show) return null;

  // don't show this to anonymous people to confuse them
  if (!authenticated || isAnonymous) return null;

  return <DisplayPosition playerLocation$={playerLocation$} />;
};

export default PositionPreview;
