import {
  ButtonGroup,
  CircularProgress,
  Grid,
  IconButton,
  IconButtonProps,
  Tooltip,
} from "@material-ui/core";
import React, { useCallback, useEffect, useState } from "react";
import {
  CameraMode,
  HasEditorState,
  TransformControlMode,
  // TransformControlMode,
} from "components/InSpaceEditor/types";
import { MdRedo, MdRotateRight, MdUndo } from "react-icons/md";
import { GiResize, GiMove } from "react-icons/gi";
import styles from "../styles.module.scss";
import { IoMdMagnet } from "react-icons/io";
import { useMousetrap } from "hooks/useMousetrap";
import Link from "next/link";
import { useCurrentValueFromObservable } from "hooks/useObservable";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import StreetviewIcon from "@material-ui/icons/Streetview";
import SettingsBackupRestoreIcon from "@material-ui/icons/SettingsBackupRestore";
import ArtTrackIcon from "@material-ui/icons/ArtTrack";
import { spaceDoc } from "shared/documentPaths";
import BtnAddElements from "./AddElementsButton";
// import ControlCameraIcon from "@material-ui/icons/ControlCamera";

const ICON_SIZE = 20;
const IconMove = ({ color }: { color?: string }) => (
  <GiMove size={ICON_SIZE} color={color} />
);
const IconRotate = ({ color }: { color?: string }) => (
  <MdRotateRight size={ICON_SIZE} color={color} />
);
const IconScale = ({ color }: { color?: string }) => (
  <GiResize size={ICON_SIZE} color={color} />
);

const ModeButton = ({
  tooltipTitle,
  onClick,
  icon,
  active,
  disabled,
}: {
  active: boolean;
  tooltipTitle: string;
  onClick: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
}) => {
  return (
    <Tooltip title={tooltipTitle} placement="right">
      <IconButton
        color={active ? "primary" : "default"}
        className={styles.iconBtnWithShadow}
        onClick={onClick}
        disabled={disabled}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
};

// const getIconOrders = (mode: TransformControlMode | null): TransformControlMode[] => {
//   if (!mode) {
//     return ['translate', 'rotate', 'scale'] as TransformControlMode[];
//   }
//   return [mode, ...['translate', 'rotate', 'scale'].filter(x => x !== mode)] as TransformControlMode[];
// }

const TransformModes = ({
  editorState: {
    transformControlsMode: mode,
    setTransformControlsMode: setMode,
  },
  selectedElementIsLocked,
}: HasEditorState & {
  selectedElementIsLocked?: boolean;
}) => {
  // const [open, handleOpen, handleClose] = useBoolStateAndSetters(false);
  const toggleMode = useCallback(
    (modeToToggle: TransformControlMode) => {
      if (modeToToggle === mode) setMode(null);
      else setMode(modeToToggle);
    },
    [mode, setMode]
  );

  const setToTranslate = useCallback(() => toggleMode("translate"), [
    toggleMode,
  ]);

  const setToRotate = useCallback(() => toggleMode("rotate"), [toggleMode]);

  const setToScale = useCallback(() => toggleMode("scale"), [toggleMode]);

  useMousetrap("alt+1", setToTranslate);
  useMousetrap("alt+2", setToRotate);
  useMousetrap("alt+3", setToScale);

  return (
    <>
      <ButtonGroup orientation="vertical">
        <ModeButton
          active={mode === "translate"}
          onClick={setToTranslate}
          icon={<IconMove />}
          tooltipTitle="Translate mode. ⌨️ alt + 1"
          disabled={selectedElementIsLocked}
        />
        <ModeButton
          active={mode === "rotate"}
          onClick={setToRotate}
          icon={<IconRotate />}
          tooltipTitle={"Rotate mode.  ⌨️ alt + 2"}
          disabled={selectedElementIsLocked}
        />
        <ModeButton
          active={mode === "scale"}
          onClick={setToScale}
          icon={<IconScale />}
          tooltipTitle={"Scale mode.  ⌨️ alt + 3"}
          disabled={selectedElementIsLocked}
        />
      </ButtonGroup>
    </>
  );
};

const SnapButton = ({
  editorState: { setTransformControlsSnap },
  edge,
  selectedElementIsLocked,
}: Pick<IconButtonProps, "edge"> &
  HasEditorState & {
    selectedElementIsLocked?: boolean;
  }) => {
  const [snap, setSnap] = useState(false);
  const toggleSnap = useCallback(() => setSnap((curr) => !curr), []);
  const enableSnap = useCallback(() => setSnap(true), []);
  const disableSnap = useCallback(() => setSnap(false), []);

  useMousetrap("shift", enableSnap, "keydown");
  useMousetrap("shift", disableSnap, "keyup");

  useEffect(() => {
    setTransformControlsSnap(snap);
  }, [setTransformControlsSnap, snap]);

  return (
    <Tooltip title="Snap to grid,  ⌨️ shift ">
      <IconButton
        className={styles.iconBtnWithShadow}
        edge={edge}
        onClick={toggleSnap}
        color={snap ? "primary" : "default"}
        disabled={selectedElementIsLocked}
      >
        <IoMdMagnet />
      </IconButton>
    </Tooltip>
  );
};

const UndoButton = ({
  editorState: { undoInstance },
  edge,
}: Pick<IconButtonProps, "edge"> & HasEditorState) => {
  const { undo, canUndo$, saving$ } = undoInstance;

  const canUndo = useCurrentValueFromObservable(canUndo$, false);
  const saving = useCurrentValueFromObservable(saving$, false);
  useMousetrap("mod+z", undo);

  return (
    <Tooltip title="Undo one step,  ⌨️ cmd + z">
      <IconButton
        className={styles.iconBtnWithShadow}
        edge={edge}
        onClick={canUndo ? undo : undefined}
        color={canUndo ? "primary" : "default"}
        disableRipple={!canUndo}
      >
        {saving ? <CircularProgress size="small" /> : <MdUndo />}
      </IconButton>
    </Tooltip>
  );
};

const RedoButton = ({
  editorState: { undoInstance },
  edge,
}: Pick<IconButtonProps, "edge"> & HasEditorState) => {
  const { redo, canRedo$, saving$ } = undoInstance;

  const canRedo = useCurrentValueFromObservable(canRedo$, false);
  const saving = useCurrentValueFromObservable(saving$, false);
  useMousetrap("mod+shift+z", redo);

  return (
    <Tooltip title="Redo one step.  ⌨️ cmd + shift + z">
      <IconButton
        className={styles.iconBtnWithShadow}
        edge={edge}
        onClick={redo}
        color={canRedo ? "primary" : "default"}
        disableRipple={!canRedo}
      >
        {saving ? <CircularProgress size="small" /> : <MdRedo />}
      </IconButton>
    </Tooltip>
  );
};

const IconFormMode = ({
  cameraMode,
  selected,
}: {
  cameraMode: CameraMode;
  selected?: boolean;
}) => {
  const color = selected ? "primary" : "default";
  if (cameraMode === "first person") {
    return (
      <StreetviewIcon
        // @ts-ignore
        color={color}
      />
    );
  }

  if (cameraMode === "orbit") {
    return (
      <SettingsBackupRestoreIcon
        // @ts-ignore
        color={color}
      />
    );
  }

  return null;
};

const CameraModeButton = ({
  editorState: { cameraMode, setCameraMode },
}: HasEditorState) => {
  const setToFirstPerson = useCallback(() => {
    setCameraMode("first person");
  }, [setCameraMode]);

  const setToOrbit = useCallback(() => {
    setCameraMode("orbit");
  }, [setCameraMode]);

  return (
    <>
      <ButtonGroup orientation="vertical">
        <ModeButton
          active={cameraMode === "first person"}
          onClick={setToFirstPerson}
          icon={
            <IconFormMode
              cameraMode={"first person"}
              selected={cameraMode === "first person"}
            />
          }
          tooltipTitle="First Person Controls"
        />
        <ModeButton
          active={cameraMode === "orbit"}
          onClick={setToOrbit}
          icon={
            <IconFormMode
              cameraMode={"orbit"}
              selected={cameraMode === "orbit"}
            />
          }
          tooltipTitle="Orbit Controls"
        />
      </ButtonGroup>
    </>
  );
};

const LeftToolBar = ({
  editorState,
  handleToggleTree,
  treeOpen,
}: HasEditorState & {
  handleToggleTree: () => void;
  treeOpen: boolean;
}) => {
  const {
    elementIsSelected,
    settingsOpen,
    handleToggleOpenSettings,
  } = editorState;
  const elementIsLocked = !!editorState.nestedForm?.sourceValues?.locked;

  // const spaceSlug = useSpaceSlugForId(editorState.spaceId);

  // console.log({ spaceSlug });

  const [spaceSlug, setSpaceSlug] = useState<string>();

  const spaceId = editorState.spaceId;

  useEffect(() => {
    if (!spaceId) return;
    const unsub = spaceDoc(spaceId).onSnapshot((snap) => {
      if (snap.exists) {
        const slug = snap.data()?.slug as string | undefined;
        setSpaceSlug(slug);
      } else {
        setSpaceSlug(undefined);
      }
    });

    return () => unsub();
  }, [spaceId]);

  return (
    <Grid direction="column" xs={1} className={styles.leftToolbar}>
      <Grid container spacing={2} direction="column">
        <Grid item>
          <BtnAddElements editorState={editorState} />
        </Grid>
        <Grid item>
          <Tooltip
            title={treeOpen ? "Show Elements List" : "Hide Elements List"}
          >
            <IconButton
              className={styles.iconBtnWithShadow}
              // edge={edge}
              onClick={handleToggleTree}
              color={treeOpen ? "primary" : "default"}
            >
              <AccountTreeIcon />
            </IconButton>
          </Tooltip>
        </Grid>
        {elementIsSelected && (
          <>
            <Grid item>
              <TransformModes
                editorState={editorState}
                selectedElementIsLocked={elementIsLocked}
              />
            </Grid>

            {editorState.transformControlsMode && (
              <Grid item>
                <SnapButton
                  editorState={editorState}
                  selectedElementIsLocked={elementIsLocked}
                />
              </Grid>
            )}
          </>
        )}

        <Grid item>
          <UndoButton editorState={editorState} />
        </Grid>
        <Grid item>
          <RedoButton editorState={editorState} />
        </Grid>
        <Grid item>
          <CameraModeButton editorState={editorState} />
        </Grid>
        <Grid item>
          <IconButton
            className={styles.iconBtnWithShadow}
            // edge={edge}
            onClick={handleToggleOpenSettings}
            color={settingsOpen ? "primary" : "default"}
          >
            <ArtTrackIcon />
          </IconButton>
        </Grid>
        <Grid item>
          <Tooltip title="Open advanced editor">
            <IconButton className={styles.iconBtnWithShadow}>
              <Link
                href={{
                  pathname: `/editor/${spaceSlug}/space-settings`,
                }}
                passHref
              >
                <a target="_blank" rel="noreferrer">
                  <img alt="icon" src={"/images/icons/editor-item-list.svg"} />
                </a>
              </Link>
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default LeftToolBar;
