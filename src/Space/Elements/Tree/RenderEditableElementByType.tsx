import { useEditingElementState } from "Space/InSpaceEditor/ElementTransform/WithTransformControls";
import { EditorStatus, HasEditorState } from "Space/InSpaceEditor/types";
import { useCurrentValueFromObservable } from "hooks/useObservable";
import { useCallback, useMemo } from "react";
import { ElementConfig } from "spaceTypes";
import { NftElementConfig } from "spaceTypes/Element";
import { Group } from "three";
import { Optional } from "types";
import { isNft } from "../elementTypeChecks";
import HelperForElement from "./HelperForElement";
import RenderElementByTypeInner, {
  MinimalElementProps,
} from "./RenderElementByType";

function getConfigToUse({
  isEditingMe,
  editingElementConfig,
  updatingElementId,
  elementId,
  elementConfig,
}: {
  isEditingMe: Optional<boolean>;
  editingElementConfig: Optional<ElementConfig>;
  updatingElementId: Optional<string>;
  elementId: string;
  elementConfig: ElementConfig;
}) {
  if (!isEditingMe) return elementConfig;

  if (!editingElementConfig) return elementConfig;

  if (updatingElementId !== elementId) return elementConfig;

  if (isNft(elementConfig)) {
    const sourceElementNft = (elementConfig as NftElementConfig).nft;
    const combined: NftElementConfig = {
      ...editingElementConfig,
      // @ts-ignore
      nft: {
        ...editingElementConfig.nft,
        mediaFile: sourceElementNft.mediaFile,
        // @ts-ignore
        superrareTokenHistory: sourceElementNft.superrareTokenHistory,
        // @ts-ignore
        superrareVersion: sourceElementNft.superrareVersion,
        token: sourceElementNft.token,
        // @ts-ignore
        tezosToken: sourceElementNft.tezosToken,
        // @ts-ignore
        tezosCreators: sourceElementNft.tezosCreators,
        updateStatus: sourceElementNft.updateStatus,
        fetchingMedia: sourceElementNft.fetchingMedia,
      },
      transform: elementConfig.transform,
    };

    return combined;
  }

  return editingElementConfig;
}

const RenderEditableElementByType = ({
  editorState,
  elementConfig,
  pointerOverElementGroup,
  parentPath,
  elementId,
  disableCursorIntersectionDetection,
  handleElementLoaded,
  elementsTree,
}: MinimalElementProps & {
  handleElementLoaded: ((elementId: string) => void) | undefined;
} & HasEditorState & {
    pointerOverElementGroup: Optional<Group>;
  }) => {
  const nestedForm = editorState?.nestedForm;

  const elementPath = useMemo(() => [...parentPath, elementId], [
    parentPath,
    elementId,
  ]);

  const editorStatus = useCurrentValueFromObservable(editorState.status$, null);

  // const { scene } = useThree();
  const canTransform =
    editorState?.userHasEditPermission &&
    (editorStatus === EditorStatus.editingElement ||
      editorStatus === EditorStatus.selectingElement);

  const setCurrentEditingElementPath =
    editorState?.setCurrentEditingElementAndPath;

  const spaceId = editorState?.spaceId;

  const handleSelected = useCallback(
    (e?: MouseEvent) => {
      if (!setCurrentEditingElementPath || !spaceId) return;
      setCurrentEditingElementPath({
        path: elementPath,
        initialValues: elementConfig,
        element: pointerOverElementGroup || undefined,
      });
    },
    [
      elementConfig,
      elementPath,
      pointerOverElementGroup,
      setCurrentEditingElementPath,
      spaceId,
    ]
  );

  const { isEditingMe, pointerOver: editingPointOver } = useEditingElementState(
    {
      editorState,
      elementPath,
      elementGroup: pointerOverElementGroup,
      disabled: elementConfig.locked || !canTransform,
      handleSelected,
    }
  );

  const configToUse = getConfigToUse({
    // currentPath: elementPath,
    editingElementConfig: nestedForm?.values,
    updatingElementId: nestedForm?.updatedId,
    elementConfig,
    isEditingMe,
    elementId,
    // pathOfEdited,
  });

  const showHelper =
    canTransform &&
    !!(pointerOverElementGroup && (isEditingMe || editingPointOver));

  return (
    <>
      <RenderElementByTypeInner
        elementConfig={configToUse}
        elementId={elementId}
        parentPath={parentPath}
        disableCursorIntersectionDetection={disableCursorIntersectionDetection}
        showHelper={showHelper}
        handleElementLoaded={handleElementLoaded}
        elementsTree={elementsTree}
      />
      {showHelper && pointerOverElementGroup && (
        <HelperForElement
          elementGroup={pointerOverElementGroup}
          highlight={isEditingMe}
        />
      )}
    </>
  );
};

export default RenderEditableElementByType;
