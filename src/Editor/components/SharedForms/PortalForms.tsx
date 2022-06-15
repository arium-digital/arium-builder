import React, { FC, useEffect, useMemo, useContext } from "react";
import { PortalConfig } from "spaceTypes/portal";
import { FormDescription, Editors } from "../../types";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import Grid from "@material-ui/core/Grid/Grid";
import { FormFields, useFormFields } from "../../hooks/useFormFields";
import { IVector3 } from "spaceTypes";
import { StandardFormPropsNullable } from "../Form";
import { makDefaultZerosVector3 } from "../Form/EditVectorThree";
import FormSection from "../Form/FormSection";
import { UseChangeHandlerResult } from "Editor/hooks/useChangeHandlers";
import { SpaceAccessContext } from "hooks/auth/useSpaceAccess";
import { useSpaceSlugsForIds } from "hooks/useSpaceIdForSlug";

export type PortalFormFields = FormFields<
  PortalConfig,
  | "targetSpaceId"
  | "toAnotherSpace"
  | "showHelper"
  | "radius"
  | "visible"
  | "specifyLandingPosition"
>;

const genPortalFormDescription = (
  availableSpaceOptions: { spaceId: string; slug: string }[]
): FormDescription<
  PortalConfig,
  | "targetSpaceId"
  | "toAnotherSpace"
  | "showHelper"
  | "radius"
  | "visible"
  | "specifyLandingPosition"
> => ({
  radius: {
    editor: Editors.numberField,
    editorConfig: {
      label: "Radius",
      description: "The radius of the spherical trigger area.",
      min: 0.1,
    },
  },
  visible: {
    editor: Editors.switch,
    editorConfig: {
      label: "Visible",
      description: "Do you want to render the portal in the scene?",
    },
  },
  showHelper: {
    editor: Editors.switch,
    editorConfig: {
      label: "Show Helper",
      description:
        "Render the wire frame of the target position, making it easier to find when designing. *Only works with same-space portal.",
    },
  },
  toAnotherSpace: {
    editor: Editors.switch,
    editorConfig: {
      label: "To Another Space",
      description: "If this portal go to a different space",
    },
  },
  specifyLandingPosition: {
    editor: Editors.switch,
    editorConfig: {
      label: "Specify Landing Position",
      description:
        "Should this portal bring the user to a specified position in the other space?",
    },
  },
  targetSpaceId: {
    editor: Editors.dropdownPicker,
    editorConfig: {
      label: "Space To Transport To",
      description: "The space to which this portal transports the user",
      options: availableSpaceOptions.map(({ spaceId, slug }) => ({
        label: slug,
        value: spaceId,
      })),
    },
  },
});
const Vector3FormDescription: FormDescription<IVector3, "x" | "y" | "z"> = {
  x: {
    editor: Editors.numberField,
    editorConfig: {
      label: "x",
      description: "x",
    },
  },
  y: {
    editor: Editors.numberField,
    editorConfig: {
      label: "y",
      description: "y",
    },
  },
  z: {
    editor: Editors.numberField,
    editorConfig: {
      label: "z",
      description: "z",
    },
  },
};

const Vector3Form: FC<
  StandardFormPropsNullable<IVector3> & {
    description: FormDescription<IVector3, "x" | "y" | "z">;
  }
> = ({ description, nestedForm, defaults: defaultValues }) => {
  const {
    values,
    handleFieldChanged,
    errors,
  } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });

  const { FormFields, props } = useFormFields(
    description,
    handleFieldChanged,
    values,
    errors
  );

  return (
    <>
      <Grid container>
        <Grid item xs={4}>
          <FormFields.x {...props} />
        </Grid>
        <Grid item xs={4}>
          <FormFields.y {...props} />
        </Grid>
        <Grid item xs={4}>
          <FormFields.z {...props} />
        </Grid>
      </Grid>
    </>
  );
};

export const PortalSettingsForm = ({ FormFields, props }: PortalFormFields) => (
  <Grid item xs={12}>
    <FormSection title={"Portal Settings"} defaultExpanded>
      <FormFields.radius {...props} />
      <Grid xs={12}>
        <FormFields.toAnotherSpace {...props} />

        <FormFields.visible {...props} />
        <FormFields.showHelper {...props} />
      </Grid>
    </FormSection>
  </Grid>
);

export const ToAnotherSpaceForm = ({ FormFields, props }: PortalFormFields) => (
  <Grid xs={12}>
    <FormSection title="Target Space" defaultExpanded>
      <FormFields.targetSpaceId {...props} />
      <FormFields.specifyLandingPosition {...props} />
    </FormSection>
  </Grid>
);

export const PortalTargetForm = ({
  makeNestedFormProps,
}: Pick<UseChangeHandlerResult<PortalConfig>, "makeNestedFormProps">) => (
  <>
    <Grid item xs={12}>
      <FormSection title="Target Position" defaultExpanded>
        <Vector3Form
          description={Vector3FormDescription}
          nestedForm={makeNestedFormProps("targetPosition")}
          defaults={makDefaultZerosVector3}
        />
      </FormSection>
    </Grid>
    <Grid item xs={12}>
      <FormSection title="Target Look At" defaultExpanded>
        <Vector3Form
          description={Vector3FormDescription}
          nestedForm={makeNestedFormProps("targetLookAt")}
          defaults={makDefaultZerosVector3}
        />
      </FormSection>
    </Grid>
  </>
);

const empty: string[] = [];

export const usePortalFields = ({
  nestedForm,
  defaults: defaultValues,
}: StandardFormPropsNullable<PortalConfig>) => {
  const spaceAccessContext = useContext(SpaceAccessContext);

  const spaceEditors = spaceAccessContext?.editableSpaces || empty;

  const changeHandlers = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues,
  });
  const {
    values,
    handleFieldChanged,
    errors,
    makeNestedFormProps,
  } = changeHandlers;

  const spaceSlugs = useSpaceSlugsForIds(spaceEditors);

  const formDescription = useMemo(() => genPortalFormDescription(spaceSlugs), [
    spaceSlugs,
  ]);

  useEffect(() => {
    if (
      values.toAnotherSpace &&
      !values.targetSpaceId &&
      spaceEditors.length > 0
    ) {
      // autoselect first space if to another space and there is no current target space id
      handleFieldChanged("targetSpaceId")(spaceEditors[0]);
    }
  }, [
    spaceEditors,
    values.toAnotherSpace,
    values.targetSpaceId,
    handleFieldChanged,
  ]);

  const formFieldsAndProps = useFormFields(
    formDescription,
    handleFieldChanged,
    values,
    errors
  );

  return { formFieldsAndProps, values, makeNestedFormProps };
};
