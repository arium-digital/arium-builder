import { SvgIcon, SvgIconProps } from "@material-ui/core";
import { AriumIconProps } from "./types";

export const AriumCloseIcon = ({ color }: AriumIconProps) => {
  return (
    <svg width="25" height="24" viewBox="0 0 25 24" fill="none">
      <line
        x1="24.1768"
        y1="0.176777"
        x2="1.17678"
        y2="23.1768"
        stroke={color ? color : "#303030"}
        strokeWidth="0.5"
      />
      <line
        y1="-0.25"
        x2="32.5269"
        y2="-0.25"
        transform="matrix(0.707107 0.707107 0.707107 -0.707107 1 0)"
        stroke={color ? color : "#303030"}
        strokeWidth="0.5"
      />
    </svg>
  );
};

export const AriumMenuIcon = ({ color }: AriumIconProps) => {
  return (
    <svg width="37" height="7" viewBox="0 0 37 7" fill="none">
      <line
        x1="37"
        y1="0.25"
        x2="2.18557e-08"
        y2="0.250003"
        stroke={color ? color : "#303030"}
        strokeWidth="0.5"
      />
      <line
        x1="37"
        y1="6.25"
        x2="2.18557e-08"
        y2="6.25"
        stroke={color ? color : "#303030"}
        strokeWidth="0.5"
      />
    </svg>
  );
};

export const GalleryTalkIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <g>
        <path
          d="M0 20H0.47619H2.85714H3.33333V19.5238C3.33333 18.4662 4.18054 17.619 5.2381 17.619C6.29574 17.619 7.14286 18.4662 7.14286 19.5238V20H7.61905H10H10.4762V19.5238L10.4762 0.476191V0H10H7.61905H7.14286V0.476191C7.14286 1.53378 6.29574 2.38095 5.2381 2.38095C4.18054 2.38095 3.33333 1.53378 3.33333 0.476191V0H2.85714H0.47619H0L0 0.476191L0 19.5238L0 20ZM0.952381 19.0476L0.952381 6.19048H9.52381V19.0476H7.99853C7.76267 17.7093 6.64176 16.6667 5.2381 16.6667C3.8347 16.6667 2.7138 17.7096 2.47768 19.0476H0.952381ZM0.952381 5.2381L0.952381 0.952381H2.47768C2.7138 2.29041 3.8347 3.33333 5.2381 3.33333C6.64176 3.33333 7.76267 2.29071 7.99853 0.952381H9.52381L9.52381 5.2381H0.952381ZM1.90476 11.4286L4.12202 12.3214L4.27083 14.7619L5.78869 12.8795L8.09524 13.4896L6.81548 11.4286L8.09524 9.36757L5.78869 9.97767L4.27083 8.09524L4.12202 10.5357L1.90476 11.4286Z"
          fill="#303030"
        />
      </g>
    </SvgIcon>
  );
};

export const OpenLinkIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M9.354 5.284c-.068.068-.111.163-.111.267 0 .208.168.377.376.376l8.15-.011-.011 8.15c0 .208.168.377.376.376a.38.38 0 0 0 .377-.377l.012-8.527c0-.208-.168-.377-.376-.376l-8.527.012c-.104 0-.198.042-.267.111z" />
    <path
      fillRule="evenodd"
      d="M18.447 5.282a.4.4 0 0 1 0 .566L6.284 18.01a.4.4 0 1 1-.566-.566L17.881 5.282a.4.4 0 0 1 .566 0z"
    />
  </SvgIcon>
);
