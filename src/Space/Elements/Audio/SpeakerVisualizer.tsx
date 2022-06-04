import useModelFile from "../Model/useModelFile";

const SpeakerVisualizer = () => {
  const { model } = useModelFile("/models/Speaker.glb");

  if (!model) return null;

  return <primitive object={model} />;
};

export default SpeakerVisualizer;
