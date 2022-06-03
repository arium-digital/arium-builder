import { Suspense } from "react";
import Grid from "@material-ui/core/Grid";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useContextBridge } from "@react-three/drei";
import { Stage } from "@react-three/drei";
import { useState, useEffect } from "react";
import { SpaceContext } from "hooks/useCanvasAndModalContext";
import { ElementsContext } from "components/Elements/Tree/ElementsTree";
import { PresetsType } from "@react-three/drei/helpers/environment-assets";
import { ErrorBoundary } from "react-error-boundary";

declare const presets: {
  rembrandt: {
    main: number[];
    fill: number[];
  };
  portrait: {
    main: number[];
    fill: number[];
  };
  upfront: {
    main: number[];
    fill: number[];
  };
  soft: {
    main: number[];
    fill: number[];
  };
};

type StageProps = {
  shadows?: boolean;
  environment?: PresetsType;
  intensity?: number;
  ambience?: number;
  preset?: keyof typeof presets;
  shadowBias?: number;
  // contactShadow?: boolean;
};

export const ElementPreview = ({
  // file,
  children,
  loaded,
  // contactShadow = false,
  ...rest
}: {
  // file: FileLocation | undefined;
  children: React.ReactChild;
  loaded: boolean;
} & StageProps) => {
  const [adjustCamera, setAdjustCamera] = useState<boolean>(false);

  useEffect(() => {
    setAdjustCamera(true);

    setTimeout(() => {
      setAdjustCamera(false);
    }, 100);
  }, [loaded]);

  const ContextBridge = useContextBridge(SpaceContext, ElementsContext);

  return (
    <Grid container style={{ position: "relative" }}>
      <div style={{ height: 500, width: "100%", position: "relative" }}>
        <Canvas dpr={window.devicePixelRatio}>
          <ContextBridge>
            <ErrorBoundary fallback={null}>
              <Suspense fallback={null}>
                <Stage
                  preset="portrait"
                  {...rest}
                  // @ts-ignore
                  adjustCamera={adjustCamera}
                >
                  {loaded && <OrbitControls />}

                  {children}
                </Stage>
              </Suspense>
            </ErrorBoundary>
          </ContextBridge>
        </Canvas>
      </div>
    </Grid>
  );
};

export default ElementPreview;
