import { Container, CssBaseline, ThemeProvider } from "@material-ui/core";
import React from "react";
import { NavBar } from "./NavBar";
import { lightTheme } from "../../themes/lightTheme";
import styles from "./styles.module.scss";
// import { ActNatural } from "./ActNatural";
import { CurrentExhibitions } from "./CurrentExhibitions";
// import { SmoothSimpleSharing } from "./SmoothSimpleSharing";
// import { HostYourOwn } from "./HostYourOwn";
import { useBoolStateAndSetters } from "hooks/useBoolStateAndSetters";
import { FormModal } from "./FormModal";
import { Hero } from "./Hero";
// import { ArtInContext } from "./ArtInContext";
// import { AsItWasMeantToBeSeen } from "./AsItWasMeantToBeSeen";
import { Footer } from "components/EventRoute/Footer";
import { CustomDivider } from "./utils";
import { useInitAnalyticsAndIdentify } from "analytics/init";
import { useLandingPageAnalytics } from "./useLandingPageAnalytics";
import { GetAReminder } from "./GetAReminder";
import { FeaturedExperiencesResult } from "../../../../shared/sharedTypes";
import { useAuthentication } from "hooks/auth/useAuthentication";
import { ActNatural } from "./ActNatural";
import { ArtInContext } from "./ArtInContext";
import { AsItWasMeantToBeSeen } from "./AsItWasMeantToBeSeen";
import { SmoothSimpleSharing } from "./SmoothSimpleSharing";

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

const MarketingSite = ({
  featuredExperiences,
}: {
  featuredExperiences: FeaturedExperiencesResult;
}) => {
  const [openModal, handleOpenModal, handleCloseModal] = useBoolStateAndSetters(
    false
  );

  const { userId, isAnonymous, isNewUser } = useAuthentication({
    ensureSignedInAnonymously: false,
  });

  useInitAnalyticsAndIdentify({ userId, isAnonymous, isNewUser });
  useLandingPageAnalytics();

  return (
    <>
      <Layout>
        <Container maxWidth="xl" disableGutters>
          <NavBar onClickBetaSignUp={handleOpenModal} />
          <FormModal
            open={openModal}
            onClose={handleCloseModal}
            handleClose={handleCloseModal}
          />
          <div className={styles.mainContainer}>
            <Hero onClick={handleOpenModal} />
            <CustomDivider />
            <CurrentExhibitions featuredExperiences={featuredExperiences} />
            <CustomDivider />
            <ActNatural />
            <CustomDivider mobileOnly />
            <ArtInContext />
            <CustomDivider mobileOnly />
            <AsItWasMeantToBeSeen />
            <CustomDivider mobileOnly />
            <SmoothSimpleSharing />
            <CustomDivider desktopOnly />
            <GetAReminder />
            {/* <HostYourOwn /> */}
            <Container
              maxWidth="lg"
              disableGutters
              className={styles.footerContainer}
            >
              <br />
              <br />
              <br />
              <br />
              <Footer lightTheme />
              <br />
              <br />
              <br />
            </Container>
          </div>
        </Container>
      </Layout>
    </>
  );
};
export default MarketingSite;
