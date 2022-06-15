import {
  EditorState,
  EditorStatus,
  // TransformControlMode,
} from "Space/InSpaceEditor/types";

import styles from "../styles.module.scss";
import { useEscShortCut } from "hooks/useMousetrap";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@material-ui/lab";
import { useBoolStateAndSetters } from "hooks/useBoolStateAndSetters";
import { useCancelAddingElements } from "../hooks/useEditorActions";
import useAddElementOptions from "Editor/components/Tree/useAddElementOptions";
import ElementIcon from "Editor/components/Tree/ElementIcon";
import { useCallback } from "react";
import { ElementConfig } from "spaceTypes";
import { merge } from "lodash";

const iconColor = "#f2461a";
const BtnAddElements = ({ editorState }: { editorState: EditorState }) => {
  const [open, handleOpen, handleClose] = useBoolStateAndSetters(false);

  const handleCancleAddingElements = useCancelAddingElements(editorState);

  useEscShortCut(handleCancleAddingElements);

  const addButtonConfigs = useAddElementOptions();

  const {
    setPreviewElement,
    setCurrentEditingElementAndPath,
    setStatus,
  } = editorState;
  const addAction = useCallback(
    ({
      defaultElementConfig,
      newElementConfig,
    }: {
      defaultElementConfig: () => ElementConfig;
      newElementConfig: () => Partial<ElementConfig>;
    }) => {
      const defaultConfig = defaultElementConfig();
      // const defaultToShow = merge(
      //   {},
      //   defaultElementConfig(),
      //   newElementConfig ? newElementConfig() : {}
      // );
      const newElement: ElementConfig = {
        elementType: defaultConfig.elementType,
        name: defaultConfig.name,
        active: true,
        ...(newElementConfig ? newElementConfig() : {}),
      };

      setPreviewElement({
        defaults: merge({}, defaultElementConfig(), newElement),
        toSave: newElement,
      });
      setCurrentEditingElementAndPath(null);
      setStatus(EditorStatus.adding);
      handleClose();
    },
    [setPreviewElement, setCurrentEditingElementAndPath, setStatus, handleClose]
  );

  return (
    <SpeedDial
      className={styles.btnAdd}
      ariaLabel="Add new elements"
      icon={
        <SpeedDialIcon
          icon={<img alt="icon" src={"/images/icons/editor-add.svg"} />}
        />
      }
      onClose={handleClose}
      onOpen={handleOpen}
      open={open}
      direction="right"
    >
      {addButtonConfigs.map(
        ({ elementType, toolTip, defaultElementConfig, newElementConfig }) => (
          <SpeedDialAction
            key={elementType}
            // className={styles.btnDisabled}
            icon={<ElementIcon elementType={elementType} color={iconColor} />}
            tooltipTitle={toolTip}
            tooltipPlacement="bottom"
            onClick={() =>
              addAction({ defaultElementConfig, newElementConfig })
            }
          />
        )
      )}
    </SpeedDial>
  );
};

export default BtnAddElements;
