import { extractExt } from "fileUtils";
import { useState, useEffect } from "react";
import { AnimationClip, Group } from "three";
import { GLTF } from "three-stdlib";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export function createGltfLoader() {
  const gLTFLoader = new GLTFLoader();
  // Optional: Provide a DRACOLoader space to decode compressed mesh data
  const dracoLoader = new DRACOLoader();
  // TODO don't load this loader from unpkg...
  // https://discourse.threejs.org/t/how-to-use-dracoloader-with-gltfloader-with-bare-module-imports/16748
  dracoLoader.setDecoderPath(
    "https://www.gstatic.com/draco/versioned/decoders/1.5.2/"
  );
  gLTFLoader.setDRACOLoader(dracoLoader);

  return gLTFLoader;
}

let glftLoader: GLTFLoader | undefined = undefined;
const getOrCreateGltfLoader = () => {
  if (!glftLoader) glftLoader = createGltfLoader();

  return glftLoader;
};

const useModelFile = (fileUrl: string | undefined) => {
  const gltfLoader = getOrCreateGltfLoader();
  const [model, setModel] = useState<Group | null>(null);
  const [extension, setExtension] = useState<string>();
  const [animations, setAnimations] = useState<AnimationClip[]>();
  const [loadAttemptComplete, setLoadAttemptComplete] = useState(false);

  useEffect(() => {
    if (fileUrl) {
      setExtension(extractExt(fileUrl) || "glb");
    } else {
      setExtension(undefined);
    }
  }, [fileUrl]);

  // Download & Attach to Scene
  useEffect(() => {
    (async () => {
      if (fileUrl && extension) {
        if (extension === "glb" || extension === "gltf") {
          let gltf: GLTF | undefined = undefined;
          try {
            try {
              gltf = await gltfLoader.loadAsync(fileUrl);
            } catch (e) {
              console.error(`failed to parse model at ${fileUrl}`);
              console.error(e);
            }
            if (gltf) {
              if (gltf.animations && gltf.animations.length > 0) {
                setAnimations(gltf.animations);
              } else {
                setAnimations(undefined);
              }
              setModel(gltf.scene);
            }
          } finally {
            setLoadAttemptComplete(true);
          }
        } else {
          setLoadAttemptComplete(true);
          console.error(`No existing loader for model of type ${extension}`);
        }
      }
    })();
  }, [fileUrl, extension, gltfLoader]);

  return {
    model,
    animations,
    loadAttemptComplete,
  };
};

export default useModelFile;
