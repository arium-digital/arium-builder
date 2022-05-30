import { Container, CssBaseline, ThemeProvider } from "@material-ui/core";
import React from "react";
import { lightTheme } from "website/themes/lightTheme";
import styles from "./styles.module.scss";
import { NavBar } from "website/home/NavBar";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <Container disableGutters maxWidth={false}>
          <main>{children}</main>
        </Container>
      </ThemeProvider>
    </>
  );
};

const Home = () => {
  return (
    <>
      <Layout>
        <Container maxWidth="xl" disableGutters>
          <NavBar />
          <div className={styles.mainContainer}>
            <h1>Welcome to the Metaverse Builder</h1>
          </div>
        </Container>
      </Layout>
    </>
  );
};
export default Home;
