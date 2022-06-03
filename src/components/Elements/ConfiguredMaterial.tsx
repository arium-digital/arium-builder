import React, { useEffect, useMemo, useState } from "react";
import { defaultMaterialConfig, defaultPhongConfig } from "defaultConfigs";
import { useConfigOrDefaultRecursive } from "hooks/spaceHooks";
import { toThreeColor } from "libs/color";
import { MaterialConfig } from "spaceTypes";
import { ImageTexture } from "./ImageTexture";

const ConfiguredMaterial = ({
  config,
  handleMaterialSet,
  useThreeColor,
}: {
  config: MaterialConfig | undefined | null;
  handleMaterialSet?: (material: THREE.Material | undefined) => void;
  useThreeColor?: boolean;
}) => {
  const values = useConfigOrDefaultRecursive(config, defaultMaterialConfig);

  const [colorMap, setColorMap] = useState<THREE.Texture | null>(null);
  const [bumpMap, setBumpMap] = useState<THREE.Texture | null>(null);
  const [normalMap, setNormalMap] = useState<THREE.Texture | null>(null);
  const [displacementMap, setDisplacementMap] = useState<THREE.Texture | null>(
    null
  );

  const [materialRef, setMaterialRef] = useState<THREE.Material | null>(null);

  const commonProps = useMemo(
    () => ({
      color: colorMap ? undefined : toThreeColor(values.color, useThreeColor),
      opacity: values.opacity,
      transparent: values.transparent,
      map: colorMap,
      ref: setMaterialRef,
    }),
    [colorMap, values.color, values.opacity, values.transparent, useThreeColor]
  );

  const phong = useConfigOrDefaultRecursive(values.phong, defaultPhongConfig);

  const specularColor = useMemo(() => {
    if (!phong.specularColor) return undefined;

    return toThreeColor(phong.specularColor, useThreeColor);
  }, [phong.specularColor, useThreeColor]);

  useEffect(() => {
    if (materialRef) {
      materialRef.needsUpdate = true;
    }
  }, [colorMap, bumpMap, materialRef]);

  useEffect(() => {
    if (materialRef && handleMaterialSet) {
      handleMaterialSet(materialRef);
    }
  }, [materialRef, handleMaterialSet]);

  useEffect(() => {
    if (handleMaterialSet) {
      return () => handleMaterialSet(undefined);
    }
  }, [handleMaterialSet]);

  return (
    <>
      {values.textureFile && (
        <ImageTexture
          imageFileLocation={values.textureFile}
          setTexture={setColorMap}
          repeatX={values.textureRepeatX}
          repeatY={values.textureRepeatY}
        />
      )}
      {phong.bumpMapTextureFile && (
        <ImageTexture
          imageFileLocation={phong.bumpMapTextureFile}
          setTexture={setBumpMap}
          repeatX={values.textureRepeatX}
          repeatY={values.textureRepeatY}
        />
      )}
      {phong.normalMapTextureFile && (
        <ImageTexture
          imageFileLocation={phong.normalMapTextureFile}
          setTexture={setNormalMap}
          repeatX={values.textureRepeatX}
          repeatY={values.textureRepeatY}
        />
      )}
      {phong.displacementMapTextureFile && (
        <ImageTexture
          imageFileLocation={phong.displacementMapTextureFile}
          setTexture={setDisplacementMap}
          repeatX={values.textureRepeatX}
          repeatY={values.textureRepeatY}
        />
      )}
      {values.materialType === "basic" && (
        <meshBasicMaterial {...commonProps} />
      )}
      {values.materialType === "phong" && (
        <meshPhongMaterial
          {...commonProps}
          // @ts-ignore
          specular={specularColor}
          shininess={phong.shininess}
          reflectivity={phong.reflectivity}
          bumpMap={bumpMap}
          bumpScale={phong.bumpMapScale}
          displacementMap={displacementMap}
          displacementScale={phong.displacementMapScale}
          normalMap={normalMap}
        />
      )}
      {values.materialType === "lambert" && (
        <meshLambertMaterial {...commonProps} />
      )}
    </>
  );
};

export default ConfiguredMaterial;
