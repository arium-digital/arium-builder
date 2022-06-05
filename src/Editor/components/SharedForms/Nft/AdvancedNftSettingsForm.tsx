import {
  useMakeNestedFormChangeHandlers,
  useNullableChangeHandlersWithDefaults,
} from "Editor/hooks/useNullableChangeHandlers";
import * as Forms from "../../Form";
import { ArtworkDisplayConfig } from "spaceTypes/nftConfig";
import * as themeDefaults from "defaultConfigs/theme";
import { FileLocation } from "spaceTypes";
import { MediaType } from "Space/Elements/Nft/lib";
import FormSection from "Editor/components/Form/FormSection";
import NftPlacardSettingsForm from "Editor/components/ThemeSettings/NftPlacardSettingsForm";
import { showFromConfig } from "Space/Elements/Nft/NftMediaAndPlacardDisplay";

const defaultWhatToShowConfig = (): Pick<
  ArtworkDisplayConfig,
  "showMedia" | "showPlacard"
> => ({
  showMedia: true,
  showPlacard: true,
});

const WhatToShowForm = (
  props: Forms.StandardFormPropsNullable<
    Pick<ArtworkDisplayConfig, "showMedia" | "showPlacard">
  >
) => {
  const { values, handleFieldChanged } = useNullableChangeHandlersWithDefaults({
    defaultValues: props.defaults,
    nestedForm: props.nestedForm,
  });

  return (
    <FormSection title="What to Show" defaultExpanded notExpandable>
      <Forms.Switch
        value={values.showMedia}
        label="Show the Media (video/image/model)"
        setValue={handleFieldChanged("showMedia")}
      />
      <Forms.Switch
        value={values.showPlacard}
        label="Show the Placard"
        setValue={handleFieldChanged("showPlacard")}
      />
    </FormSection>
  );
};

const AdvancedNftSettingsForm = ({
  mediaFile,
  mediaFileType,
  mediaShape,
  ...props
}: Forms.StandardFormProps<ArtworkDisplayConfig | undefined> & {
  // elementId?: string;
  mediaFileType: MediaType | undefined | null;
  mediaFile: FileLocation | undefined | null;
  mediaShape:
    | {
        width: number;
        height: number;
      }
    | undefined;
}) => {
  const makeNestedFormProps = useMakeNestedFormChangeHandlers({
    nestedForm: props.nestedForm,
  });

  const { showPlacard } = showFromConfig(props.nestedForm.values);

  return (
    <>
      <WhatToShowForm {...props} defaults={defaultWhatToShowConfig} />
      {showPlacard && (
        <NftPlacardSettingsForm
          nestedForm={makeNestedFormProps("nftPlacardSettings")}
          getThemeDefault={themeDefaults.nftPlacard}
          title="Nft Placard Settings"
        />
      )}
    </>
  );
};

export default AdvancedNftSettingsForm;
