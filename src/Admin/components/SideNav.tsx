import { useMemo } from "react";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { useStyles } from "../../shared/styles";
import Link from "next/link";
import GroupAddIcon from "@material-ui/icons/GroupAdd";

interface MenuItem {
  title: string;
  icon: any;
  path: string;
}

const SideNav = ({ section }: { section: string }) => {
  const classes = useStyles();

  const menuItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = [
      {
        title: "Invites",
        icon: <GroupAddIcon />,
        path: "invites",
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
            href={`/admin/${path}`}
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
