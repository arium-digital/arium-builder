import { EditorContext } from "components/InSpaceEditor/hooks/useEditorState";
import { useContext } from "react";
import { VideoPlaySettings } from "spaceTypes/video";
import * as sectionKeys from "Editor/activeEditorKeys";
import { DEFAULT_MAX_VIDEO_PLAY_DISTANCE } from "defaultConfigs";
import { DoubleSide } from "three";
import { Transform } from "spaceTypes";
import WorldNeutralScaler from "components/utils/WorldNeutralScaler";

const VideoPlaySettingsHelper = ({
  playSettings,
  elementTransform,
}: {
  playSettings: VideoPlaySettings | undefined;
  elementTransform: Transform | undefined;
}) => {
  const show = !!useContext(EditorContext)?.activeEditors[
    sectionKeys.PLAY_SETTINGS
  ];

  if (!show) return null;

  return (
    <>
      {!playSettings?.auto && (
        <WorldNeutralScaler>
          <mesh>
            <meshBasicMaterial
              color="white"
              transparent
              opacity={0.5}
              side={DoubleSide}
            />
            <sphereBufferGeometry
              args={[
                playSettings?.maxDistance || DEFAULT_MAX_VIDEO_PLAY_DISTANCE,
                32,
                16,
              ]}
            />
          </mesh>
        </WorldNeutralScaler>
      )}
    </>
  );
};

export default VideoPlaySettingsHelper;
