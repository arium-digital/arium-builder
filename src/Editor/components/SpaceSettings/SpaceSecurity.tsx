import { stripUndefined } from "libs/utils";
import { useEffect, useMemo } from "react";
import { spaceSecurityDocument } from "shared/documentPaths";
import { SpaceSecurity } from "../../../../shared/sharedTypes";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import * as Text from "../VisualElements/Text";
import { FormDescription, Editors } from "Editor/types";
import { useChangeHandlers } from "../Form/helpers";
import useFormFields from "Editor/hooks/useFormFields";
import Button from "@material-ui/core/Button";
import { useStyles } from "shared/styles";
import * as Forms from "Editor/components/Form";
import { hashPassword } from "libs/passwords";
import Alert from "@material-ui/lab/Alert";
import useTimedAlert, { AlertAndSeverity } from "hooks/useTimedAlert";
import { useValidateAndUpdate } from "Editor/hooks/updateAndCreate";
import * as yup from "yup";

const securityFormDescription: FormDescription<
  SpaceSecurity,
  "requirePassword" | "password"
> = {
  requirePassword: {
    editor: Editors.switch,
    editorConfig: {
      label: "Require Password",
    },
  },
  password: {
    editor: Editors.password,
    editorConfig: {
      label: "Password",
      description: "Password required to enter the space.",
      size: "xl",
    },
  },
};

const SpaceSecurityForm = ({
  nestedForm,
  alertAndSeverity,
  handleSave,
  saving,
}: Forms.StandardFormProps<SpaceSecurity> & {
  alertAndSeverity?: AlertAndSeverity;
  handleSave: () => void;
  saving: boolean;
}) => {
  const {
    values,
    handleFieldChanged,
    errors,
  } = useChangeHandlers<SpaceSecurity>(nestedForm);

  const { FormFields, props } = useFormFields(
    securityFormDescription,
    handleFieldChanged,
    values,
    errors
  );

  const classes = useStyles();

  return (
    <Grid item xs={12} md={6} lg={4}>
      <Paper className={classes.paper}>
        <div className={classes.formRow}>
          <Text.ElementHeader>Space Security Settings</Text.ElementHeader>
        </div>
        {alertAndSeverity && (
          <Alert severity={alertAndSeverity.severity}>
            {alertAndSeverity.message}
          </Alert>
        )}
        <FormFields.requirePassword {...props} />

        {values.requirePassword && (
          <div className={classes.formRow}>
            <FormFields.password {...props} />
          </div>
        )}
        <div className={classes.formRow}>
          <Button
            type="submit"
            size="large"
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving}
          >
            Save
          </Button>
        </div>
      </Paper>
    </Grid>
  );
};

const defaultSecurity = (): SpaceSecurity => ({});

const transformBeforeSave = (values: SpaceSecurity) => {
  const cleaned = stripUndefined(values);
  if (cleaned.password) {
    cleaned.password = hashPassword(cleaned.password);
  }

  return cleaned;
};

const SecuritySchema = yup.object().shape({
  requiredPassword: yup.boolean(),
  password: yup.string().when("requirePassword", (requirePassword: boolean) => {
    if (requirePassword) return yup.string().required();
  }),
});

const SpaceSecurityEditor = ({ spaceId }: { spaceId: string }) => {
  const documentRef = useMemo(() => spaceSecurityDocument(spaceId), [spaceId]);

  const { alert, openAlert } = useTimedAlert(2000);

  const {
    nestedForm,
    manualSave,
    saving,
    saves$,
  } = useValidateAndUpdate<SpaceSecurity>({
    ref: documentRef,
    schema: SecuritySchema,
    autoSave: false,
    defaultIfMissing: defaultSecurity,
    transformBeforeSave,
  });

  useEffect(() => {
    const sub = saves$.subscribe({
      next: () => {
        openAlert({ message: "Settings updated", severity: "success" });
      },
    });

    return () => {
      sub.unsubscribe();
    };
  }, [openAlert, saves$]);

  if (!nestedForm) return null;

  return (
    <SpaceSecurityForm
      nestedForm={nestedForm}
      handleSave={manualSave}
      alertAndSeverity={alert}
      saving={saving}
    />
  );
};

export default SpaceSecurityEditor;
