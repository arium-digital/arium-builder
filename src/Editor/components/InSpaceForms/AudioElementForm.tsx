import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import { StandardFormPropsNullable } from "Editor/components/Form";
import React from "react";
import { SimplifiedFormBase } from "./ElementFormBaseAndUtils";
import { AudioConfig } from "spaceTypes/audio";
import { AudioContentForm } from "../SharedForms/Audio/AudioForm";

export const SimplifiedAudioForm = ({
  nestedForm,
  defaults: defaultValues,
  refresh,
}: StandardFormPropsNullable<AudioConfig>) => {
  const changeHandlers = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });
  // const { values } = changeHandlers;

  return (
    <SimplifiedFormBase tabLabels={["Audio"]} refresh={refresh}>
      <AudioContentForm {...changeHandlers} notExpandable />
      <></>
    </SimplifiedFormBase>
  );
};
