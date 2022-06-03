import { Grid } from "@material-ui/core";
import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  HasEditorState,
  TransformControlMode,
} from "components/InSpaceEditor/types";
import styles from "./styles.module.scss";
import { Object3D } from "three";
import { Table } from "react-bootstrap";
import { ElementConfig, Transform } from "spaceTypes";
import NumberField from "Editor/components/Form/NumberField";
import { NestedFormProp } from "Editor/components/Form";
import {
  UseChangeHandlerResult,
  useChangeHandlers,
} from "Editor/hooks/useChangeHandlers";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import { defaultTransform } from "defaultConfigs";
import {
  makDefaultOnesVector3,
  makDefaultZerosVector3,
} from "Editor/components/Form/EditVectorThree";
import round from "lodash/round";
import { TransformControls } from "three-stdlib";

import { radiansToDegrees } from "libs/utils";

const getValuesByMode = (
  mode: string,
  obj: Object3D
): [number, number, number] | null => {
  switch (mode) {
    case "translate":
      return obj.position.toArray();
    case "rotate":
      return obj.rotation.toArray() as [number, number, number];
    case "scale":
      return obj.scale.toArray();
    default:
      return null;
  }
};

type Axis = "x" | "y" | "z";
type TransformMode = "translate" | "rotate" | "scale";

const ValueEditor = ({
  mode,
  valueRef,
  axis,
  controls,
  transformHandlers,
  refresh,
}: {
  mode: TransformMode;
  valueRef: MutableRefObject<number>;
  axis: Axis;
  controls: TransformControls;
  transformHandlers: UseChangeHandlerResult<Transform>;
  refresh: boolean;
}) => {
  let transformKey: keyof Transform;

  if (mode === "translate") transformKey = "position";
  else if (mode === "scale") transformKey = "scale";
  else transformKey = "rotation";

  const transformChangeHandlers = useNullableChangeHandlersWithDefaults({
    nestedForm: transformHandlers.makeNestedFormProps(transformKey),
    defaultValues:
      mode === "scale" ? makDefaultOnesVector3 : makDefaultZerosVector3,
  });

  const handleFieldChanged = transformChangeHandlers.handleFieldChanged(axis);

  const applyValueToObject = useCallback(
    (value: number) => {
      // @ts-ignore
      const object = controls.object as Object3D | undefined;
      if (object) {
        if (mode === "translate") {
          object.position[axis] = value;
        } else if (mode === "rotate") {
          // console.log(value);
          object.rotation[axis] = value;
        } else {
          object.scale[axis] = value;
        }
      }
    },
    [axis, controls, mode]
  );

  const handleValueChanged = useCallback(
    (value: number) => {
      applyValueToObject(value);
      handleFieldChanged(value);
    },
    [applyValueToObject, handleFieldChanged]
  );

  return (
    <NumberField
      initialValue={valueRef.current}
      setValue={handleValueChanged}
      isAngle={mode === "rotate"}
      dragValueChanged={applyValueToObject}
      step={mode === "rotate" ? 0.5 : 0.2}
      precision={4}
      size="fullWidth"
      noFormControl
    />
  );
};

const precision = 2;

const modeText = (mode: TransformControlMode) => {
  if (mode === "rotate") return "rotation";
  if (mode === "translate") return "position";
  return mode;
};

const MessageDisplayInner = ({
  editorState,
  nestedForm,
}: HasEditorState & { nestedForm: NestedFormProp<ElementConfig> }) => {
  // const message = useCurrentValueFromObservable(editorState.message$, null);

  const {
    transformControls: controls,
    // setMessage,
    elementIsSelected,
    currentEditingElement,
    currentEditingElementPath,
  } = editorState;

  const mode = editorState.transformControlsMode;

  const [transformControlsDragging, setTransformControlsDragging] = useState(
    false
  );

  const x = useRef<number>(0);
  const y = useRef<number>(0);
  const z = useRef<number>(0);
  const xRef = useRef<HTMLElement | null>(null);
  const yRef = useRef<HTMLElement | null>(null);
  const zRef = useRef<HTMLElement | null>(null);
  // const valuesRef = useRef<IVector3>({
  //   x: 0,
  //   y: 0,
  //   z: 0
  // });
  const values = { x, y, z };

  useEffect(() => {
    if (!controls || !elementIsSelected || !mode) {
      return;
    }

    const applyValues = () => {
      // const mode = controls.getMode();
      // console.log('apply')
      // @ts-ignore
      const obj = currentEditingElement;
      if (!obj) return;
      const values = getValuesByMode(mode, obj);

      if (values) {
        const convertedValues =
          mode === "rotate"
            ? values.map((x) => round(radiansToDegrees(x), precision))
            : values.map((x) => round(x, precision));
        x.current = round(values[0], precision);
        y.current = round(values[1], precision);
        z.current = round(values[2], precision);
        if (xRef.current)
          xRef.current.innerText = convertedValues[0].toString();
        if (yRef.current)
          yRef.current.innerText = convertedValues[1].toString();
        if (zRef.current)
          zRef.current.innerText = convertedValues[2].toString();
      }
    };

    const handleDraggingChanged = () => {
      // @ts-ignore
      const dragging = controls.dragging;
      setTransformControlsDragging(dragging);
    };

    controls.addEventListener("mode-changed", applyValues);
    controls.addEventListener("change", applyValues);
    controls.addEventListener("dragging-changed", handleDraggingChanged);

    applyValues();

    return () => {
      controls.removeEventListener("mode-changed", applyValues);
      controls.removeEventListener("change", applyValues);
      controls.removeEventListener("dragging-changed", handleDraggingChanged);
    };
  }, [mode, elementIsSelected, controls, currentEditingElement]);

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setRefresh(true);

    setTimeout(() => {
      setRefresh(false);
    });
  }, [mode, currentEditingElement, currentEditingElementPath]);

  const { makeNestedFormProps } = useChangeHandlers(nestedForm);

  const transformForm = makeNestedFormProps("transform");

  const transformHandlers = useNullableChangeHandlersWithDefaults({
    nestedForm: transformForm,
    defaultValues: defaultTransform,
  });

  return (
    <div className={styles.messageDisplay}>
      <Grid container justify="center" alignItems="center" direction="column">
        <Grid item>
          {mode && controls && (
            <>
              <Table
                size="sm"
                borderless
                className="text-left mb-0"
                style={{ fontSize: 16 }}
              >
                <thead>
                  <tr>
                    <th colSpan={2}>{modeText(mode)}</th>
                  </tr>
                </thead>
                <tbody>
                  {transformControlsDragging && (
                    <>
                      <tr key="x">
                        <td>
                          <strong>x</strong>
                        </td>
                        <td style={{ width: "75px" }}>
                          <strong ref={xRef}></strong>
                        </td>
                      </tr>
                      <tr key="y">
                        <td>
                          <strong>y</strong>
                        </td>
                        <td style={{ width: "75px" }}>
                          <strong ref={yRef}></strong>
                        </td>
                      </tr>
                      <tr key="z">
                        <td>
                          <strong>z</strong>
                        </td>
                        <td style={{ width: "75" }}>
                          <strong ref={zRef}></strong>
                        </td>
                      </tr>
                    </>
                  )}
                  {!transformControlsDragging && !refresh && (
                    <>
                      {Object.entries(values).map(([axis, value]) => (
                        <tr key={`${mode}-${axis}`}>
                          <td>
                            <strong>{axis}</strong>
                          </td>
                          <td style={{ width: "75px" }}>
                            <ValueEditor
                              mode={mode}
                              axis={axis as Axis}
                              valueRef={value}
                              controls={controls}
                              refresh={refresh}
                              transformHandlers={transformHandlers}
                            />
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </Table>
            </>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export const MessageDisplay = (props: HasEditorState) => {
  const { nestedForm } = props.editorState;

  const [refresh, setRefresh] = useState(false);

  const undoChanges$ = props.editorState.undoInstance.stateChanges$;

  useEffect(() => {
    const sub = undoChanges$.subscribe({
      next: () => {
        setRefresh(true);
        setTimeout(() => {
          setRefresh(false);
        });
      },
    });

    return () => sub.unsubscribe();
  }, [undoChanges$]);

  const elementActive = nestedForm?.sourceValues?.active !== false;
  const elementDeleted = nestedForm?.sourceValues?.deleted === true;
  const elementLocked = !!nestedForm?.sourceValues?.locked;

  const hide = !elementActive || elementDeleted || elementLocked;

  if (!nestedForm || refresh || hide) return null;

  return <MessageDisplayInner {...props} nestedForm={nestedForm} />;
};
