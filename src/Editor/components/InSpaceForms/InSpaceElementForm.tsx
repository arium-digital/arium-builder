import { ElementConfig, ElementType } from "spaceTypes";
import { HasEditorState } from "../../../Space/InSpaceEditor/types";
import styles from "Space/InSpaceEditor/styles.module.scss";
import React, { useCallback, useMemo } from "react";
import { useChangeHandlers } from "Editor/hooks/useChangeHandlers";
import {
  EditToggleFreeText,
  NestedFormProp,
  StandardFormProps,
} from "Editor/components/Form";
import SimplifiedImageForm from "Editor/components/InSpaceForms/ImageFormSimplified";
import { IconButton, Paper, Toolbar, Tooltip } from "@material-ui/core";
import {
  DeleteElement,
  ToggleElementActive,
  ToggleElementLocked,
} from "Editor/components/SharedForms/ElementForms";
import {
  defaultModel,
  defaultTerrainConfig,
  defaultLightConfig,
} from "defaultConfigs";
import { SimplifiedVideoForm } from "./SimplifiedVideoForm";
import { SimplifiedNftForm } from "./SimplifiedNftForm";
import SimplifiedTerrainForm from "./SimplifiedTerrainForm";
import SimplifiedModelForm from "./SimplifiedModelForm";
import SimplifiedPlacardForm from "./SimplifiedPlacardForm";
import { defaultPortalConfig } from "spaceTypes/portal";
import SimplifiedPortalForm from "./SimplifiedPortalForm";
import SimplifiedLightForm from "./SimplifiedLightForm";
import SimplifiedWaterForm from "./SimplifiedWaterForm";
import { defaultWaterConfig } from "spaceTypes/water";
import SimplifiedReflectorForm from "./SimplifiedReflectorForm";
import { defaultReflectorSurfaceConfig } from "spaceTypes/reflectorSurface";
import { FileCopy } from "@material-ui/icons";
import { CircularProgress } from "@material-ui/core";
import useDuplicateElement from "Editor/hooks/useDuplicateElement";
import {
  defaultAudioConfig,
  useDefaultThemedConfigs,
} from "defaultConfigs/useDefaultNewElements";
import { EditingElementContext } from "Editor/components/AdvancedEditor/EditiingElementContext";
import { ErrorBoundary } from "react-error-boundary";
import {
  useRefreshIfChanged,
  useRefreshOnObserved,
} from "Space/Elements/Nft/NftDisplay";
import { Observable } from "rxjs";
import { SimplifiedAudioForm } from "./SimplifiedAudioForm";

const SupportedElementTypes = new Set([
  ElementType.image,
  ElementType.video,
  ElementType.audio,
  ElementType.model,
  ElementType.nft,
  ElementType.terrain,
  ElementType.placard,
  ElementType.portal,
  ElementType.light,
  ElementType.group,
  ElementType.water,
  ElementType.reflectorSurface,
]);

const TinyElementForm = ({
  nestedForm,
  elementId,
  undoChanges$,
}: StandardFormProps<ElementConfig> & {
  elementId: string;
  undoChanges$: Observable<void>;
}) => {
  const { values, makeNestedFormProps } = useChangeHandlers(nestedForm);

  const defaultThemedConfigs = useDefaultThemedConfigs();
  const refreshCauseOfElement = useRefreshIfChanged(elementId);
  const refreshCauseOfUndo = useRefreshOnObserved(undoChanges$);

  const refresh = refreshCauseOfElement || refreshCauseOfUndo;

  if (
    (values.elementType && !SupportedElementTypes.has(values.elementType)) ||
    values.deleted
  )
    return null;
  return (
    <>
      {values.elementType === "image" && (
        <SimplifiedImageForm
          nestedForm={makeNestedFormProps("image")}
          defaults={defaultThemedConfigs.image}
          refresh={refresh}
        />
      )}
      {values.elementType === "video" && (
        <SimplifiedVideoForm
          nestedForm={makeNestedFormProps("video")}
          defaults={defaultThemedConfigs.video}
          refresh={refresh}
        />
      )}
      {values.elementType === "audio" && (
        <SimplifiedAudioForm
          nestedForm={makeNestedFormProps("audio")}
          defaults={defaultAudioConfig}
          refresh={refresh}
        />
      )}
      {values.elementType === "nft" && (
        <SimplifiedNftForm
          elementId={elementId}
          nestedForm={makeNestedFormProps("nft")}
          defaults={defaultThemedConfigs.nft}
          refresh={refresh}
        />
      )}
      {values.elementType === "model" && (
        <SimplifiedModelForm
          nestedForm={makeNestedFormProps("model")}
          defaults={defaultModel}
          refresh={refresh}
        />
      )}
      {values.elementType === "terrain" && (
        <SimplifiedTerrainForm
          nestedForm={makeNestedFormProps("terrain")}
          defaults={defaultTerrainConfig}
          refresh={refresh}
        />
      )}
      {values.elementType === "placard" && (
        <SimplifiedPlacardForm
          nestedForm={makeNestedFormProps("placard")}
          defaults={defaultThemedConfigs.placard}
          refresh={refresh}
        />
      )}
      {values.elementType === "portal" && (
        <SimplifiedPortalForm
          nestedForm={makeNestedFormProps("portal")}
          defaults={defaultPortalConfig}
          refresh={refresh}
        />
      )}
      {values.elementType === "light" && (
        <SimplifiedLightForm
          nestedForm={makeNestedFormProps("light")}
          defaults={defaultLightConfig}
          refresh={refresh}
        />
      )}
      {values.elementType === ElementType.water && (
        <SimplifiedWaterForm
          nestedForm={makeNestedFormProps("water")}
          defaults={defaultWaterConfig}
          refresh={refresh}
        />
      )}
      {values.elementType === ElementType.reflectorSurface && (
        <SimplifiedReflectorForm
          nestedForm={makeNestedFormProps("reflectorSurface")}
          defaults={defaultReflectorSurfaceConfig}
          refresh={refresh}
        />
      )}
    </>
  );
};

export const DuplicateElementButton = ({
  handleDuplicate,
  duplicating,
  nestedForm,
}: {
  handleDuplicate: () => void;
  duplicating: boolean;
  nestedForm: NestedFormProp<ElementConfig>;
}) => (
  <Tooltip title="Duplicate element">
    <IconButton
      onClick={handleDuplicate}
      disabled={duplicating || nestedForm?.values.deleted}
    >
      {duplicating ? (
        <CircularProgress color="secondary" size={16} />
      ) : (
        <FileCopy fontSize="small" />
      )}
    </IconButton>
  </Tooltip>
);

export const TopToolbarForm = ({
  nestedForm,
  duplicate,
  duplicating,
}: {
  nestedForm: NestedFormProp<ElementConfig>;
  duplicate: () => void;
  duplicating: boolean;
}) => {
  const changeHandlers = useChangeHandlers(nestedForm);
  const { sourceValues, values, handleFieldChanged, errors } = changeHandlers;

  return (
    <Toolbar className={styles.topToolbar}>
      <div className={styles.grow} />
      {values.elementType}:
      <EditToggleFreeText
        value={values.name}
        sourceValue={sourceValues?.name}
        setValue={handleFieldChanged("name")}
        hideLabel
        size="fullWidth"
        error={errors?.name}
      />
      <DuplicateElementButton
        handleDuplicate={duplicate}
        duplicating={duplicating}
        nestedForm={nestedForm}
      />
      <ToggleElementLocked changeHandlers={changeHandlers} />
      <ToggleElementActive changeHandlers={changeHandlers} />
      <DeleteElement changeHandlers={changeHandlers} />
    </Toolbar>
  );
};

const InSpaceElementForm = ({
  editorState,
  selectedElementPath,
}: HasEditorState & { selectedElementPath: string[] }) => {
  const elementId = selectedElementPath[selectedElementPath.length - 1];

  const { nestedForm } = editorState;

  const { copying, duplicate } = useDuplicateElement({
    elementId,
    spaceId: editorState.spaceId,
    selection: editorState.currentEditingElementPath,
    setSelection: editorState.setCurrentEditingElementAndPath,
  });

  const dontPropagate = useCallback((e: Event) => {
    e.stopPropagation();
  }, []);

  const locked = nestedForm?.values.locked;
  const editingElementStatus = useMemo(() => ({ locked }), [locked]);

  if (!nestedForm || !elementId) return null;
  return (
    <ErrorBoundary fallback={<div>An unexpeced error occured...</div>}>
      <div
        className={styles.tinyEditorContainer}
        // @ts-ignore
        onKeyDown={dontPropagate}
        // @ts-ignore
        onKeyUp={dontPropagate}
      >
        <Paper>
          <TopToolbarForm
            nestedForm={nestedForm}
            duplicate={duplicate}
            duplicating={copying}
          />

          <EditingElementContext.Provider value={editingElementStatus}>
            <TinyElementForm
              elementId={elementId}
              nestedForm={nestedForm}
              undoChanges$={editorState.undoInstance.stateChanges$}
            />
          </EditingElementContext.Provider>
        </Paper>
      </div>
    </ErrorBoundary>
  );
};

export default InSpaceElementForm;
