import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
type Placement =
  | "auto-start"
  | "auto"
  | "auto-end"
  | "top-start"
  | "top"
  | "top-end"
  | "right-start"
  | "right"
  | "right-end"
  | "bottom-end"
  | "bottom"
  | "bottom-start"
  | "left-end"
  | "left"
  | "left-start";

const SimpleTextTooltip = ({
  children,
  text,
  placement = "bottom",
}: {
  children: React.ReactElement;
  text: string;
  placement?: Placement;
}) => (
  <OverlayTrigger
    placement={placement}
    overlay={<Tooltip id="tooltip">{text}</Tooltip>}
  >
    {children}
  </OverlayTrigger>
);
export default SimpleTextTooltip;
