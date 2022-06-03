import { SpaceContext } from "hooks/useCanvasAndModalContext";
import React, { useContext, useMemo } from "react";
import fonts from "shared/fonts";
import DropdownSelect from "./DropdownSelect";
import { useEditingElementStatus } from "./useEditingElementState";

const FontSelect = ({
  font,
  handleChanged,
  error,
}: {
  font: string | undefined;
  handleChanged: (updated: string) => void;
  error?: string;
}) => {
  const spaceId = useContext(SpaceContext)?.spaceId;

  const fontOptions = useMemo(() => {
    let result = Object.keys(fonts);
    if (!spaceId?.includes("shantell")) {
      result = result.filter((x) => !x.includes("Shantell"));
    }
    if (!spaceId?.includes("genuino")) {
      result = result.filter((x) => !x.includes("Genuino"));
    }
    return result;
  }, [spaceId]);
  const { locked } = useEditingElementStatus();

  return (
    <DropdownSelect
      label="Font"
      value={font || "Roboto"}
      setValue={handleChanged}
      options={fontOptions}
      error={error}
      size="md"
      disabled={locked}
    />
  );
};

export default FontSelect;
