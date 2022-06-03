import { Typography } from "@material-ui/core";
import { UseChangeHandlerResult } from "Editor/hooks/useChangeHandlers";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import React, { useCallback, useState } from "react";
import { AcceptedFileTypes } from "types";
import { EnvironmentConfig } from "../../../spaceTypes";
import { CustomSkyBox, SkyBoxType } from "../../../spaceTypes/environment";
import { Image } from "../Files/FileSelect";
import * as Forms from "../Form";
import FormSection, { FormSectionDisplaySettings } from "../Form/FormSection";
import SwitchField from "../Form/SwitchField";
const acceeptedHDRIExtensions: string[] = ["hdr", "jpg", "jpeg", "png"];

const acceptedHdriTypes: AcceptedFileTypes = {
  MIMETypes: acceeptedHDRIExtensions.map((ext) => "." + ext).join(","),
  extensions: new Set(acceeptedHDRIExtensions),
};

const CustomHDRIForm = ({
  nestedForm,
}: Forms.StandardFormProps<CustomSkyBox | undefined>) => {
  const {
    values,
    errors,
    handleFieldChanged,
  } = useNullableChangeHandlersWithDefaults<CustomSkyBox>({
    nestedForm,
    defaultValues: () => ({}),
  });

  return (
    <>
      <Image
        disablePaper
        acceptedTypesOverride={acceptedHdriTypes}
        fieldName="Sky Box File (equirectangular)"
        file={values.skyBox}
        handleChanged={handleFieldChanged("skyBox")}
        errors={errors?.skyBox}
        allowEmpty={true}
      />
      <SwitchField
        label="Environment Mapping"
        description="Enable environment mapping?"
        value={values.enableEnvMapping}
        setValue={handleFieldChanged("enableEnvMapping")}
      />
      {values.enableEnvMapping && (
        <SwitchField
          label="Environment Mapping from the Skybox File"
          description="Use the skybox file for the environment map."
          value={values.useSkyBoxAsEnvMap}
          setValue={handleFieldChanged("useSkyBoxAsEnvMap")}
        />
      )}
      {values.enableEnvMapping && !values.useSkyBoxAsEnvMap && (
        <Image
          disablePaper
          acceptedTypesOverride={acceptedHdriTypes}
          fieldName="Environment Mapping File (equirectangular)"
          file={values.envMap}
          handleChanged={handleFieldChanged("envMap")}
          errors={errors?.envMap}
          allowEmpty={true}
        />
      )}
    </>
  );
};

enum PresetOrCustom {
  preset = "Preset",
  custom = "Custom",
}

export const SkyBoxAndHdriForm = ({
  title = "Sky Box",
  defaultExpanded,
  notExpandable,
  ...props
}: UseChangeHandlerResult<EnvironmentConfig> & FormSectionDisplaySettings) => {
  const { values, errors, handleFieldChanged, makeNestedFormProps } = props;
  const [presetOrCustom, setPresetOrCustom] = useState<PresetOrCustom>(
    values.skyBoxType === SkyBoxType.customSkyBox
      ? PresetOrCustom.custom
      : PresetOrCustom.preset
  );
  const handleSelectPresetOrCustom = useCallback(
    (val: string) => {
      setPresetOrCustom(val as PresetOrCustom);
      if (val === PresetOrCustom.custom)
        handleFieldChanged("skyBoxType")(SkyBoxType.customSkyBox);
      else handleFieldChanged("skyBoxType")(SkyBoxType.HDRI);
    },
    [handleFieldChanged]
  );

  return (
    <>
      <FormSection
        {...{
          title,
          defaultExpanded,
          notExpandable,
        }}
      >
        <br />
        <Forms.SelectButtons
          value={presetOrCustom}
          // description="skybox type"
          options={Object.values(PresetOrCustom)}
          setValue={handleSelectPresetOrCustom}
        />
        {presetOrCustom === PresetOrCustom.preset && (
          <>
            <br />
            <br />
            <Typography>Preset type:</Typography>
            <Forms.SelectButtons
              // @ts-ignore
              value={values.skyBoxType}
              // description="skybox type"
              options={[SkyBoxType.HDRI, SkyBoxType.cubeMap]}
              // @ts-ignore
              setValue={handleFieldChanged("skyBoxType")}
            />
          </>
        )}
        {values.skyBoxType === SkyBoxType.HDRI && (
          <>
            <br />
            <br />
            <Forms.FileSelect
              disablePaper
              showThumbnail
              fieldName="HDRI Presets"
              file={values.HDRI}
              handleChanged={handleFieldChanged("HDRI")}
              standardAssetsFolder="hdri"
              errors={errors?.skyBox}
              allowEmpty
              includeFolders
            />
            <Forms.Switch
              label="Environment Mapping"
              setValue={handleFieldChanged("environmentMapping")}
              value={values.environmentMapping}
              description="Enable environment mapping from the skybox?"
            />
          </>
        )}
        {values.skyBoxType === SkyBoxType.cubeMap && (
          <>
            <br />
            <br />
            <Forms.FileSelect
              disablePaper
              fieldName="Cube Map Presets (Legacy)"
              file={values.skyBox}
              handleChanged={handleFieldChanged("skyBox")}
              standardAssetsFolder="cubeMaps"
              errors={errors?.skyBox}
              allowEmpty
              includeFolders
            />
            <Forms.Switch
              label="Environment Mapping"
              setValue={handleFieldChanged("environmentMapping")}
              value={values.environmentMapping}
              description="Enable environment mapping from the skybox?"
            />
          </>
        )}
        {values.skyBoxType === SkyBoxType.customSkyBox && (
          <>
            <br />
            <br />
            <CustomHDRIForm
              {...props}
              nestedForm={makeNestedFormProps("customSkyBox")}
            />
          </>
        )}
      </FormSection>
    </>
  );
};
