import TextFieldsIcon from "@material-ui/icons/TextFields";
import HomeIcon from "@material-ui/icons/Home";
import AppsIcon from "@material-ui/icons/Apps";
import DirectionsRunIcon from "@material-ui/icons/DirectionsRun";
import ImageIcon from "@material-ui/icons/Image";
import WbIncandescentIcon from "@material-ui/icons/WbIncandescent";
import VideocamIcon from "@material-ui/icons/Videocam";
import ScreenShareIcon from "@material-ui/icons/ScreenShare";
import MicIcon from "@material-ui/icons/Mic";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import PhotoFilterIcon from "@material-ui/icons/PhotoFilter";
import SubjectIcon from "@material-ui/icons/Subject";
import FilterHdrIcon from "@material-ui/icons/FilterHdr";
import AlbumIcon from "@material-ui/icons/Album";
import MusicNoteIcon from "@material-ui/icons/MusicNote";
import PoolIcon from "@material-ui/icons/Pool";
import { ElementType } from "spaceTypes";

const ElementIcon = ({
  elementType,
  color,
}: {
  elementType: ElementType;
  color?: string;
}) => {
  if (elementType === "text") return <TextFieldsIcon htmlColor={color} />;

  if (elementType === "model") return <HomeIcon htmlColor={color} />;

  if (elementType === "image") return <ImageIcon htmlColor={color} />;

  if (elementType === "light") return <WbIncandescentIcon htmlColor={color} />;

  if (elementType === "video") return <VideocamIcon htmlColor={color} />;

  if (elementType === "audio") return <MusicNoteIcon htmlColor={color} />;

  if (elementType === "screen share")
    return <ScreenShareIcon htmlColor={color} />;

  if (elementType === "broadcast zone") return <MicIcon htmlColor={color} />;

  if (elementType === "reflector surface")
    return <PhotoFilterIcon htmlColor={color} />;

  if (elementType === "portal") return <DirectionsRunIcon htmlColor={color} />;

  if (elementType === "placard") return <SubjectIcon htmlColor={color} />;
  if (elementType === "terrain") return <FilterHdrIcon htmlColor={color} />;

  if (elementType === "nft") return <AlbumIcon htmlColor={color} />;

  if (elementType === "root") return <AccountTreeIcon htmlColor={color} />;

  if (elementType === "water") return <PoolIcon htmlColor={color} />;

  return <AppsIcon htmlColor={color} />;
};

export default ElementIcon;
