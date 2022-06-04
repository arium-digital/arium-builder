import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SpaceMeta } from "../../../spaceTypes";
import { useValidateAndUpdate } from "Editor/hooks/updateAndCreate";
import { spaceDoc, spaceMetaDocument } from "../../../shared/documentPaths";
import { useEditorAndSaveButton } from "../Form";
import * as Text from "../VisualElements/Text";
import Grid from "@material-ui/core/Grid";
import {
  defaultSpaceMeta,
  getDefaultWelcomeHTML,
} from "../../../defaultConfigs";
import { useConfigOrDefault } from "../../../hooks/spaceHooks";
import * as Forms from "../Form";
import SceneCapture, { useSceneCapture } from "./SceneCapture";
import { FileLocation } from "spaceTypes";
import Button from "@material-ui/core/Button";
import { useChangeHandlers } from "Editor/hooks/useChangeHandlers";
import { SpaceContext } from "hooks/useCanvasAndModalContext";
import * as yup from "yup";
import FormSection from "../Form/FormSection";
import ThreeContext from "Space/ThreeContext";
import { Skeleton } from "@material-ui/lab";

interface IWrapperProps {
  welcomeHTML?: string;
  handleSave: (html: string) => void;
}

interface IWelcomeMessageEditorProps extends IWrapperProps {
  welcomeHTML: string;
}

const WelcomeMessageEditorWrapper: FC<IWrapperProps> = ({
  welcomeHTML,
  handleSave,
}) => {
  welcomeHTML = useConfigOrDefault<string>(welcomeHTML, getDefaultWelcomeHTML);

  return welcomeHTML == null ? null : (
    <WelcomeMessageEditor welcomeHTML={welcomeHTML} handleSave={handleSave} />
  );
};

const WelcomeMessageEditor: FC<IWelcomeMessageEditorProps> = ({
  welcomeHTML,
  handleSave,
}) => {
  const [Editor, SaveButton] = useEditorAndSaveButton(handleSave, welcomeHTML);

  return (
    <>
      <Text.ElementHeader>Welcome Message</Text.ElementHeader>
      <Editor
        toolBarConfigOverride={{
          options: [
            "inline",
            "list",
            "textAlign",
            "colorPicker",
            "link",
            "history",
          ],
        }}
      />
      <br />
      <SaveButton
        type="submit"
        variant="contained"
        color="primary"
        size="large"
      >
        Save
      </SaveButton>
    </>
  );
};

const SpaceSettingsForm = ({
  nestedForm,
}: Forms.StandardFormProps<SpaceMeta>) => {
  const {
    values,
    sourceValues,
    handleFieldChanged,
    errors,
  } = useChangeHandlers(nestedForm);

  const handleChangeWelcomeMsg = handleFieldChanged("welcomeHTML");

  const [editingImage, setEditingImage] = useState(false);

  const editClicked = useCallback(() => {
    setEditingImage(true);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingImage(false);
  }, []);

  const metadataImagePicked = useCallback(
    (fileLocation: FileLocation) => {
      handleFieldChanged("metaImage")(fileLocation);
      setEditingImage(false);
    },
    [handleFieldChanged]
  );

  const spaceId = useContext(SpaceContext)?.spaceId;

  const [spaceSlug, setSpaceSlug] = useState<string>();

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

  const { uploading, captureAndSave, sceneContext } = useSceneCapture({
    spaceId,
    handlePathUpdated: metadataImagePicked,
  });

  return (
    <>
      <Grid container>
        <Grid item xs={12} lg={8}>
          <FormSection title="Space Metadata" defaultExpanded>
            <Grid item xs={12}>
              <Forms.FreeText
                label="Space Name"
                setValue={handleFieldChanged("name")}
                value={values.name || spaceSlug}
                error={errors?.name}
                help="The name that will be displayed above the space welcome message, on the title of the page, and when the space is shared."
                size="xl"
              />
            </Grid>
            <Text.FormLabel>Metadata Image</Text.FormLabel>
            {uploading && (
              <Skeleton variant="rect" width="640px" height="480px" />
            )}
            {!editingImage && !uploading && (
              <>
                <Button
                  onClick={editClicked}
                  variant="contained"
                  color="secondary"
                  style={{ position: "absolute", zIndex: 1000 }}
                >
                  Edit
                </Button>
                {sourceValues?.metaImage && (
                  <Grid item xs={6}>
                    <Forms.ImagePreview file={sourceValues?.metaImage} />
                  </Grid>
                )}
              </>
            )}
            {editingImage && spaceId && (
              <ThreeContext.Provider value={sceneContext}>
                <SceneCapture
                  cancel={cancelEdit}
                  spaceId={spaceId}
                  captureAndSave={captureAndSave}
                  uploading={uploading}
                />
              </ThreeContext.Provider>
            )}
            <Grid item lg={6} xs={12}>
              <WelcomeMessageEditorWrapper
                welcomeHTML={values.welcomeHTML}
                handleSave={handleChangeWelcomeMsg}
              />
            </Grid>
          </FormSection>
        </Grid>
      </Grid>
    </>
  );
};

const spaceMetaSchema = () => {
  return yup.object({
    name: yup.string().optional(),
    metaImage: yup.object().optional(),
    welcomeHTML: yup.string().optional(),
  });
};

const SpaceSettings = ({ spaceId }: { spaceId: string }) => {
  const documentRef = useMemo(() => spaceMetaDocument(spaceId), [spaceId]);

  const schema = useMemo(() => spaceMetaSchema(), []);

  const { nestedForm } = useValidateAndUpdate<SpaceMeta>({
    ref: documentRef,
    schema,
    autoSave: true,
    defaultIfMissing: defaultSpaceMeta,
  });

  if (!nestedForm) return null;

  return (
    <>
      <SpaceSettingsForm nestedForm={nestedForm} />
    </>
  );
};

export default SpaceSettings;
