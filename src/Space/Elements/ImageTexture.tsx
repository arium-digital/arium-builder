import { useState, useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import { RepeatWrapping, TextureLoader } from "three";
import { FileLocation } from "spaceTypes";
import { getFileDownloadUrl } from "fileUtils";

export const ImageTextureLoader = ({
  imageUrl,
  setTexture,
  repeatX,
  repeatY,
}: {
  imageUrl: string;
  setTexture: (texture: THREE.Texture | null) => void;
  repeatX?: number;
  repeatY?: number;
}) => {
  const texture = useLoader(TextureLoader, imageUrl);

  useEffect(() => {
    setTexture(texture);

    if (repeatX) {
      texture.repeat.setX(repeatX);
      if (repeatX > 1) {
        texture.wrapS = RepeatWrapping;
      }
      texture.needsUpdate = true;
    }

    if (repeatY) {
      texture.repeat.setY(repeatY);
      if (repeatY > 1) {
        texture.wrapT = RepeatWrapping;
      }
      texture.needsUpdate = true;
    }

    return () => {
      texture.dispose();
    };
  }, [texture, setTexture, repeatX, repeatY]);

  useEffect(() => {
    return () => {
      setTexture(null);
    };
  }, [setTexture]);

  return null;
};

export const ImageTexture = ({
  imageFileLocation,
  setTexture,
  repeatX,
  repeatY,
}: {
  imageFileLocation: FileLocation;
  setTexture: (texture: THREE.Texture | null) => void;
  repeatX: number | undefined;
  repeatY: number | undefined;
}) => {
  const [imageUrl, setImageUrl] = useState<string>();
  useEffect(() => {
    (async () => {
      if (imageFileLocation) {
        setImageUrl(await getFileDownloadUrl(imageFileLocation));
      } else {
        setImageUrl(undefined);
      }
    })();
  }, [imageFileLocation]);

  if (imageUrl)
    return (
      <ImageTextureLoader
        setTexture={setTexture}
        imageUrl={imageUrl}
        repeatX={repeatX}
        repeatY={repeatY}
      />
    );

  return null;
};
