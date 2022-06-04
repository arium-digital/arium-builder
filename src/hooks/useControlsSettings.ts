import { ControlsSettings, PhysicsSettings } from "Space/componentTypes";
import { useState, useEffect, useMemo } from "react";
import { useConfigOrDefaultRecursive } from "./spaceHooks";
import merge from "lodash/merge";
import { spacePositionalPhysicsDocument } from "shared/documentPaths";
import { defaultPhysicsSettings } from "defaultConfigs";

const useControlsSettings = ({
  spaceId,
  controlSettingsFromProps,
}: {
  spaceId: string | undefined;
  controlSettingsFromProps: ControlsSettings | undefined;
}) => {
  const [
    spacePhysicsSettings,
    setSpacePhysicsSetting,
  ] = useState<PhysicsSettings>();

  const [keyboardControlsDisabled, setKeyboardControlsDisabled] = useState(
    false
  );

  const physicsSettings = useConfigOrDefaultRecursive(
    spacePhysicsSettings,
    defaultPhysicsSettings
  );

  useEffect(() => {
    if (!spaceId) return;
    const unsub = spacePositionalPhysicsDocument(spaceId).onSnapshot(
      (update) => {
        if (update.exists) {
          setSpacePhysicsSetting(update.data() as PhysicsSettings);
        }
      }
    );

    return () => unsub();
  }, [spaceId]);

  const controlsSettings = useMemo((): ControlsSettings => {
    const result = merge(
      {},
      physicsSettings,
      { disableKeyboardControls: keyboardControlsDisabled },
      controlSettingsFromProps
    ) as ControlsSettings;

    return result;
  }, [controlSettingsFromProps, physicsSettings, keyboardControlsDisabled]);

  //   const setKeyboardControlsDisabled = useCallback((disable: boolean) => {
  //     setControlSettings((existing) => {
  //       const original: ControlsSettings = existing || {};
  //       return {
  //         ...original,
  //         disableKeyboardControls: disable,
  //       };
  //     });
  //   }, [])

  return {
    setKeyboardControlsDisabled,
    controlsSettings,
  };
};

export default useControlsSettings;
