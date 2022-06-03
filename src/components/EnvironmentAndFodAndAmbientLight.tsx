import React, { Suspense, useEffect, useMemo, useState } from "react";

// THREE.js imports:
import { CubeTextureLoader } from "three/src/loaders/CubeTextureLoader";
import { EnvironmentConfig } from "../spaceTypes";
import {
  extractExt,
  getDownloadUrl,
  getFileDownloadUrlAsync,
} from "../fileUtils";

import { useThree } from "@react-three/fiber";
import { FileLocation, StoredFileLocation } from "../../shared/sharedTypes";
import { getAssetPath } from "media/assetPaths";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import {
  EquirectangularReflectionMapping,
  PMREMGenerator,
  sRGBEncoding,
  Texture,
  TextureLoader,
  WebGLRenderer,
} from "three";
import { HDRI_QUALITY, SKYBOX_QUALITY } from "config";
import { SkyBoxType } from "spaceTypes/environment";

const defaultHDRI = {
  hdri:
    "https://firebasestorage.googleapis.com/v0/b/volta-events-294715.appspot.com/o/standardAssets%2Fhdri%2Fkloppenheim_06%2Fkloppenheim_06_8k.jpg?alt=media&token=add96adf-3fd5-47c4-a0d3-d6d3dc68dbdb",
  skybox:
    "https://firebasestorage.googleapis.com/v0/b/volta-events-294715.appspot.com/o/hdri%2Fkloppenheim_06%2Fkloppenheim_06_4k.hdr?alt=media&token=beed0875-d5e7-4153-9645-1e8a0f11a13a",
};
const fileNames = [
  "posx.jpg",
  "negx.jpg",
  "posy.jpg",
  "negy.jpg",
  "posz.jpg",
  "negz.jpg",
];

type HasVisibility = {
  visible?: boolean;
};

async function getCubeMapDownloadPaths(fileLocation: StoredFileLocation) {
  const basePath = getAssetPath(fileLocation);
  const filePaths = fileNames.map((fileName) => `${basePath}/${fileName}`);

  return await Promise.all(
    filePaths.map((filePath) => getDownloadUrl(filePath))
  );
}

const createCubemapTextureFromEquatangularJpegUrl = async (
  jpegUrl: string,
  gl: WebGLRenderer
): Promise<Texture> => {
  return new Promise<Texture>((res, rej) => {
    const onLoad = (texture: Texture): void => {
      texture.mapping = EquirectangularReflectionMapping;
      texture.encoding = sRGBEncoding;
      res(texture);
    };
    new TextureLoader().load(jpegUrl, onLoad, undefined, (err) => {
      rej(err);
    });
  });
};

const createCubeTextureFromEquirectangularHDRIUrl = async (
  hdriUrl: string,
  gl: WebGLRenderer
): Promise<Texture> => {
  return new Promise<Texture>((res, rej) => {
    const gen = new PMREMGenerator(gl);
    const onLoad = (texture: Texture): void => {
      const envTexture = gen.fromEquirectangular(texture).texture;

      gen.dispose();

      res(envTexture);
    };
    new RGBELoader().load(hdriUrl, onLoad, undefined, (err) => {
      rej(err);
    });
  });
};

const getHDRIUrlByPreset = async (
  HDRI: EnvironmentConfig["HDRI"]
): Promise<[string, string]> => {
  if (HDRI) {
    const basePath = getAssetPath(HDRI as StoredFileLocation);
    if (basePath) {
      const fileName = basePath.slice(basePath.lastIndexOf("/") + 1);
      const hdriUrl = await getDownloadUrl(
        `${basePath}/${fileName}_${HDRI_QUALITY}.hdr`
      );
      const backgroundUrl = await getDownloadUrl(
        `${basePath}/${fileName}_${SKYBOX_QUALITY}.jpg`
      );
      return [hdriUrl, backgroundUrl];
    }
  }
  return [defaultHDRI.hdri, defaultHDRI.skybox];
};

enum SupportedExtensions {
  jpg = "jpg",
  jpeg = "jpeg",
  png = "png",
  hdr = "hdr",
}

const createCubemapTextureFromEquatangularUrl = (
  ext: SupportedExtensions,
  url: string,
  gl: WebGLRenderer
): Promise<Texture> => {
  if (ext === "jpg" || ext === "jpeg" || ext === "png")
    return createCubemapTextureFromEquatangularJpegUrl(url, gl);
  if (ext === "hdr")
    return createCubeTextureFromEquirectangularHDRIUrl(url, gl);
  throw Error(`unknown envMap file type: ${ext}`);
};

const extractExtFromFileLocation = (file: FileLocation): string | undefined => {
  if (file.fileType === "stored") return extractExt(file.fileName);
  if (file.fileType === "external") return extractExt(file.url);
  throw Error(`unknown file type ${JSON.stringify(file)}`);
};

const CustomHDRI = ({
  customSkyBox: { envMap, skyBox, useSkyBoxAsEnvMap, enableEnvMapping },
  visible = true,
}: Pick<Required<EnvironmentConfig>, "customSkyBox"> & HasVisibility) => {
  const { gl } = useThree();

  const [hdriTexture, setHdriTexture] = useState<Texture>();
  const [bgTexture, setBgTexture] = useState<Texture>();

  useEffect(() => {
    if (skyBox)
      getFileDownloadUrlAsync(skyBox)
        .then((url) => {
          if (!url) throw Error("Cannot get custom skybox url");
          const ext = extractExtFromFileLocation(skyBox);
          if (ext && ext in SupportedExtensions)
            return createCubemapTextureFromEquatangularUrl(
              ext as SupportedExtensions,
              url,
              gl
            );
          else throw Error(`unknown envMap file type: ${ext}`);
        })
        .then((bgTexture) => {
          setBgTexture(bgTexture);

          if (!enableEnvMapping) return;

          if (useSkyBoxAsEnvMap) {
            setHdriTexture(bgTexture);
            return;
          }

          if (envMap)
            return getFileDownloadUrlAsync(envMap)
              .then((url) => {
                if (!url) throw Error("Cannot get envMap url");
                const ext = extractExtFromFileLocation(envMap);
                if (ext && ext in SupportedExtensions)
                  return createCubemapTextureFromEquatangularUrl(
                    ext as SupportedExtensions,
                    url,
                    gl
                  );
                else throw Error(`unknown envMap file type: ${ext}`);
              })
              .then((hdriTexture) => {
                setHdriTexture(hdriTexture);
              });
        });
  }, [gl, envMap, skyBox, useSkyBoxAsEnvMap, enableEnvMapping]);

  if (!visible) return null;

  return (
    <>
      <ApplyTextureToSkyBox texture={bgTexture} />
      {enableEnvMapping && <ApplyTextureToEnvironment texture={hdriTexture} />}
    </>
  );
};

const HDRIPreset = ({
  HDRI,
  environmentMapping,
  visible = true,
}: Pick<EnvironmentConfig, "HDRI"> &
  Pick<EnvironmentConfig, "environmentMapping"> &
  HasVisibility) => {
  const { gl } = useThree();

  const [hdriTexture, setHdriTexture] = useState<Texture>();
  const [bgTexture, setBgTexture] = useState<Texture>();

  useEffect(() => {
    getHDRIUrlByPreset(HDRI)
      .then(([hdriUrl, backgroundUrl]) =>
        Promise.all([
          createCubeTextureFromEquirectangularHDRIUrl(hdriUrl, gl),
          createCubemapTextureFromEquatangularJpegUrl(backgroundUrl, gl),
        ])
      )
      .then(([hdriTexture, bgTexture]) => {
        setBgTexture(bgTexture);
        setHdriTexture(hdriTexture);
      });
  }, [gl, HDRI, environmentMapping]);

  if (!visible) return null;

  return (
    <>
      <ApplyTextureToSkyBox texture={bgTexture} />
      {environmentMapping && (
        <ApplyTextureToEnvironment texture={hdriTexture} />
      )}
    </>
  );
};

const ApplyTextureToSkyBox = ({
  texture,
}: {
  texture: Texture | undefined;
}) => {
  const { scene } = useThree();

  useEffect(() => {
    if (!texture) return;
    scene.background = texture;

    return () => {
      scene.background = null;
    };
  }, [texture, scene]);

  return null;
};

const ApplyTextureToEnvironment = ({
  texture,
}: {
  texture: Texture | undefined;
}) => {
  const { scene } = useThree();

  useEffect(() => {
    if (!texture) return;
    scene.environment = texture;

    return () => {
      scene.background = null;
    };
  }, [texture, scene]);

  return null;
};

const LegacySkyBox = ({
  cubeMapFiles,
  environmentMapping = false,
  visible = true,
}: {
  cubeMapFiles: StoredFileLocation;
  environmentMapping: boolean | undefined;
} & HasVisibility) => {
  const [texture, setTexture] = useState<Texture>();

  useEffect(() => {
    (async () => {
      const cubeMapPaths = await getCubeMapDownloadPaths(cubeMapFiles);

      const texture = new CubeTextureLoader().load(cubeMapPaths);

      setTexture(texture);
    })();
  }, [cubeMapFiles, environmentMapping]);

  if (!visible) return null;

  return (
    <>
      <ApplyTextureToSkyBox texture={texture} />
      {environmentMapping && <ApplyTextureToEnvironment texture={texture} />}
    </>
  );
};

const ConfiguredEnvironment = ({
  skyBoxType,
  skyBox,
  environmentMapping,
  HDRI,
  customSkyBox,
  visible = true,
}: EnvironmentConfig & HasVisibility) => {
  return (
    <>
      {(skyBoxType === undefined || skyBoxType === SkyBoxType.cubeMap) &&
        skyBox && (
          <LegacySkyBox
            cubeMapFiles={skyBox as StoredFileLocation}
            environmentMapping={environmentMapping}
            visible={visible}
          />
        )}

      {skyBoxType === SkyBoxType.HDRI && (
        <HDRIPreset
          HDRI={HDRI}
          environmentMapping={environmentMapping}
          visible={visible}
        />
      )}

      {skyBoxType === SkyBoxType.customSkyBox && (
        <CustomHDRI customSkyBox={customSkyBox || {}} visible={visible} />
      )}
    </>
  );
};

const EnvironmentAndFogAndAmbientLight = ({
  environment,
  visible = true,
}: {
  environment: EnvironmentConfig;
  visible?: boolean;
}) => {
  const { ambientLightIntensity, showGrid, ambientLightColor } = environment;

  const fogParams = useMemo(() => {
    if (!environment.enableFog) return undefined;
    return [
      environment.fogColor || "#cdcdcd",
      environment.fogNear || 10,
      environment.fogFar || 300,
    ];
  }, [environment]);

  return (
    <>
      {showGrid && visible && (
        <gridHelper position={[0, -0.01, 0]} args={[200, 200]} />
      )}
      {/* @ts-ignore */}
      <ambientLight
        intensity={ambientLightIntensity}
        color={ambientLightColor}
        visible={visible}
      />
      <Suspense fallback={null}>
        <ConfiguredEnvironment {...environment} visible={visible} />
      </Suspense>
      {fogParams && (
        <fog
          attach="fog"
          // @ts-ignore
          args={fogParams}
          visible={visible}
        />
      )}
    </>
  );
};

const EnvironmentWrapper = ({
  environment,
  visible = true,
}: {
  environment: EnvironmentConfig | undefined;
  visible?: boolean;
}) => {
  if (!environment) return null;

  return (
    <EnvironmentAndFogAndAmbientLight
      environment={environment}
      visible={visible}
    />
  );
};

export default EnvironmentWrapper;
