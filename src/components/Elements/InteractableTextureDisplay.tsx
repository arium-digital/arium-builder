import { useGlobalPointerOverLayer } from "hooks/useLayers";
import { useCurrentValueFromObservable } from "hooks/useObservable";
import { FrameConfiguration } from "spaceTypes/image";
import { HoverMeshFrame } from "./HoverMesh";
import Frame from "./Frame";
import {
  Texture,
  Side,
  CylinderBufferGeometry,
  DoubleSide,
  BufferGeometry,
  MeshBasicMaterial,
} from "three";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useSpring } from "@react-spring/three";
import { InteractableContext } from "hooks/useInteractable";
import { degreesToRadians } from "libs/utils";
import { Orientation } from "spaceTypes/video";
import { DEFAULT_CURVE_ORIENTATION } from "defaultConfigs";
import { useLegacyRotation } from "./Video/videoUtils";

const LoadingMaterial = () => {
  const [flip, set] = useState(false);

  const materialRef = useRef<MeshBasicMaterial>();

  useSpring({
    from: { color: "white" },
    to: { color: "gray" },

    reverse: flip,
    onRest: () => set((existing) => !existing),
    onChange: ({ value: { color } }) => {
      if (materialRef.current) materialRef.current.color = color;
    },
  });

  return <meshBasicMaterial ref={materialRef} />;
};

interface CylinderGeometryArgs {
  radiusTop?: number;
  radiusBottom?: number;
  height?: number;
  radialSegments?: number;
  heightSegments?: number;
  openEnded?: boolean;
  thetaStart?: number;
  thetaLength?: number;
}

type Args<T> = T extends new (...args: any) => any
  ? ConstructorParameters<T>
  : T;
type CylinderArgs = Args<CylinderBufferGeometry>;

type InteractableTextureDisplayProps = {
  planeDimensions?: {
    width: number | undefined;
    height: number | undefined;
  } | null;
  texture: Texture | undefined;
  side: Side;
  transparent?: boolean;
  frameConfig?: FrameConfiguration | null;
  hasFrame?: boolean;
  loading?: boolean;
  handleLoaded?: (loaded: boolean) => void;
  legacyRotation?: boolean;
};

const InteractableTextureDisplay = ({
  planeDimensions,
  loading,
  handleLoaded,
  curve,
  curved,
  curveOrientation = DEFAULT_CURVE_ORIENTATION,
  ...rest
}: InteractableTextureDisplayProps & {
  curve?: number;
  curved: boolean;
  curveOrientation?: Orientation;
}) => {
  const dimensionsArray = useMemo((): [number, number] | null => {
    if (!planeDimensions?.width || !planeDimensions.height) {
      if (loading) return [1, 1];
      return null;
    }

    return [planeDimensions.width, planeDimensions.height] as [number, number];
  }, [planeDimensions?.width, planeDimensions?.height, loading]);

  useLayoutEffect(() => {
    if (!handleLoaded) return;

    handleLoaded(!!dimensionsArray);
  }, [dimensionsArray, handleLoaded]);

  const showCurve = curved && !!curve;

  if (!dimensionsArray) return null;

  return (
    <>
      {!showCurve && (
        <>
          <NonCurvedPlane {...rest} dimensionsArray={dimensionsArray} />
        </>
      )}
      {showCurve && (
        <CurvedPlane
          {...rest}
          dimensionsArray={dimensionsArray}
          curve={curve as number}
          curveOrientation={curveOrientation}
        />
      )}
    </>
  );
};

const NonCurvedPlane = ({
  texture,
  side,
  transparent,
  frameConfig,
  hasFrame,
  loading,
  dimensionsArray,
  legacyRotation,
}: Pick<
  InteractableTextureDisplayProps,
  | "texture"
  | "side"
  | "transparent"
  | "hasFrame"
  | "frameConfig"
  | "loading"
  | "legacyRotation"
> & {
  dimensionsArray: [number, number];
}) => {
  const { pointerOver$, enablePointerOverLayer$ } =
    useContext(InteractableContext) || {};

  const pointerOver = useCurrentValueFromObservable(pointerOver$, false);

  const setMesh = useGlobalPointerOverLayer(enablePointerOverLayer$);

  const rotation = useLegacyRotation(legacyRotation);

  return (
    <>
      <mesh ref={setMesh} rotation-y={rotation}>
        {dimensionsArray && (
          <>
            <planeBufferGeometry attach="geometry" args={dimensionsArray} />
            {!loading && texture && (
              <meshBasicMaterial
                attach="material"
                map={texture}
                side={side}
                transparent={transparent}
              />
            )}
            {loading && <LoadingMaterial />}
          </>
        )}
      </mesh>
      {hasFrame && dimensionsArray && frameConfig && (
        <Frame
          config={frameConfig}
          imageDimensions={dimensionsArray}
          boxFront={transparent}
          rotationY={rotation}
        />
      )}
      {dimensionsArray && (
        <HoverMeshFrame
          elementWidth={dimensionsArray[0]}
          elementHeight={dimensionsArray[1]}
          frameConfig={frameConfig && hasFrame ? frameConfig : undefined}
          rotationY={rotation}
          visible={pointerOver}
        />
      )}
    </>
  );
};

// type SidePlansArgs = {
//   width: number,
//   height: number,
//   positionX: number,
//   positionZ: number,
//   rotationY: number,
// }

const rotateUv = (bufferGeometry: BufferGeometry) => {
  const uvAttribute = bufferGeometry.attributes.uv;

  for (let i = 0; i < uvAttribute.count; i++) {
    const u = uvAttribute.getX(i);
    const v = uvAttribute.getY(i);

    // do something with uv

    // write values back to attribute

    uvAttribute.setXY(i, v, u);
  }

  uvAttribute.needsUpdate = true;
};

const flipUvHorizontal = (bufferGeometry: BufferGeometry) => {
  const uvAttribute = bufferGeometry.attributes.uv;

  for (let i = 0; i < uvAttribute.count; i++) {
    const u = uvAttribute.getX(i);
    const v = uvAttribute.getY(i);

    // do something with uv

    // write values back to attribute

    uvAttribute.setXY(i, 1 - u, v);
  }

  uvAttribute.needsUpdate = true;
};

const CurvedPlane = ({
  texture,
  side,
  transparent,
  frameConfig,
  hasFrame,
  loading,
  dimensionsArray,
  curve,
  curveOrientation,
}: Pick<
  InteractableTextureDisplayProps,
  "texture" | "side" | "transparent" | "hasFrame" | "frameConfig" | "loading"
> & {
  dimensionsArray: [number, number];
  curve: number;
  curveOrientation: Orientation;
}) => {
  const { enablePointerOverLayer$ } = useContext(InteractableContext) || {};

  const setMesh = useGlobalPointerOverLayer(enablePointerOverLayer$);

  const [params, setCurveParams] = useState<{
    positionZ: number;
    rotationZ: number;
    cylinder: CylinderArgs;
    uvMapReady: boolean;
    // leftBorder: SidePlansArgs,
  }>();

  const frameDepth = hasFrame ? frameConfig?.depth || 0 : undefined;

  const rotate = curveOrientation === "vertical";

  useEffect(() => {
    const width = dimensionsArray[rotate ? 1 : 0];
    const height = dimensionsArray[rotate ? 0 : 1];
    const radialSegments = 64;

    const thetaLength = degreesToRadians(curve);
    const thetaStart = Math.PI / 2 + (Math.PI - thetaLength) / 2;

    const circumference = 2 * Math.PI;
    const arcLength = circumference * (thetaLength / (Math.PI * 2));

    const heightProportionateToLength = (height * arcLength) / width;

    const scale = height / heightProportionateToLength;

    const radius = scale;

    const effectiveHeight = heightProportionateToLength * scale;

    const a: CylinderGeometryArgs = {
      radiusTop: radius,
      radiusBottom: radius,
      height: effectiveHeight,
      radialSegments,
      heightSegments: 1,
      openEnded: true,
      thetaStart,
      thetaLength,
    };

    //                     (radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength)
    // @ts-ignore
    const args: CylinderArgs = [
      a.radiusTop,
      a.radiusBottom,
      a.height,
      a.radialSegments,
      a.heightSegments,
      a.openEnded,
      a.thetaStart,
      a.thetaLength,
    ];

    const haldChordLength = radius * Math.sin(arcLength / 2);
    const sigatta =
      radius - Math.sqrt(radius * radius - haldChordLength * haldChordLength);

    const positionZ = radius - sigatta;

    const rotationZ = rotate ? -Math.PI / 2 : 0;

    setCurveParams({
      cylinder: args,
      positionZ,
      rotationZ: rotationZ,
      uvMapReady: false,
    });
  }, [dimensionsArray, curve, frameDepth, rotate]);

  const [bufferGeometry, setBufferGeometry] = useState<BufferGeometry | null>(
    null
  );
  // useEffect(() => {
  //   if (!texture) return;
  //   if (rotate) {
  //     const originalRotation = texture.rotation || 0;

  //     texture.rotation = Math.PI / 2;

  //     return () => {
  //       texture.rotation = originalRotation;
  //     }
  //   }

  // }, [rotate, texture])

  useEffect(() => {
    if (!bufferGeometry) return;
    const setReady = () => {
      setCurveParams((existing) => {
        if (!existing) return;
        const updated = {
          ...existing,
          uvMapReady: true,
        };
        return updated;
      });
    };
    if (rotate) {
      rotateUv(bufferGeometry);
      setReady();
      return () => {
        rotateUv(bufferGeometry);
      };
    } else {
      flipUvHorizontal(bufferGeometry);
      setReady();

      return () => {
        flipUvHorizontal(bufferGeometry);
      };
    }
  }, [rotate, bufferGeometry]);

  if (!params) return null;

  return (
    <>
      <mesh
        ref={setMesh}
        position-z={params.positionZ}
        rotation-x={0}
        rotation-y={0}
        rotation-z={params.rotationZ}
        visible={params.uvMapReady}
      >
        <cylinderBufferGeometry
          // @ts-ignore
          args={params.cylinder}
          ref={setBufferGeometry}
        />
        {!loading && (
          <meshBasicMaterial
            attach="material"
            map={texture}
            side={DoubleSide}
            transparent={transparent}
          />
        )}
        {loading && <LoadingMaterial />}
      </mesh>
      {/* {hasFrame && dimensionsArray && frameConfig && (
      <Frame
        config={frameConfig}
        imageDimensions={dimensionsArray}
        boxFront={transparent}
      />
    )}
    {pointerOver && dimensionsArray && (
      <HoverMeshFrame
        elementWidth={dimensionsArray[0]}
        elementHeight={dimensionsArray[1]}
        frameConfig={frameConfig && hasFrame ? frameConfig : undefined}
      />
    )} */}
    </>
  );
};

export default InteractableTextureDisplay;
