import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";

const CopyPopover = ({
  open,
  handleClose,
  anchorEl,
}: {
  open: boolean;
  handleClose: () => void;
  anchorEl: HTMLElement | null;
}) => {
  return (
    <Popover
      id={"copied popover"}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      style={{
        padding: "15px !important",
      }}
    >
      <Typography>Link copied to clipboard.</Typography>
    </Popover>
  );
};

export default CopyPopover;
