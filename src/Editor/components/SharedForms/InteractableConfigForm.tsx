import React, { FC, useCallback, useMemo, useState } from "react";
import { useEditorAndSaveButton } from "../Form";
import { useChangeHandlers } from "Editor/hooks/useChangeHandlers";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import * as Forms from "../Form";
import { useStyles } from "../../styles";
import { Button, Typography } from "@material-ui/core";

import { TransitionsModal } from "Space/Elements/Model/interactable";
import * as Text from "../VisualElements/Text";
import {
  InteractionConfig,
  InteractionType,
  ShowModalConfig,
} from "../../../spaceTypes/interactable";
import * as FileSelect from "../Files/FileSelect";

export type InteractableConfigFormProps = Forms.StandardFormPropsNullable<InteractionConfig>;

const defaultContent = `
<p>Hello!</p>
<p>What you write here would appear on the screen when they click this model</p>
<span style="color: rgb(44,130,201);"> t</span>
<span style="color: rgb(247,218,100);">h</span>
<span style="color: rgb(0,168,133);">i</span>
<span style="color: rgb(147,101,184);">s!</span>
</p>
`.replace("\n", "");

export const defaultInteractableConfig = (): InteractionConfig => ({
  action: InteractionType.showModal,
  payload: {
    backgroundColor: "#ffffff",
    contentHTML: defaultContent,
    maxDistance: 20,
    showDetail: true,
    detailFileType: "self",
  },
});

export const InteractableConfigForm: FC<InteractableConfigFormProps> = ({
  nestedForm,
  defaults,
}) => {
  const {
    values,
    handleFieldChanged,
    makeNestedFormProps,
  } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues: defaults,
  });

  const handleActionChanged = handleFieldChanged("action");

  return (
    <>
      <br />
      <Forms.DropdownSelect
        // @ts-ignore
        options={Object.keys(InteractionType).map(
          // @ts-ignore
          (key) => InteractionType[key]
        )}
        value={values.action}
        label={"Action on Click"}
        // @ts-ignore
        setValue={handleActionChanged}
      />
      {/* {action === ActionType.jumpToSpace && <p>Developing</p>} */}
      {values.action === InteractionType.showModal && (
        <ModalContentFrom nestedForm={makeNestedFormProps("payload")} />
      )}
    </>
  );
};

const interactableToolbarOverride = {
  options: [
    "inline",
    "blockType",
    "list",
    "textAlign",
    "colorPicker",
    "link",
    "history",
    "fontSize",
    "fontFamily",
  ],
  fontSize: {
    options: ["", 8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96],
    className: undefined,
    component: undefined,
    dropdownClassName: undefined,
  },
  fontFamily: {
    options: [
      "",
      "Arial",
      "Verdana",
      "Helvetica",
      "Tahoma",
      "Trebuchet MS",
      "Times New Roman",
      "Georgia",
      "Garamond",
      "Courier New",
    ],
    className: undefined,
    component: undefined,
    dropdownClassName: undefined,
  },
};

const ModalContentFrom: FC<Forms.StandardFormProps<ShowModalConfig>> = ({
  nestedForm,
}) => {
  const { values, handleFieldChanged } = useChangeHandlers(nestedForm);

  const [showPreview, setShowPreview] = useState(false);

  const classes = useStyles();

  const [Editor, SaveButton] = useEditorAndSaveButton(
    handleFieldChanged("contentHTML"),
    values.contentHTML as string
  );

  const assetFileTypeExtensions = useMemo(() => {
    if (values.detailFileType === "video") return ["mp4", "webm"];
    if (values.detailFileType === "model") return ["glb", "gltf"];
    return ["png", "jpg"];
  }, [values.detailFileType]);

  const detailFileTypeChanged = useCallback(
    (value: string) => {
      handleFieldChanged("detailFile")(undefined);
      // @ts-ignore
      handleFieldChanged("detailFileType")(value);
    },
    [handleFieldChanged]
  );

  const fileTypeOptions: Array<
    Required<ShowModalConfig>["detailFileType"]
  > = useMemo(() => ["self", "image", "video"], []);

  return (
    <>
      <Text.SubElementHeader>Model Settings</Text.SubElementHeader>
      <div className={classes.formRow}>
        <Forms.Number
          initialValue={values.maxDistance}
          setValue={handleFieldChanged("maxDistance")}
          label="Max Click Distance"
        />
      </div>
      <div className={classes.formRow}>
        <Forms.ColorPicker
          label={"Background Color"}
          value={values.backgroundColor}
          setValue={handleFieldChanged("backgroundColor")}
        />
      </div>
      <Text.SubElementHeader>Asset to Display</Text.SubElementHeader>
      <div className={classes.formRow}>
        <Forms.Switch
          label={"Show Asset"}
          value={values.showDetail}
          setValue={handleFieldChanged("showDetail")}
        />
        {values.showDetail && (
          <>
            <Forms.SelectButtons
              // @ts-ignore
              value={values.detailFileType}
              options={fileTypeOptions}
              // @ts-ignore
              setValue={detailFileTypeChanged}
            />

            {values.detailFileType && (
              <>
                {values.detailFileType === "self" && (
                  <>
                    <Typography variant="body1">
                      Display this element in the modal.
                    </Typography>
                    <Typography variant="caption">
                      Only works when this element is a video or an image
                    </Typography>
                  </>
                )}
                {values.detailFileType === "image" && (
                  <FileSelect.Image
                    fieldName="Image File to Show"
                    file={values.detailFile}
                    handleChanged={handleFieldChanged("detailFile")}
                    allowEmpty={true}
                    extensions={assetFileTypeExtensions}
                    allowExternalFile
                  />
                )}
                {values.detailFileType === "video" && (
                  <FileSelect.Video
                    fieldName="Video File to Show"
                    file={values.detailFile}
                    handleChanged={handleFieldChanged("detailFile")}
                    allowEmpty={true}
                    extensions={assetFileTypeExtensions}
                    allowExternalFile
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
      <br />
      <Text.SubElementHeader>
        <>
          Text to Display
          <SaveButton
            type="submit"
            variant="contained"
            color="primary"
            style={{ float: "right" }}
          >
            Save
          </SaveButton>
          <Button
            style={{ float: "right" }}
            onClick={(e: any) => setShowPreview(true)}
          >
            Preview
          </Button>
        </>
      </Text.SubElementHeader>
      <br />
      <div
        style={{
          borderWidth: "12px",
          borderColor: values.backgroundColor,
          backgroundColor: values.backgroundColor,
        }}
      >
        <Editor toolBarConfigOverride={interactableToolbarOverride} />
        <TransitionsModal
          show={showPreview}
          onClose={() => setShowPreview(false)}
          bgColor={values.backgroundColor}
          markup={values.contentHTML}
          assetDetailsFileType={values.detailFileType}
          assetDetailsFile={values.detailFile}
        />
      </div>
    </>
  );
};
