import Grid from "@material-ui/core/Grid/Grid";
import { useCallback, useState } from "react";
import React from "react";
import { AppBar, BoxProps, Tab, Tabs } from "@material-ui/core";
import styles from "./styles.module.scss";
import { Box, LinearProgress } from "@material-ui/core";

export const Centered = ({ children, ...otherProps }: BoxProps) => {
  return (
    <Box {...otherProps}>
      <Grid
        container
        className={styles.fullSize}
        justify="center"
        alignItems="center"
      >
        <Grid item>{children}</Grid>
      </Grid>
    </Box>
  );
};

export const ProgressBar = ({ value }: { value: number }) => {
  return (
    <Grid
      container
      style={{ height: "160px" }}
      justify="center"
      alignItems="center"
    >
      <Grid item>
        <Box width="200px" height="4px">
          <LinearProgress variant="determinate" value={value} />
        </Box>
      </Grid>
    </Grid>
  );
};

export const SimplifiedFormBase = ({
  children,
  tabLabels,
  refresh,
}: {
  tabLabels: string[];
  children: React.ReactNode[];
  refresh?: boolean;
}) => {
  const [tab, setTab] = useState(0);

  const handleChange = useCallback(
    (_event: React.ChangeEvent<{}>, newValue: number) => setTab(newValue),
    []
  );
  return (
    <>
      <Grid container className={styles.formBaseContents}>
        <AppBar position="static">
          <Tabs
            value={tab}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="toggle content view and design view"
          >
            {tabLabels.map((label, i) => (
              <Tab
                key={i}
                disableRipple={true}
                label={label}
                selected={tab === i}
              />
            ))}
          </Tabs>
        </AppBar>
        {refresh ? <></> : children[tab]}
      </Grid>
    </>
  );
};
