import { defaultTransform } from "Editor/components/SharedForms/elementUtils";
import { NestedFormProp } from "Editor/components/Form";
import { useChangeHandlers } from "Editor/hooks/useChangeHandlers";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import { useBehaviorSubjectAndSetterFromCurrentValue } from "hooks/useObservable";
import { asIVector3 } from "libs/utils";
import { useCallback, useEffect, useMemo } from "react";
import { ElementConfig, Transform } from "spaceTypes";
import { TransformControls } from "three-stdlib";
// import { EditorState } from "../types";

const makeHandler = <K extends keyof Transform>(
  makeTransformProps: (prop: K) => NestedFormProp<Transform[K]>,
  field: K
) => {
  const { handleUpdate, path } = makeTransformProps(field);
  const handler = (newValue: Parameters<typeof asIVector3>[0]) => {
    if (path != null)
      handleUpdate({
        path,
        change: asIVector3(newValue),
      });
  };

  return handler;
};

export const useAutoSaveTransform = (
  nestedForm: NestedFormProp<ElementConfig>,
  transformControls: TransformControls | null | undefined
) => {
  // on change, save values to db

  const { makeNestedFormProps } = useChangeHandlers(nestedForm);

  const transformForm = makeNestedFormProps("transform");

  const {
    makeNestedFormProps: makeTransformProps,
  } = useNullableChangeHandlersWithDefaults({
    nestedForm: transformForm,
    defaultValues: defaultTransform,
  });

  const updateScale = useMemo(() => makeHandler(makeTransformProps, "scale"), [
    makeTransformProps,
  ]);

  const updatePosition = useMemo(
    () => makeHandler(makeTransformProps, "position"),
    [makeTransformProps]
  );
  const updateRotation = useMemo(
    () => makeHandler(makeTransformProps, "rotation"),
    [makeTransformProps]
  );

  const controler = transformControls;

  const [dirty$, setDirty] = useBehaviorSubjectAndSetterFromCurrentValue(false);

  const handleSave = useCallback(() => {
    // save to db on value change
    if (!controler) return;
    // @ts-ignore
    const obj = controler?.object;
    if (obj) {
      switch (controler.getMode()) {
        case "translate":
          updatePosition(obj.position);
          break;

        case "rotate":
          updateRotation(obj.rotation);
          break;

        case "scale":
          updateScale(obj.scale);
          break;
        default:
          throw new Error(`invalid mode ${controler.getMode()}`);
      }
    }
  }, [controler, updatePosition, updateRotation, updateScale]);

  // useEffect(() => {
  //   if (!controler) return;
  //   controler.addEventListener("change", handleChange);
  //   return () => {
  //     controler.removeEventListener("change", handleChange);
  //   };
  // }, [controler, handleChange]);

  useEffect(() => {
    controler?.addEventListener("mouseUp", handleSave);

    return () => {
      controler?.removeEventListener("mouseUp", handleSave);
    };
  }, [controler, dirty$, handleSave, setDirty]);
};
