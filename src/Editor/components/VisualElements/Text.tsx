import React, { ReactChild } from "react";
import Typography from "@material-ui/core/Typography";
import FormHelperText from "@material-ui/core/FormHelperText";
import { useStyles } from "Editor/styles";

export const SectionHeader = ({ children }: { children: ReactChild }) => {
  return <Typography variant="h4">{children}</Typography>;
};

export const ElementHeader = ({ children }: { children: ReactChild }) => {
  const classes = useStyles();
  return (
    <Typography variant="h5" className={classes.paperHeader}>
      {children}
    </Typography>
  );
};

export const SubElementHeader = ({ children }: { children: ReactChild }) => {
  const classes = useStyles();
  return (
    <Typography variant="h6" className={classes.paperHeader}>
      {children}
    </Typography>
  );
};

export const FormLabel = ({ children }: { children: ReactChild }) => {
  return <Typography variant="h6">{children}</Typography>;
};

export const ElementHelperText = ({
  children,
}: {
  children: ReactChild | ReactChild[];
}) => <FormHelperText>{children}</FormHelperText>;
