import { useValidateAndUpdate } from "Editor/hooks/updateAndCreate";
import { useMemo } from "react";
import { environmentDocument } from "shared/documentPaths";
import Grid from "@material-ui/core/Grid/Grid";
import { NestedFormPropWithUpdatedId } from "Editor/components/Form";
import { useChangeHandlers } from "Editor/hooks/useChangeHandlers";
import { EnvironmentConfig } from "spaceTypes";
import { EnvironmentConfigSchema } from "Editor/formAndSchema";
import { defaultEnvironmentConfig } from "defaultConfigs";
import { SkyBoxAndHdriForm } from "Editor/components/Environment/SkyBoxAndHdriForm";

const InSpaceEnvironmentFormInner = ({
  nestedForm,
}: {
  nestedForm: NestedFormPropWithUpdatedId<EnvironmentConfig>;
}) => {
  const useChangeHandlerResults = useChangeHandlers(nestedForm);

  return (
    <Grid item xs={12}>
      <SkyBoxAndHdriForm {...useChangeHandlerResults} notExpandable />
    </Grid>
  );
};

const InSpaceSkyBoxForm = ({ spaceId }: { spaceId: string }) => {
  const documentRef = useMemo(() => environmentDocument(spaceId), [spaceId]);

  const { nestedForm } = useValidateAndUpdate<EnvironmentConfig>({
    ref: documentRef,
    schema: EnvironmentConfigSchema,
    autoSave: true,
    defaultIfMissing: defaultEnvironmentConfig,
  });

  if (!nestedForm) return null;

  return <InSpaceEnvironmentFormInner nestedForm={nestedForm} />;
};

export default InSpaceSkyBoxForm;
