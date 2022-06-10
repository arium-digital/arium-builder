import Button from "@material-ui/core/Button";
import { useCallback, useState, ChangeEvent } from "react";

const StoredAssetField = ({
  spaceId,
  path,
  setPath,
  fieldName,
}: {
  spaceId: string;
  path: string;
  setPath: (path: string) => void;
  fieldName: string;
}) => {
  const [, setFile] = useState<string>();

  const fileChanged = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    // @ts-ignore
    const files = e.target.files as string[];

    if (files[0]) {
      const file = files[0];
      setFile(file);
    }
  }, []);

  return (
    <Button variant="contained" component="label">
      Upload File
      <input type="file" style={{ display: "none" }} onChange={fileChanged} />
    </Button>
  );
};

export default StoredAssetField;
