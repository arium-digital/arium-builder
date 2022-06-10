import { useCallback, useMemo } from "react";
import { Html } from "@react-three/drei";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";
import Button from "@material-ui/core/Button";
import { primaryFont } from "css/styleVariables";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: theme.spacing(1),
      borderRadius: 0,
      opacity: 0.8,
      fontFamily: primaryFont,
    },
  })
);

const ManualPlayButton = ({
  playOrPauseVideo,
  legacyRotation,
}: {
  playOrPauseVideo: (play: boolean) => void;
  legacyRotation?: boolean;
}) => {
  const play = useCallback(() => {
    playOrPauseVideo(true);
  }, [playOrPauseVideo]);

  const classes = useStyles();

  const rotation = useMemo(() => (legacyRotation ? -Math.PI / 2 : 0), [
    legacyRotation,
  ]);

  return (
    <group rotation-y={rotation} scale-x={0.5} scale-y={0.5}>
      <Html transform>
        <Button
          variant="contained"
          color="default"
          className={classes.button}
          startIcon={<PlayCircleFilledIcon />}
          onClick={play}
        >
          Play
        </Button>
      </Html>
    </group>
  );
};

export default ManualPlayButton;
