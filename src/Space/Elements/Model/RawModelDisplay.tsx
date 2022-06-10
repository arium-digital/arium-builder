import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";

const RawModelDisplay = ({
  fileUrl,
  handleLoaded,
}: {
  fileUrl: string;
  handleLoaded: (loaded: boolean) => void;
}) => {
  const { scene: model } = useGLTF(fileUrl);

  useEffect(() => {
    setTimeout(() => {
      handleLoaded(!!model);
    }, 500);
  }, [model, handleLoaded]);

  if (!model) return null;
  return <primitive object={model} />;
};

export default RawModelDisplay;
