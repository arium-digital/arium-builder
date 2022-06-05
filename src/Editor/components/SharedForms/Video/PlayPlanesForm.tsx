import { useCallback, useState, SyntheticEvent } from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Slider from "@material-ui/core/Slider";
import Typography from "@material-ui/core/Typography";
import { PlaySurfaceConfig, PlaySurfacesConfig } from "../../../../spaceTypes";
import { useStyles } from "../../../styles";
import { useChangeHandlers } from "../../Form/helpers";
import EditVectorThree, {
  makDefaultZerosVector3,
} from "../../Form/EditVectorThree";
import * as Forms from "Editor/components/Form";
import SliderField from "../../Form/SliderField";
import SelectButtons from "../../Form/SelectButtons";
import Button from "@material-ui/core/Button";
import randomString from "random-string";
import {
  defaultSurfaceConfig,
  DEFAULT_CROP_BOTT0M,
  DEFAULT_CROP_LEFT,
  DEFAULT_CROP_RIGHT,
  DEFAULT_CROP_TOP,
} from "../../../../defaultConfigs";
import Divider from "@material-ui/core/Divider";
import DeleteIcon from "@material-ui/icons/Delete";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import SwitchField from "../../Form/SwitchField";
import FormControl from "@material-ui/core/FormControl/FormControl";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";

interface PlaySurfaceProps extends Forms.StandardFormProps<PlaySurfaceConfig> {
  handleDelete: () => void;
}

const PlaySurfaceForm = ({ nestedForm, handleDelete }: PlaySurfaceProps) => {
  const classes = useStyles();
  const {
    values: config,
    handleFieldChanged,
    makeNestedFormProps,
  } = useChangeHandlers(nestedForm);

  const handleCropHorizontalChanged = useCallback(
    (event: any, newValue: number | number[]) => {
      const [cropLeft, cropRight] = newValue as number[];
      if (config.cropLeft !== cropLeft)
        handleFieldChanged("cropLeft")(cropLeft);
      if (config.cropRight !== cropRight)
        handleFieldChanged("cropRight")(cropRight);
    },
    [handleFieldChanged, config.cropLeft, config.cropRight]
  );
  const handleCropVerticalChanged = useCallback(
    (event: any, newValue: number | number[]) => {
      const [cropTop, cropBottom] = newValue as number[];
      if (config.cropTop !== cropTop) handleFieldChanged("cropTop")(cropTop);
      if (config.cropBottom !== cropBottom)
        handleFieldChanged("cropBottom")(cropBottom);
    },
    [handleFieldChanged, config.cropTop, config.cropBottom]
  );

  const {
    cropLeft = DEFAULT_CROP_LEFT,
    cropRight = DEFAULT_CROP_RIGHT,
    cropTop = DEFAULT_CROP_TOP,
    cropBottom = DEFAULT_CROP_BOTT0M,
  } = config;

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container>
              <Grid item xs={10} md={5}>
                <Slider
                  value={[cropLeft, cropRight]}
                  onChange={handleCropHorizontalChanged}
                  valueLabelDisplay="auto"
                  aria-labelledby="range-slider"
                  max={1}
                  min={0}
                  step={0.01}
                />
                <Typography id="range-slider" gutterBottom>
                  Crop
                </Typography>
              </Grid>
              <Grid item xs={2} md={1} style={{ height: 300 }}>
                <Slider
                  value={[cropTop, cropBottom]}
                  orientation="vertical"
                  onChange={handleCropVerticalChanged}
                  valueLabelDisplay="auto"
                  aria-labelledby="range-slider"
                  max={1}
                  min={0}
                  step={0.01}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <EditVectorThree
                  description="Position"
                  step={0.1}
                  nestedForm={makeNestedFormProps("position")}
                  defaults={makDefaultZerosVector3}
                />
                <Divider />
                <EditVectorThree
                  description="Rotation"
                  step={0.1}
                  nestedForm={makeNestedFormProps("rotation")}
                  defaults={makDefaultZerosVector3}
                  isAngle
                />
                <Divider />
                <FormControl className={classes.formControl}>
                  <SelectButtons
                    options={["Double Sided", "Single Sided"]}
                    value={config.side || "Double Sided"}
                    // @ts-ignore
                    setValue={handleFieldChanged("side")}
                  />
                </FormControl>
                <Divider />
                <SwitchField
                  label="isSphere"
                  value={config.isEquirectangular}
                  setValue={handleFieldChanged("isEquirectangular")}
                />
                <Divider />
                <SwitchField
                  label="Transparent"
                  value={config.transparent}
                  setValue={handleFieldChanged("transparent")}
                />
                {config.transparent && (
                  <SliderField
                    label="Opacity"
                    value={config.opacity || 1}
                    setValue={handleFieldChanged("opacity")}
                    min={0}
                    max={1}
                  />
                )}

                <Divider />
              </Grid>
            </Grid>
            <Button
              variant="contained"
              color="default"
              className={classes.button}
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

const ConfirmDeleteDialog = ({
  handleCancel,
  handleConfirm,
}: {
  handleCancel: () => void;
  handleConfirm: () => void;
}) => {
  return (
    <Dialog
      open
      onClose={handleCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Delete this Play Surface?"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          This can't be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const PlaySurfacesForm = ({
  nestedForm,
  defaults,
}: Forms.StandardFormPropsNullable<PlaySurfacesConfig>) => {
  const {
    handleFieldChanged,
    values,
    makeNestedFormProps,
  } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues: defaults,
  });

  const [deleting, setDeleting] = useState<string>();

  const handleAdd = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault();

      const newSurfaceKey = randomString({ length: 8 });

      const newSurfaceConfig = defaultSurfaceConfig();

      handleFieldChanged(newSurfaceKey)(newSurfaceConfig);
    },
    [handleFieldChanged]
  );

  const handleDelete = useCallback(
    (id: string) => () => {
      // @ts-ignore
      handleFieldChanged(id)(null);
    },
    [handleFieldChanged]
  );

  const confirmDelete = useCallback(() => {
    if (deleting) {
      handleFieldChanged(deleting)(null);
      setDeleting(undefined);
    }
  }, [deleting, handleFieldChanged]);

  const cancelDelete = useCallback(() => {
    setDeleting(undefined);
  }, []);

  const classes = useStyles();

  return (
    <>
      {deleting && (
        <ConfirmDeleteDialog
          handleCancel={cancelDelete}
          handleConfirm={confirmDelete}
        />
      )}
      <Grid container>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant="h5">Play Planes</Typography>
          </Paper>
        </Grid>
      </Grid>
      {Object.entries(values).map(([id, surfaceConfig]) => {
        if (!surfaceConfig) return null;
        return (
          <PlaySurfaceForm
            key={id}
            // @ts-ignore
            nestedForm={makeNestedFormProps(id)}
            handleDelete={handleDelete(id)}
          />
        );
      })}
      <Grid container>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <Button
              type="submit"
              size="large"
              variant="contained"
              color="primary"
              onClick={handleAdd}
            >
              Add Play Surface
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default PlaySurfacesForm;
