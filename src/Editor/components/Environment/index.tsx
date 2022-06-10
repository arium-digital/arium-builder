import React, { useMemo } from "react";
import { useStyles } from "../../styles";
import Paper from "@material-ui/core/Paper";
import { EnvironmentConfig, SpawnConfig } from "../../../spaceTypes";
import { /*useAutoSaveAndValidate,*/ useChangeHandlers } from "../Form/helpers";
import { environmentDocument } from "../../../shared/documentPaths";
import { EnvironmentConfigSchema } from "../../formAndSchema";
import * as Forms from "../Form";
import * as Text from "../VisualElements/Text";
import Grid from "@material-ui/core/Grid";
import {
  defaultGraphicsConfig,
  defaultSpawnConfig,
} from "../../../defaultConfigs";
import { GraphicsConfig } from "../../../spaceTypes/environment";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import { makDefaultZerosVector3 } from "../Form/EditVectorThree";
import { useValidateAndUpdate } from "Editor/hooks/updateAndCreate";
import { defaultEnvironmentConfig } from "defaultConfigs";
import { Vector3 } from "three";
import { SkyBoxAndHdriForm } from "./SkyBoxAndHdriForm";

const defaultLookAt = () => defaultSpawnConfig().lookAt as Vector3;

const SpawnSetingsForm = ({
  nestedForm,
  defaults,
}: Forms.StandardFormPropsNullable<SpawnConfig>) => {
  const {
    values,
    handleFieldChanged,
    makeNestedFormProps,
  } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues: defaults,
  });

  return (
    <>
      <Text.ElementHeader>Spawn Settings</Text.ElementHeader>
      <Text.ElementHelperText>
        This will determine where users start when they enter the space.
      </Text.ElementHelperText>
      <Grid container>
        <Grid item xs={6}>
          <Forms.EditVectorThree
            step={0.1}
            nestedForm={makeNestedFormProps("origin")}
            defaults={makDefaultZerosVector3}
            description="Origin"
          />
        </Grid>
        <Grid item xs={6}>
          <Forms.EditVectorThree
            step={0.1}
            nestedForm={makeNestedFormProps("lookAt")}
            defaults={defaultLookAt}
            description="Look At"
          />
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={6}>
          <Forms.Number
            initialValue={values.radius}
            setValue={handleFieldChanged("radius")}
            label="Radius"
            help="How far from the center users should spawn.  The spawn location within this radius is random."
          />
        </Grid>
      </Grid>
    </>
  );
};

const DefaultGraphicsSettingsForm = ({
  nestedForm,
  defaults,
}: Forms.StandardFormPropsNullable<GraphicsConfig>) => {
  const { values, handleFieldChanged } = useNullableChangeHandlersWithDefaults({
    nestedForm,
    defaultValues: defaults,
  });

  const classes = useStyles();

  return (
    <>
      <Text.ElementHeader>Default Graphics Settings</Text.ElementHeader>
      <Text.ElementHelperText>
        This will affect both render quality and performance of the space. The
        space's graphics will be rendered with these settings by default.
      </Text.ElementHelperText>
      <Grid container>
        <Grid item xs={12}>
          <Forms.Switch
            value={values.antialias}
            label="Antialias"
            setValue={handleFieldChanged("antialias")}
          />
        </Grid>

        <Grid item xs={12}>
          <br />

          <div className={classes.formRow}>
            <label>Shadow Map:</label>
          </div>

          <div className={classes.formRow}>
            <Forms.SelectButtons
              // @ts-ignore
              value={values.shadowMapType}
              description="Shadow Map Type"
              options={[
                "BasicShadowMap",
                "PCFShadowMap",
                "PCFSoftShadowMap",
                "VSMShadowMap",
              ]}
              // @ts-ignore
              setValue={handleFieldChanged("shadowMapType")}
            />
            <Text.ElementHelperText>
              The shadow map to use when rendering the scene. These correspond
              to the{" "}
              <a href="https://threejs.org/docs/#api/en/constants/Renderer">
                Three.js WebGL renderer Shadow Types.
              </a>
            </Text.ElementHelperText>
          </div>
        </Grid>
      </Grid>
    </>
  );
};

const EnvironmentForm = ({
  nestedForm,
}: Forms.StandardFormProps<EnvironmentConfig>) => {
  const useChangeHandlerResults = useChangeHandlers(nestedForm);
  const {
    values,
    handleFieldChanged,
    makeNestedFormProps,
  } = useChangeHandlerResults;
  const classes = useStyles();

  return (
    <Grid container>
      <Grid item lg={6} xs={12}>
        <Grid>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Text.ElementHeader>Scene Settings</Text.ElementHeader>
              <br />
              <div className={classes.formRow}>
                <SkyBoxAndHdriForm {...useChangeHandlerResults} />
              </div>

              <div className={classes.formRow}>
                <Forms.Slider
                  label="Ambient Light Intensity"
                  value={values.ambientLightIntensity}
                  setValue={handleFieldChanged("ambientLightIntensity")}
                />
              </div>
              <div className={classes.formRow}>
                <Forms.ColorPicker
                  label="Ambient Light Color"
                  value={values.ambientLightColor || "0xfffff"}
                  setValue={handleFieldChanged("ambientLightColor")}
                />
              </div>
              <div className={classes.formRow}>
                <Forms.Switch
                  label="Show Grid"
                  value={values.showGrid}
                  setValue={handleFieldChanged("showGrid")}
                />
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Text.ElementHeader>Fog Settings</Text.ElementHeader>
              <Forms.Switch
                label="Enable Fog"
                value={values.enableFog}
                setValue={handleFieldChanged("enableFog")}
              />
              {values.enableFog && (
                <>
                  <div className={classes.formRow}>
                    <Forms.ColorPicker
                      value={values.fogColor}
                      setValue={handleFieldChanged("fogColor")}
                      label="Fog Color"
                      description="Fog color. Example: If set to black, far away objects will be rendered black."
                    />
                    <Forms.Number
                      initialValue={values.fogNear || 10}
                      setValue={handleFieldChanged("fogNear")}
                      label="Fog Near"
                      description="The minimum distance to start applying fog. Objects that are less than 'near' units from the active camera won't be affected by fog."
                    />
                    <Forms.Number
                      initialValue={values.fogFar || 300}
                      setValue={handleFieldChanged("fogFar")}
                      label="Fog Far"
                      description="The maximum distance at which fog stops being calculated and applied. Objects that are more than 'far' units away from the active camera won't be affected by fog."
                    />
                  </div>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <DefaultGraphicsSettingsForm
              nestedForm={makeNestedFormProps("defaultGraphics")}
              defaults={defaultGraphicsConfig}
            />
          </Paper>
        </Grid>
      </Grid>
      <Grid item lg={6} xs={12}>
        <Paper className={classes.paper}>
          <SpawnSetingsForm
            nestedForm={makeNestedFormProps("spawn")}
            defaults={defaultSpawnConfig}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

const Environment = ({ spaceId }: { spaceId: string }) => {
  const documentRef = useMemo(() => environmentDocument(spaceId), [spaceId]);

  const { nestedForm } = useValidateAndUpdate<EnvironmentConfig>({
    ref: documentRef,
    schema: EnvironmentConfigSchema,
    autoSave: true,
    defaultIfMissing: defaultEnvironmentConfig,
  });

  const classes = useStyles();

  if (!nestedForm) return null;

  return (
    <>
      <Paper className={classes.paper}>
        <Text.SectionHeader>{`Editing Environment`}</Text.SectionHeader>
      </Paper>

      <EnvironmentForm nestedForm={nestedForm} />
    </>
  );
};

export default Environment;
