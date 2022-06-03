import { Box, BoxProps, Grid, LinearProgress } from "@material-ui/core";
import React from "react";

export const LoadingLinear = ({
  width = "100%",
  height,
}: Pick<BoxProps, "width" | "height">) => {
  return (
    <Box height={height} width={width}>
      <Grid
        container
        justify="center"
        alignItems="center"
        style={{ height: "100%", width: "100%" }}
      >
        <Grid item xs={10} md={6} lg={4}>
          <LinearProgress color="primary" />
        </Grid>
      </Grid>
    </Box>
  );
};
