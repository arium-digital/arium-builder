import React, { useMemo } from "react";
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
  const fontOptions = useMemo(() => {
    return Object.keys(fonts);
  }, []);
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
