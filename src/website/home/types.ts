import { ButtonProps } from "@material-ui/core";
import { CSSProperties } from "react";

export type OptionalWidthHeight = Pick<CSSProperties, "height" | "width">;
export type HasHeight = Required<Pick<CSSProperties, "height">>;
export type HasWidth = Required<Pick<CSSProperties, "width">>;
export type OptionalOnClick = Pick<ButtonProps, "onClick">;

export type AriumIconProps = {
  color?: string;
};
