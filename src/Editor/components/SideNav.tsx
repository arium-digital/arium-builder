import { useMemo } from "react";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { useStyles } from "../styles";
import StorageIcon from "@material-ui/icons/Storage";
import TerrainIcon from "@material-ui/icons/Terrain";
import Link from "next/link";
import TuneIcon from "@material-ui/icons/Tune";
import ViewQuiltIcon from "@material-ui/icons/ViewQuilt";
// import { Event } from "@material-ui/icons";

interface MenuItem {
  title: string;
  icon: any;
  path: string;
}

const SideNav = ({
  section,
  spaceSlug,
}: {
  section: string;
  spaceSlug: string;
}) => {
  const classes = useStyles();

  // const { spaceId: space } = useParams<{
  //   spaceId?: string;
  // }>();

  // const adminSectionUrl = useCallback(
  //   (section: string) => `/admin/${space}/${section}`,
  //   [space]
  // );

  // const match = useRouteMatch<{
  //   section: string;
  // }>("/admin/:spaceId/:section");

  // const section = match?.params.section;

  const menuItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = [
      {
        title: "Space Settings",
        icon: <TuneIcon />,
        path: "space-settings",
      },
      {
        title: "Theme",
        icon: <ViewQuiltIcon />,
        path: "theme",
      },
      {
        title: "Environment",
        icon: <TerrainIcon />,
        path: "environment",
      },
      {
        title: "Files",
        icon: <StorageIcon />,
        path: "files",
      },
    ];

    return items;
  }, []);

  // workaround for react particularity:
  // https://github.com/vercel/next.js/issues/3696
  // https://material-ui.com/guides/composition/#caveat-with-refs

  const ButtonLink = ({
    className,
    href,
    children,
  }: {
    className: string;
    href: string;
    children: React.ReactChild;
  }) => (
    <Link href={href}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a className={className}>{children}</a>
    </Link>
  );

  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="left"
    >
      <div className={classes.toolbar} />
      <Divider />
      <List>
        {menuItems.map(({ title, icon, path }) => (
          <ListItem
            button
            key={title}
            ts-ignore
            // @ts-ignore
            component={ButtonLink}
            href={`/editor/${spaceSlug}/${path}`}
            selected={path === section}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={title} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default SideNav;
