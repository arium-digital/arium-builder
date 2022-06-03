import { Button, Grid, Typography } from "@material-ui/core";
import { HLSVideo } from "components/Elements/Video/HLSVideo";
import { AriumOrange } from "components/EventRoute/theme";
import React, { useMemo, useState } from "react";
import SwipeableViews from "react-swipeable-views";
import { autoPlay } from "react-swipeable-views-utils";
import { OpenLinkIcon } from "./Icons";
import styles from "./styles.module.scss";
import { OptionalOnClick } from "./types";
import { IconBetaSignUp, SectionContainer, useIsSmallScreen } from "./utils";
const SwipeableViewsWithAutoPlay = autoPlay(SwipeableViews);

const HERO_TEXT_DESKTOP =
  "Arium is Bringing Human Connection to Virtual Exhibitions";
const HERO_TEXT_MOBILE = "Bringing Human Connection to Virtual Exhibitions";
const HERO_BODY_TEXT =
  "Create engaging virtual exhibitions, bring story and context to your artwork and connect with your community in a shared social experience.";
type FeaturedSpace = {
  assetSrc: string;
  assetType: "video/m3u8" | "image";
  name: string;
  host: string;
  url: string;
};

const muxUrl = (playbackId: string) =>
  `https://stream.mux.com/${playbackId}.m3u8`;

const featuredSpacesTable: [string, string, string, string][] = [
  [
    "Hackatao x Christies",
    "Hack of a Bear",
    "Mgxn75Ahqxaxoem02BBGnhaga7w4j9QcBwDn00UWBNXAQ",
    "hack-of-a-bear",
  ],
  [
    "Pupila Dilatada",
    "Pupila Dilatada",
    "FuNZnSww00aAzG22K490237L014EgsJAn01KZfC1Cg1kR3c",
    "pupila-dilatada",
  ],
  [
    "Hackatao x Skygolpe",
    "H(ID)DEN",
    "fj9WWv7ZFs11pDnjnyPKPryLKfAnjLNljAd76MmW8gM",
    "hidden",
  ],
  [
    "Shantell Martin",
    "The Importance of Process",
    "tgoChpYsQOhOTWumr91ExwjRrD9vPXWxze9pZuPH3gU",
    "shantell-martin",
  ],
  [
    "Pupila Dilatada",
    "Templo Digital",
    "gjkqmdLZ5UZFb61Q4UZ8x7eX01fcw027PJjQrEoWUm02HM",
    "templo-digital",
  ],
  [
    "Hackatao x Blondie",
    "Hack the Borders",
    "577ci1yKtdZsWHEOZdSKQB1Bjlm3RMC52kDwYDM8qSo",
    "hack-the-borders",
  ],
];
const featuredSpaces: Array<FeaturedSpace> = featuredSpacesTable.map(
  ([host, name, muxId, spaceId]) => ({
    assetSrc: muxUrl(muxId),
    assetType: "video/m3u8",
    name,
    host,
    url: `https://arium.xyz/spaces/${spaceId}`,
  })
);

const HeroAsset = ({ index }: { index: number }) => {
  const space = featuredSpaces[index];
  return (
    <>
      {/* {space.assetType === "image" && (
        <a href={space.url}>
          <img
            className={styles.heroImg}
            src={space.assetSrc}
            alt={`screenshot of event ${space.name}`}
          />
        </a>
      )} */}
      {space.assetType === "video/m3u8" && (
        <HLSVideo
          disableControl
          muted
          loop
          autoPlay
          playsInline
          src={space.assetSrc}
        />
      )}
    </>
  );
};

const HeroAssets = ({
  index,
  onChangeIndex,
}: {
  index: number;
  onChangeIndex: (index: number) => void;
}) => {
  return (
    <div className={styles.heroAssetContainer}>
      <SwipeableViewsWithAutoPlay
        className={styles.swipeable}
        interval={10000}
        enableMouseEvents
        index={index}
        // value={index}
        onChangeIndex={onChangeIndex}
        containerStyle={{
          height: "100%",
        }}
        slideStyle={{
          overflow: "hidden",
          height: "100%",
        }}
      >
        {featuredSpaces.map((space, i) => (
          <HeroAsset key={i} index={i} />
        ))}
      </SwipeableViewsWithAutoPlay>
      {/* <Box position="absolute" bottom={0} right={0}>
        <Pagination
          current={index}
          length={featuredSpaces.length}
          backgroundColor="#ffffff33"
          color="#ffffff"
          onChangeIndex={onChangeIndex}
        />
      </Box> */}
    </div>
  );
};
const FeaturedSpaceInfo = ({ index }: { index: number }) => {
  const space = useMemo(() => featuredSpaces[index], [index]);
  // const [clicked, setClicked] = useState(false);
  // useClickedVisitFeaturedEventAnalytics(clicked, space);
  return (
    <>
      <Typography variant="body2" color="primary">
        Featured Space
      </Typography>
      <hr />
      <Typography variant="h4" color="primary">
        <a href={space.url}>
          {space.name}
          <span style={{ float: "right" }}>
            <OpenLinkIcon color="primary" />
          </span>
        </a>
      </Typography>

      <Typography variant="body1">{space.host}</Typography>
      <br />
    </>
  );
};

const MobileLayout = ({ onClick }: OptionalOnClick) => {
  const [index, setIndex] = useState(0);
  return (
    <Grid container className={styles.heroContainer}>
      <Grid item xs={12}>
        <Typography variant="h1" className={styles.heroH1}>
          {HERO_TEXT_MOBILE}
        </Typography>
        <Typography variant="body1">{HERO_BODY_TEXT}</Typography>
        <br />
        <br />
        {onClick && (
          <Button size="large" onClick={onClick} color={"primary"}>
            <IconBetaSignUp color={AriumOrange} />
            Sign up for our Beta
          </Button>
        )}
        <br />
      </Grid>
      <hr className={styles.heroMobileDivider} />
      <Grid item xs={12}>
        <FeaturedSpaceInfo index={index} />
      </Grid>
      <Grid item xs={12}>
        <HeroAssets index={index} onChangeIndex={(i) => setIndex(i)} />
      </Grid>
      <Grid item xs={2} />
    </Grid>
  );
};
const DesktopLayout = ({ onClick }: OptionalOnClick) => {
  const [index, setIndex] = useState(0);
  return (
    <Grid container className={styles.heroContainer}>
      <Grid item xs={12}>
        <HeroAssets index={index} onChangeIndex={(i) => setIndex(i)} />
      </Grid>
      <Grid item xs={3}>
        <FeaturedSpaceInfo index={index} />
      </Grid>
      <Grid item xs={2} />
      <Grid item xs={7}>
        <Typography variant="h1" className={styles.heroH1}>
          {HERO_TEXT_DESKTOP}
        </Typography>
        <Typography variant="body1">{HERO_BODY_TEXT}</Typography>
        <br />
        <br />
        {onClick && (
          <Button size="large" onClick={onClick} color={"primary"}>
            <IconBetaSignUp color={AriumOrange} />
            Sign up for our Beta
          </Button>
        )}
      </Grid>
    </Grid>
  );
};

export const Hero = ({ onClick }: OptionalOnClick) => {
  const isSmallScreen = useIsSmallScreen();

  return (
    <SectionContainer>
      {isSmallScreen ? (
        <MobileLayout onClick={onClick} />
      ) : (
        <DesktopLayout onClick={onClick} />
      )}
    </SectionContainer>
  );
};
