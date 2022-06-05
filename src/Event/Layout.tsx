import { Container, CssBaseline, ThemeProvider } from "@material-ui/core";
import React from "react";
import { theme } from "./theme";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container disableGutters maxWidth={false}>
          <main>{children}</main>
        </Container>
      </ThemeProvider>
    </>
  );
};
