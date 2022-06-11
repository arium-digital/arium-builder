import { Divider, Grid, useMediaQuery } from "@material-ui/core";
import { CSSProperties } from "@material-ui/styles";
import { useComponentId } from "hooks/useComponentId";
import React from "react";
import styles from "./styles.module.scss";
import { OptionalWidthHeight } from "./types";
export const DivGrow = () => <div className={styles.grow} />;

export const CustomDivider = ({
  mobileOnly,
  desktopOnly,
}: {
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}) => {
  const isSmallScreen = useIsSmallScreen();

  if (mobileOnly && !isSmallScreen) return null;
  if (desktopOnly && isSmallScreen) return null;
  return (
    <Divider
      className={isSmallScreen ? styles.mobileDivider : styles.desktopDivider}
    />
  );
};
export const IconBetaSignUp = ({ color }: { color?: string }) => (
  <div className={styles.theArrow}>
    <svg width="37" height="22" viewBox="-2 -2 39 24" fill="none">
      <path
        d="M36.606 15.8921H26.0393C23.7624 15.8921 21.0537 12.1607 18.186 8.21014C15.5556 4.5865 12.8356 0.839428 10.944 0.839428H0.377381C0.168991 0.839428 0 0.670913 0 0.46311C0 0.255307 0.168991 0.086792 0.377381 0.086792H10.944C13.221 0.086792 15.9297 3.81828 18.7974 7.7688C21.4278 11.3925 24.1478 15.1395 26.0393 15.1395H36.606C36.8144 15.1395 36.9833 15.308 36.9833 15.5158C36.9833 15.7237 36.8144 15.8921 36.606 15.8921Z"
        fill={color || "#303030"}
      />
      <path
        d="M30.5678 21.9133C30.4713 21.9133 30.3746 21.8765 30.301 21.803C30.1536 21.6561 30.1536 21.4178 30.301 21.2709L36.0722 15.5159L30.301 9.76091C30.1536 9.61392 30.1536 9.37563 30.301 9.22872C30.4482 9.0818 30.6873 9.0818 30.8346 9.22872L36.8727 15.2498C37.0201 15.3967 37.0201 15.635 36.8727 15.7819L30.8346 21.803C30.761 21.8765 30.6643 21.9133 30.5678 21.9133Z"
        fill={color || "#303030"}
      />
    </svg>
  </div>
);

export const AriumCTAIcon = IconBetaSignUp;

export const Centered = ({ children }: { children: React.ReactChild }) => (
  <Grid
    className={styles.atLeastFullSize}
    container
    justify="center"
    alignItems="center"
  >
    <Grid item xs={12} style={{ textAlign: "center" }}>
      {children}
    </Grid>
  </Grid>
);
export const Pagination = ({
  backgroundColor,
  length,
  current,
  onChangeIndex,
  color,
}: {
  length: number;
  current: number;
  onChangeIndex?: (index: number) => void;
} & Pick<CSSProperties, "backgroundColor" | "color">) => {
  return (
    <div className={styles.pagination} style={{ backgroundColor }}>
      {[...Array(length)].map((val, i) => (
        <a
          style={{ color }}
          key={i}
          onClick={() => (onChangeIndex ? onChangeIndex(i) : undefined)}
        >
          {i === current ? " ● " : " ○ "}
        </a>
      ))}
    </div>
  );
};

export const CurvyDivider = () => {
  return (
    <Grid container justify="center">
      <Grid item>
        <svg width="100%" height="100%" viewBox="0 0 592 28" fill="none">
          <path
            d="M1 14C42.2227 4.18989 157.028 -9.54425 286.467 14C415.907 37.5443 543.422 23.8101 591 14"
            stroke="#F4501B"
            strokeWidth="2"
          />
        </svg>
      </Grid>
    </Grid>
  );
};

export const PlaceHolderMedia = ({ width, height }: OptionalWidthHeight) => {
  const myId = useComponentId();
  return (
    <img
      style={{
        width: width ? width : "100%",
        height: height ? height : "100%",
        objectFit: "cover",
      }}
      src={`https://placeimg.com/640/480/animals/${myId}`}
      alt="placeholder"
    />
  );
};

export const useIsSmallScreen = () => useMediaQuery("(max-width:767px)");

export const SectionContainer = ({
  children,
}: {
  children: React.ReactChild;
}) => {
  return (
    <div className={styles.sectionContainer}>
      <div>{children}</div>
    </div>
  );
};

export const getImgSrcAndSet = (
  assetName:
    | "actNatural"
    | "marble-theater"
    | "asItWasMeantToBeSeen"
    | "smoothSimpleSharing"
    | "weAreReady"
    | "formImg",
  ext: "jpg" | "png" = "png"
): {
  imgSrc: string;
  imgSrcSet: string;
} => {
  const imgSrcBase = `https://assets.vlts.pw/public/marketing-site-assets/${assetName}`;
  const imgSrc = `${imgSrcBase}/1x.${ext}`;
  const imgSrcSet = `
${imgSrcBase}/1x.${ext} 1x,
${imgSrcBase}/2x.${ext} 2x
`;
  return { imgSrc, imgSrcSet };
};
