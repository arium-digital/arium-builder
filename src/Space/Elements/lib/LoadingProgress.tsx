import LinearProgress, {
  LinearProgressProps,
} from "@material-ui/core/LinearProgress";
import Box from "@material-ui/core/Box";
import { memo } from "react";
import { createStyles, withStyles } from "@material-ui/styles";
import { ariumBlack, ariumCream, ariumRed } from "css/styleVariables";

const BorderLinearProgress = withStyles(() =>
  createStyles({
    root: {
      height: 15,
      borderRadius: 2,
    },
    colorPrimary: {
      backgroundColor: ariumCream,
    },
    bar: {
      borderRadius: 0,
      backgroundColor: ariumRed,
    },
  })
)(LinearProgress);

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number }
) {
  return (
    <Box display="flex" alignItems="center" style={{ width: "140px" }}>
      <Box width="100%" mt={1} mr={1} style={{ position: "relative" }}>
        <BorderLinearProgress
          variant="determinate"
          {...props}
          color="primary"
        />
        <p
          style={{
            position: "absolute",
            top: -5,
            color: ariumBlack,
            opacity: 1,
            fontSize: 12,
            textAlign: "center",
            width: "100%",
          }}
        >
          {props.value}% loaded
        </p>
      </Box>
    </Box>
  );
}

const LoadingProgress = memo(
  ({ loadedProgress }: { loadedProgress: number }) => {
    const progressValue = Math.round(loadedProgress * 100);
    return <LinearProgressWithLabel value={progressValue} color="primary" />;
    // return <NonTransformedHtml>{loadedProgress}</NonTransformedHtml>;
  }
);

export default LoadingProgress;
