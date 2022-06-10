import React from "react";
import * as Forms from "../Form";
import Grid from "@material-ui/core/Grid";
import { useThemeableChangeHandlers } from "Editor/hooks/useNullableChangeHandlers";
import { NftPlacardSettings } from "spaceTypes/nftConfig";
import { useFormFields } from "Editor/hooks/useFormFields";
import { Editors, FormDescription } from "Editor/types";
import FormSection, { FormSectionDisplaySettings } from "../Form/FormSection";

const placardDisplayFormDescription: FormDescription<
  NftPlacardSettings,
  | "showTitle"
  | "showCreator"
  | "showOwner"
  | "showDescription"
  | "showHistory"
  | "showPrice"
  | "width"
  | "leftOffset"
  | "bottomOffset"
  | "titleVisibleDistance"
  | "detailsVisibleDistance"
> = {
  showTitle: {
    editor: Editors.switch,
    editorConfig: {
      label: "Show the Title",
      description: "If the title of the nft should be shown in the placard",
    },
  },
  showCreator: {
    editor: Editors.switch,
    editorConfig: {
      label: "Show the Creator",
      description: "If the creator of the nft should be shown in the placard",
    },
  },
  showOwner: {
    editor: Editors.switch,
    editorConfig: {
      label: "Show the Owner",
      description: "If the owner of the nft should be shown in the placard",
    },
  },
  showDescription: {
    editor: Editors.switch,
    editorConfig: {
      label: "Show the Description",
      description:
        "If the description of the nft should be shown in the placard",
    },
  },
  showHistory: {
    editor: Editors.switch,
    editorConfig: {
      label: "Show the History",
      description:
        "If the history (bids, time listed for sale, etc.) should be shown on the placard. Currently only supported for Superrare.",
    },
  },
  showPrice: {
    editor: Editors.switch,
    editorConfig: {
      label: "Show the Price",
      description:
        "If the current price of the nft should be shown in the placard. Currently only supported for Superrare.",
    },
  },
  width: {
    editor: Editors.numberField,
    editorConfig: {
      min: 0,
      label: "Width",
      description: "The width of the placard.",
    },
  },
  leftOffset: {
    editor: Editors.numberField,
    editorConfig: {
      label: "Offset X",
      description: "Horizontal offset from the artwork ",
      min: 0,
      max: 10,
    },
  },
  bottomOffset: {
    editor: Editors.numberField,
    editorConfig: {
      label: "Offset Y",
      description: "Vertical offset from the bottom of the artwork.",
    },
  },
  titleVisibleDistance: {
    editor: Editors.numberField,
    editorConfig: {
      label: "Name visible distance",
      description: "The distance the name of the nft is visible from",
    },
  },
  detailsVisibleDistance: {
    editor: Editors.numberField,
    editorConfig: {
      label: "Details visible distance",
      description:
        "The distance the details on the placard (description, bid histroy, etc) ar visible from",
    },
  },
};

const NftPlacardSettingsForm = ({
  nestedForm,
  getThemeDefault,
  title = "Nft Placard Settings",
  defaultExpanded,
  notExpandable,
}: Forms.StandardFormPropsThemable<NftPlacardSettings> &
  FormSectionDisplaySettings) => {
  const changeHandlers = useThemeableChangeHandlers({
    nestedForm,
    getThemeDefault,
  });

  const { values, handleFieldChanged } = changeHandlers;

  const { FormFields, props } = useFormFields(
    placardDisplayFormDescription,
    // @ts-ignore
    handleFieldChanged,
    values
  );

  return (
    <FormSection {...{ title, defaultExpanded, notExpandable }}>
      <Grid item xs={12}>
        <FormSection title="Nft Placard Display Settings">
          <FormFields.leftOffset {...props} />
          <FormFields.bottomOffset {...props} />
          <FormFields.width {...props} />
        </FormSection>
        <FormSection title="What to Show in the Placard">
          <FormFields.showTitle {...props} />
          <FormFields.showCreator {...props} />
          <FormFields.showOwner {...props} />
          <FormFields.showPrice {...props} />
          <FormFields.showDescription {...props} />
          <FormFields.showHistory {...props} />
          <Grid container>
            <Grid item xs={12}>
              <FormFields.titleVisibleDistance {...props} />
              <FormFields.detailsVisibleDistance {...props} />
            </Grid>
          </Grid>
        </FormSection>
      </Grid>
    </FormSection>
  );
};

export default NftPlacardSettingsForm;
