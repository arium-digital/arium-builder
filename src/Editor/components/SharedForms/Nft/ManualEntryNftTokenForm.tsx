import { useStyles } from "../../../styles";
import Paper from "@material-ui/core/Paper";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import * as Forms from "../../Form";
import * as Text from "../../VisualElements/Text";
import Grid from "@material-ui/core/Grid/Grid";
import { useContext } from "react";
import { Editors, FormDescription } from "Editor/types";
import useFormFields from "Editor/hooks/useFormFields";
import { ManualEntryToken } from "../../../../../shared/nftTypes";

import { SpaceContext } from "hooks/useCanvasAndModalContext";
import * as FileSelect from "Editor/components/Files/FileSelect";

const manualEntryTokenDescription: FormDescription<
  ManualEntryToken,
  | "creatorName"
  | "externalUrl"
  | "collectionName"
  | "ownerName"
  | "description"
  | "mediaType"
  | "name"
> = {
  creatorName: {
    editor: Editors.freeText,
    editorConfig: {
      label: "Creator Name",
      help: "Name of creator who minted the nft",

      size: "xl",
    },
  },
  ownerName: {
    editor: Editors.freeText,
    editorConfig: {
      label: "Owner Name",
      help: "Name of owner of the nft",

      size: "xl",
    },
  },
  collectionName: {
    editor: Editors.freeText,
    editorConfig: {
      label: "Collection or Marketplace name",
      help:
        "Name of the collection or the marketplace this was minted on.  This will be used for the url title.",
      size: "xl",
    },
  },
  externalUrl: {
    editor: Editors.freeText,
    editorConfig: {
      label: "External Url",
      help: "The url of webpagepage where token can be viewed",
      fullWidth: true,
      size: "fullWidth",
    },
  },
  name: {
    editor: Editors.freeText,
    editorConfig: {
      label: "Name",
      help: "Name of the nft",
      size: "xl",
    },
  },
  description: {
    editor: Editors.freeText,
    editorConfig: {
      label: "Description",
      help: "Description of the nft",
      size: "xl",
      fullWidth: true,
      multiline: true,
    },
  },
  mediaType: {
    editor: Editors.select,
    editorConfig: {
      label: "Token Media File Type",
      options: ["video", "image", "gif"],
    },
  },
};

const videoExtensions = ["mp4"];

const ManualEntryNftTokenForm = ({
  nestedForm,
  defaults: defaultValues,
  shapeDetermined,
}: Forms.StandardFormPropsNullable<ManualEntryToken> & {
  shapeDetermined: (shape: { width: number; height: number }) => void;
}) => {
  const {
    values,
    handleFieldChanged,
    errors,
  } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  const { FormFields, props } = useFormFields(
    manualEntryTokenDescription,
    handleFieldChanged,
    values
  );

  const classes = useStyles();
  const spaceId = useContext(SpaceContext)?.spaceId;

  if (!spaceId) return null;
  return (
    <>
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <Text.SubElementHeader>Manual Entry Nft</Text.SubElementHeader>
          <FormFields.name {...props} />
          <FormFields.description {...props} />
          <FormFields.creatorName {...props} />
          <FormFields.ownerName {...props} />
          <FormFields.collectionName {...props} />
          <FormFields.externalUrl {...props} />
          <FormFields.mediaType {...props} />
          {(values.mediaType === "image" || values.mediaType === "gif") && (
            <FileSelect.Image
              disablePaper
              fieldName="Image File"
              file={values.imageFile}
              handleChanged={handleFieldChanged("imageFile")}
              errors={errors?.imageFile}
              allowEmpty={true}
              allowExternalFile
              allowGifs={values.mediaType === "gif"}
              shapeDetermined={shapeDetermined}
            />
          )}
          {values.mediaType === "video" && (
            <FileSelect.Video
              fieldName="Token Media Video File"
              file={values.videoFile}
              handleChanged={handleFieldChanged("videoFile")}
              allowEmpty={true}
              extensions={videoExtensions}
              errors={errors?.videoFile}
              allowExternalFile
            />
          )}
        </Paper>
      </Grid>
    </>
  );
};

export default ManualEntryNftTokenForm;
