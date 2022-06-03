import React, { FC, useMemo, useRef } from "react";
import { ElementConfig, ElementType, Transform } from "../../../spaceTypes";
import Paper from "@material-ui/core/Paper/Paper";
import { useStyles } from "../../styles";
import TransformForm from "./TransformForm";
import ModelForm from "./ModelForm";
import { store } from "../../../db";
import FreeTextField from "../Form/FreeTextField";
import TextForm from "./TextForm";
import ImageForm from "./ImageForm";
import { useChangeHandlers } from "../Form/helpers";
import LightForm from "./Light/LightForm";
import VideoForm from "./Video/VideoForm";
import ScreenShareForm from "./ScreenShareForm";
import BroadcastZoneForm from "./BroadcastZoneForm";
import ReflectorSurfaceForm from "./ReflectorSurfaceForm";
import { defaultReflectorSurfaceConfig } from "../../../spaceTypes/reflectorSurface";
import PortalForm from "./PortalForm";
import {
  defaultBroadcastZoneConfig,
  defaultLightConfig,
  defaultScreenShareConfig,
  defaultText,
  defaultTerrainConfig,
  defaultModel,
} from "defaultConfigs";
import { defaultPortalConfig } from "spaceTypes/portal";
import { defaultOnesVector3 } from "../Form/EditVectorThree";
import { Vector3 } from "three";
import * as typeChecks from "components/Elements/elementTypeChecks";

import * as Forms from "../Form";
import PlacardForm from "./PlacardForm";
import TerrainForm from "./TerrainForm";
import NftForm from "./Nft/NftForm";
import WaterForm from "./WaterForm";
import { defaultWaterConfig } from "spaceTypes/water";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { ElementsContextType } from "components/Elements/Tree/ElementsTree";
import { ElementsContext } from "components/Elements/Tree/ElementsTree";
import { useDefaultThemedConfigs } from "defaultConfigs/useDefaultNewElements";
import { EditingElementContext } from "./EditiingElementContext";

export const getCollectionRef = (spaceId: string, path: string[]) => {
  const elementsCollection = store
    .collection("spaces")
    .doc(spaceId)
    .collection("elements");

  if (path.length === 0) return elementsCollection;

  let collectionRef = elementsCollection.doc(path[0]).collection("elements");

  path.slice(1).forEach((currentPath) => {
    collectionRef = collectionRef.doc(currentPath).collection("elements");
  });

  // console.log("path", collectionRef.path);

  return collectionRef;
};

export const getElementRef = (spaceId: string, path: string[]) => {
  const elementsCollection = store
    .collection("spaces")
    .doc(spaceId)
    .collection("elementsTree");

  if (path.length === 0) return null;

  const elementId = path[path.length - 1];

  const documentRef = elementsCollection.doc(elementId);

  return documentRef;
};

export const purgeUndefined = (object: any): Object => {
  if (typeof object === "object") {
    const result = {
      ...object,
    };

    Object.entries(result).forEach(([key, val]) => {
      if (typeof val === "undefined") {
        delete result[key];
      } else {
        // recursive call - purge undefined children.
        result[key] = purgeUndefined(val);
      }
    });

    return result;
  }

  return object;
};

export const defaultTransform = (): Transform => ({
  scale: defaultOnesVector3,
});

const ErrorFallback: FC<FallbackProps> = ({ error }) => {
  return <div>An unhandled error occured...</div>;
};

export const getElementTypes = () =>
  Object.values(ElementType).filter((elementType) => elementType !== "root");

const ElementForm = ({
  nestedForm,
  spaceId,
  disableTypeChanged,
  elementId,
}: Forms.StandardFormProps<ElementConfig> & {
  disableTypeChanged?: boolean;
  elementId?: string;
  spaceId: string;
}) => {
  const classes = useStyles();

  const {
    values,
    errors,
    handleFieldChanged,
    makeNestedFormProps,
  } = useChangeHandlers(nestedForm);

  const elementTypes = useMemo(getElementTypes, []);

  const playerPositionRef = useRef<Vector3 | undefined>();

  const elementsContext: ElementsContextType = {
    spaceId,
    playerPositionRef,
    documentationMode: false,
  };

  const editingElementStatus = useMemo(() => ({ locked: values.locked }), [
    values.locked,
  ]);

  const themedConfigs = useDefaultThemedConfigs();

  return (
    <>
      <ElementsContext.Provider value={elementsContext}>
        <EditingElementContext.Provider value={editingElementStatus}>
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(error: Error, info: { componentStack: string }) => {
              console.error("error loading values:", values);
              console.error(error, info);
            }}
            resetKeys={Object.values(values)}
          >
            <Paper className={classes.paper}>
              <Forms.SelectButtons
                options={elementTypes}
                // @ts-ignore
                value={values.elementType}
                // @ts-ignore
                setValue={handleFieldChanged("elementType")}
                disabled={disableTypeChanged}
              />
            </Paper>
            {values.elementType && (
              <>
                <Paper className={classes.paper}>
                  <FreeTextField
                    value={values.name}
                    setValue={handleFieldChanged("name")}
                    label="Element Name"
                    size={"xl"}
                    error={errors?.name}
                  />
                </Paper>
                <TransformForm
                  nestedForm={makeNestedFormProps("transform")}
                  defaults={defaultTransform}
                />
                {typeChecks.isModel(values) && (
                  <ModelForm
                    nestedForm={makeNestedFormProps("model")}
                    defaults={defaultModel}
                  />
                )}
                {typeChecks.isPlacard(values) && (
                  <PlacardForm
                    nestedForm={makeNestedFormProps("placard")}
                    defaults={themedConfigs.placard}
                  />
                )}
                {typeChecks.isText(values) && (
                  <TextForm
                    nestedForm={makeNestedFormProps("text")}
                    defaults={defaultText}
                  />
                )}
                {typeChecks.isImage(values) && (
                  <ImageForm
                    nestedForm={makeNestedFormProps("image")}
                    defaults={themedConfigs.image}
                  />
                )}
                {typeChecks.isLight(values) && (
                  <LightForm
                    nestedForm={makeNestedFormProps("light")}
                    defaults={defaultLightConfig}
                  />
                )}
                {typeChecks.isVideo(values) && (
                  <VideoForm
                    nestedForm={makeNestedFormProps("video")}
                    defaults={themedConfigs.video}
                  />
                )}
                {typeChecks.isScreenShare(values) && (
                  <ScreenShareForm
                    nestedForm={makeNestedFormProps("screenShare")}
                    defaults={defaultScreenShareConfig}
                  />
                )}
                {typeChecks.isBroadcastZone(values) && (
                  <BroadcastZoneForm
                    nestedForm={makeNestedFormProps("broadcastZone")}
                    defaults={defaultBroadcastZoneConfig}
                  />
                )}
                {typeChecks.isReflectorSurface(values) && (
                  <ReflectorSurfaceForm
                    nestedForm={makeNestedFormProps("reflectorSurface")}
                    defaults={defaultReflectorSurfaceConfig}
                  />
                )}
                {typeChecks.isPortal(values) && (
                  <PortalForm
                    nestedForm={makeNestedFormProps("portal")}
                    defaults={defaultPortalConfig}
                  />
                )}
                {typeChecks.isTerrain(values) && (
                  <TerrainForm
                    nestedForm={makeNestedFormProps("terrain")}
                    defaults={defaultTerrainConfig}
                  />
                )}
                {typeChecks.isNft(values) && (
                  <NftForm
                    nestedForm={makeNestedFormProps("nft")}
                    defaults={themedConfigs.nft}
                    elementId={elementId}
                  />
                )}
                {typeChecks.isWater(values) && (
                  <WaterForm
                    nestedForm={makeNestedFormProps("water")}
                    defaults={defaultWaterConfig}
                    transform={values.transform}
                  />
                )}
              </>
            )}
          </ErrorBoundary>
        </EditingElementContext.Provider>
      </ElementsContext.Provider>
    </>
  );
};

export default ElementForm;
