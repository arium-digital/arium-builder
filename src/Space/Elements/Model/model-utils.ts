import { getFileDownloadUrl } from "fileUtils";

import * as THREE from "three";
import { MaterialConfig } from "spaceTypes";
import { Object3D, sRGBEncoding } from "three";

export function dispose(model: Object3D) {
  model.traverse((child: Object3D) => {
    // https://discourse.threejs.org/t/dispose-things-correctly-in-three-js/6534
    //@ts-ignore
    if (child.geometry) {
      //@ts-ignore
      child.geometry.dispose();
    }

    //@ts-ignore
    if (child.material) {
      //@ts-ignore
      if (child.material.length) {
        //@ts-ignore
        for (let i = 0; i < child.material.length; ++i) {
          //@ts-ignore
          child.material[i].dispose();
          //@ts-ignore
        }
      } else {
        //@ts-ignore
        child.material.dispose();
        //@ts-ignore
      }
    }
  });
}

const hexStringToHex = (hexString: string): number => {
  return parseInt(hexString.replace(/^#/, ""), 16);
};

const loadTexture = (
  fileDownloadPath: string,
  repeatX?: number,
  repeatY?: number
) => {
  const texture = new THREE.TextureLoader().load(fileDownloadPath);
  texture.encoding = sRGBEncoding;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  if (repeatX || repeatY) texture.repeat.set(repeatX || 1, repeatY || 1);

  return texture;
};

export async function generateMaterialFromConfig(
  materialConfig: MaterialConfig
) {
  if (materialConfig) {
    let tex = null;
    if (materialConfig.textureFile) {
      const fileDownloadPath = await getFileDownloadUrl(
        materialConfig.textureFile
      );

      if (fileDownloadPath)
        tex = loadTexture(
          fileDownloadPath,
          materialConfig.textureRepeatX,
          materialConfig.textureRepeatY
        );
    }

    const color = materialConfig.color
      ? new THREE.Color(hexStringToHex(materialConfig.color))
      : new THREE.Color(0xffffff);
    const commonParams = {
      color,
      map: tex,
      transparent: materialConfig.transparent || false,
      opacity: materialConfig.opacity,
    };
    if (materialConfig.materialType === "phong" && materialConfig.phong) {
      const { phong } = materialConfig;
      let bumpMapTex = null;
      if (phong.bumpMapTextureFile) {
        const fileDownloadPath = await getFileDownloadUrl(
          phong.bumpMapTextureFile
        );

        if (fileDownloadPath)
          bumpMapTex = loadTexture(
            fileDownloadPath,
            materialConfig.textureRepeatX,
            materialConfig.textureRepeatY
          );
      }
      return new THREE.MeshPhongMaterial({
        ...commonParams,
        specular: phong.specularColor
          ? new THREE.Color(phong.specularColor)
          : 0x000000,
        shininess: phong.shininess ? phong.shininess : 0,
        bumpMap: bumpMapTex,
        bumpScale: phong.bumpMapScale ? phong.bumpMapScale : 0,
        reflectivity: phong.reflectivity ? phong.reflectivity : 0,
      });
    } else if (materialConfig.materialType === "lambert") {
      return new THREE.MeshLambertMaterial({
        ...commonParams,
        side: THREE.DoubleSide,
      });
    } else {
      return new THREE.MeshBasicMaterial({
        ...commonParams,
        side: THREE.DoubleSide,
      });
    }
  }
}
