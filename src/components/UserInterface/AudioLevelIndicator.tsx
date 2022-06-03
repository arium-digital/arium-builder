import { CSSProperties } from "@material-ui/styles";
import React, { FC, useEffect, useRef } from "react";
import { usePrevious } from "../../hooks/usePrevious";
import { useSpring, animated as a } from "react-spring";
import { useFrameCount } from "../../hooks/useFrameCount";
import { config } from "@react-spring/three";
import { Observable } from "rxjs";
import { useCurrentValueFromObservable } from "hooks/useObservable";

const maxStrokeWidth = 8; // the stroke will hit maxStrokeWidth when volume ~= 0.5
const circleRadius = "46%";
const noiseFrequency = 0.03;
const displacementScale = 10;
const gateThreshold = 0.001;

const hexToRGBArray = (color: string): Array<number> =>
  [1, 3, 5].map((start) => parseInt(color.substr(start, 2), 16));

const arium_mustard = hexToRGBArray("#f29f05");
const arium_cream = hexToRGBArray("#fffff1");
const colorDiff = arium_mustard.map((v, i) => v - arium_cream[i]);
interface IAudioIndicatorProps {
  volume$: Observable<number>;
}

const AnimFeTurbulence = a("feTurbulence");
const AnimFeDisplacementMap = a("feDisplacementMap");

const displacementMapConstants = {
  xChannelSelector: "R",
  yChannelSelector: "G",
  in: "SourceGraphic",
  in2: "TURB",
  result: "DISP",
};

const turbulenceConstants = {
  type: "fractalNoise",
  numOctaves: 1,
  result: "TURB",
};

const svgStyle: CSSProperties = {
  height: "100%",
  width: "100%",
  position: "absolute",
  overflow: "visible",
};

const circleProps = {
  fill: "none",
  r: circleRadius,
};
const interpolateStrokeWidth = (v: number) =>
  1 + Math.min(maxStrokeWidth, v * maxStrokeWidth * 2);

const interpolateColor = (v: number) => {
  v = Math.sqrt(Math.min(1, Math.max(v - 0.1, 0) * 1.5)); // make it more significant
  const rgbArray = [0, 1, 2].map((i) =>
    Math.floor(arium_cream[i] + colorDiff[i] * v)
      .toString(16)
      .padStart(2, "0")
  );
  return "#" + rgbArray.join("");
};

const interpolateOpacity = (v: number) => Math.min(0.6 + v, 1);

const gate = (val: number) => {
  return Math.max(val - gateThreshold, 0) / (1 - gateThreshold);
};
const compress = (val: number, upperLimit: number) =>
  (Math.sin((val / upperLimit - 0.5) * Math.PI) + 1) / 2;

export const useVolumeSpring = ({ volume$ }: IAudioIndicatorProps) => {
  const rawVolume = useCurrentValueFromObservable(volume$, 0);

  const maxRawVolume = useRef((rawVolume ? rawVolume : 0.2) * 1.5);
  maxRawVolume.current = Math.max(maxRawVolume.current, rawVolume);
  const volume = compress(gate(rawVolume), maxRawVolume.current);

  const prevVolume = usePrevious(volume);
  const goingUp = volume > prevVolume;
  const wentUp = usePrevious(goingUp);

  const [{ x }, set] = useSpring<{ x: number }>(() => ({
    x: volume,
  }));

  useEffect(() => {
    if (goingUp)
      set({
        x: volume,
        config: config.wobbly,
      });
    else if (wentUp)
      set({
        x: 0,
        config: config.molasses,
      });
    else return;
  }, [volume, goingUp, wentUp, set]);

  return x;
};

const AnimatedCircle: FC<IAudioIndicatorProps> = (props) => {
  const x = useVolumeSpring(props);
  const frame = useFrameCount();

  return (
    <>
      {[1, 2].map((factor) => (
        <g key={factor}>
          <filter id={`wave${factor}`}>
            <AnimFeTurbulence
              {...turbulenceConstants}
              seed={factor}
              baseFrequency={x?.interpolate((v) => factor * noiseFrequency * v)}
            />
            <AnimFeDisplacementMap
              {...displacementMapConstants}
              scale={x?.interpolate((v) => factor * v * displacementScale)}
            />
          </filter>
          <a.circle
            {...circleProps}
            filter={`url(#wave${factor})`}
            transform={x?.interpolate(
              () => `rotate(${frame * (4 - factor) * 0.3})`
            )}
            stroke={x?.interpolate(interpolateColor)}
            strokeWidth={x?.interpolate(interpolateStrokeWidth)}
            opacity={x?.interpolate(interpolateOpacity)}
          />
        </g>
      ))}
    </>
  );
};

const AudioLevelIndicator: FC<IAudioIndicatorProps> = (props) => (
  <svg style={svgStyle}>
    <svg x="50%" y="50%" style={svgStyle}>
      <AnimatedCircle {...props} />
    </svg>
  </svg>
);

export default AudioLevelIndicator;
