import { Tooltip, Typography } from "@material-ui/core";
import { HelpOutlined } from "@material-ui/icons";
import { FC } from "react";

const iconStyle = {
  fontSize: "0.8em",
  color: "#cbcbcb",
};

const LabelWithTooltip: FC<{
  label: string;
  toolTip?: string;
}> = ({ label, toolTip }) => (
  <Typography id="continuous-slider">
    {toolTip ? (
      <Tooltip title={toolTip} arrow placement="right">
        <label>
          {label} <HelpOutlined style={iconStyle} />{" "}
        </label>
      </Tooltip>
    ) : (
      <label> {label} </label>
    )}
  </Typography>
);

export default LabelWithTooltip;
