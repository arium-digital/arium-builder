import {
  ControlsSettings,
  IJoystickUpdateEvent,
} from "components/componentTypes";
import { EditorTransformAndOrbitControls } from "components/InSpaceEditor/ElementTransform/WithTransformControls";
import { EditorContext } from "components/InSpaceEditor/hooks/useEditorState";
import { CollidableMeshes } from "hooks/useMeshes";
import { useContext, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Vector3 } from "three";
import FirstPersonKeyboardMovementControls from "./KeyboardMovementControls";
import KeyboardTurnControls from "./KeyboardTurnControls";
import SphericalDragControls from "./SphericalDragControls";
import SyncCameraAndPlayerPosition from "./SyncCameraPositionAndPlayerState";
import usePressedKeyboardKeys from "./useKeyboardMovementKeys";

const InSpaceControls = ({
  controlsSettings,
  meshes,
  joystickMoveRef,
  position,
  cameraOffset,
}: {
  controlsSettings: ControlsSettings | undefined;
  meshes: CollidableMeshes;
  joystickMoveRef: React.MutableRefObject<IJoystickUpdateEvent | undefined>;
  position: React.MutableRefObject<Vector3 | undefined>;
  cameraOffset: Vector3 | undefined;
}) => {
  const keyboardMovementKeys$ = usePressedKeyboardKeys();

  const editorState = useContext(EditorContext);

  const [controlsControllingCamera, setControlsControllingCamera] = useState(
    false
  );
  const [dragging, setDragging] = useState(false);

  // const { selfAvatar, avatarMeshes } = useContext(SpaceContext) || {};

  return (
    <>
      {editorState && (
        <ErrorBoundary
          fallback={<group></group>}
          resetKeys={Object.values(editorState)}
        >
          <EditorTransformAndOrbitControls
            editorState={editorState}
            setControllingCamera={setControlsControllingCamera}
            setDragging={setDragging}
          />
        </ErrorBoundary>
      )}
      {/* {selfAvatar && avatarMeshes && (
        <SelfAvatar
          selfAvatar={selfAvatar}
          avatarMeshes={avatarMeshes}
          setPositionFromCamera={!transformControllingCamera}
          metadata={undefined}
        />
      )} */}

      <>
        <SphericalDragControls
          disabled={controlsControllingCamera || dragging}
        />
        {!controlsSettings?.disableKeyboardControls && (
          /*!isTransforming &&*/ <>
            {cameraOffset && (
              <SyncCameraAndPlayerPosition
                position={position}
                cameraOffset={cameraOffset}
                setPositionFromCamera={controlsControllingCamera}
              />
            )}
            <KeyboardTurnControls
              joystickMoveRef={joystickMoveRef}
              keyboardMovementKeys$={keyboardMovementKeys$}
            />
            {!controlsControllingCamera && (
              <FirstPersonKeyboardMovementControls
                positionRef={position}
                movementSpeed={controlsSettings?.movementSpeed}
                gravity={controlsSettings?.gravity}
                jumpSpeed={controlsSettings?.jumpSpeed}
                disableCollisions={controlsSettings?.disableCollisions}
                disableGravity={controlsSettings?.disableGroundDetection}
                meshes={meshes}
                joystickMoveRef={joystickMoveRef}
                keyboardMovementKeys$={keyboardMovementKeys$}
              />
            )}
          </>
        )}
      </>
    </>
  );
};

export default InSpaceControls;
