import { useMemo, useState, useCallback, useEffect } from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";

import { useStyles } from "../../shared/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { store } from "../../db";

import "firebase/functions";
import Button from "@material-ui/core/Button";
import * as Text from "../../Editor/components/VisualElements/Text";
import * as FormField from "../../Editor/components/Form";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import { functions } from "db";
import { Space } from "../../../shared/sharedTypes";

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const createSpace = async ({
  existingSpaceId,
  newSpaceSlug,
  ownerId,
}: {
  existingSpaceId: string;
  newSpaceSlug: string;
  ownerId?: string;
}) => {
  console.log("calling create space with", {
    slug: newSpaceSlug,
    templateId: existingSpaceId,
    ownerId,
  });
  await functions().httpsCallable("createSpaceV2")({
    slug: newSpaceSlug,
    templateId: existingSpaceId,
    ownerId,
  });
  // await store.collection("spaces").doc(newSpaceId).set(space);

  return newSpaceSlug;
};

const getSpaceOwner = async (spaceId: string) => {
  const spaceDoc = await store.collection("spaces").doc(spaceId).get();

  const space = spaceDoc.data() as { ownerId?: string };

  return space.ownerId;
};

const DuplicateSpaceForm = ({
  spaceId,
  slug,
}: {
  spaceId: string;
  slug: string;
}) => {
  const [duplicating, isDuplicating] = useState(false);

  const startDuplicating = useCallback(() => {
    setDuplicatedSpaceId(undefined);
    isDuplicating(true);
  }, []);

  const [newSpaceName, setNewSpaceName] = useState<string>();

  const [duplicatedSpaceId, setDuplicatedSpaceId] = useState<string>();

  const duplicate = useCallback(async () => {
    if (!spaceId || !newSpaceName) return;
    setDuplicatedSpaceId(undefined);

    const existingSpaceOwner = await getSpaceOwner(spaceId);

    const newSpaceId = await createSpace({
      existingSpaceId: spaceId,
      newSpaceSlug: newSpaceName,
      ownerId: existingSpaceOwner,
    });

    setDuplicatedSpaceId(newSpaceId);
    isDuplicating(false);
  }, [newSpaceName, spaceId]);

  const clearDuplicatedSpaceId = useCallback(() => {
    setDuplicatedSpaceId(undefined);
  }, []);

  if (!duplicating)
    return (
      <>
        <Button
          type="submit"
          size="large"
          variant="contained"
          color="primary"
          onClick={startDuplicating}
          disabled={duplicating}
        >
          {"Duplicate This Space"}
        </Button>
        <Snackbar
          open={!!duplicatedSpaceId}
          autoHideDuration={6000}
          onClose={clearDuplicatedSpaceId}
        >
          <Alert onClose={clearDuplicatedSpaceId} severity="success">
            {`Space ${slug} duplicated to ${newSpaceName}`}
          </Alert>
        </Snackbar>
      </>
    );

  return (
    <>
      <FormField.FreeText
        label="New Space Name"
        value={newSpaceName}
        setValue={setNewSpaceName}
        size="lg"
      />{" "}
      <Button
        type="submit"
        size="large"
        variant="contained"
        color="primary"
        onClick={duplicate}
        disabled={!newSpaceName || newSpaceName === ""}
      >
        {"Duplicate"}
      </Button>
    </>
  );
};

const SpaceSettings = ({
  spaceId,
  slug,
}: {
  spaceId: string;
  slug: string;
}) => {
  const classes = useStyles();

  return (
    <>
      <Grid container>
        <Grid item xs={7}>
          <Paper className={classes.paper}>
            <Text.ElementHeader>{`Space ${slug}`}</Text.ElementHeader>
          </Paper>
        </Grid>
        <Grid item xs={7}>
          <Paper className={classes.paper}>
            <DuplicateSpaceForm spaceId={spaceId} slug={slug} />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

const SpacesList = ({
  spaceId,
  setSpace,
}: {
  spaceId: string | undefined;
  setSpace: (args: { id: string; slug: string }) => void;
}) => {
  const spacesCollectionRef = useMemo(() => store.collection("spaces"), []);

  const [spaces, setSpaces] = useState<
    {
      id: string;
      slug: string;
    }[]
  >([]);

  useEffect(() => {
    spacesCollectionRef.onSnapshot((snapshot) => {
      const spaces: {
        id: string;
        slug: string;
      }[] = [];

      snapshot.forEach((item) =>
        spaces.push({
          id: item.id,
          slug: (item.data() as Space).slug || item.id,
        })
      );

      setSpaces(spaces);
    });
  }, [spacesCollectionRef]);

  const classes = useStyles();

  return (
    <List className={classes.listRoot}>
      {spaces.map(({ id, slug }) => (
        <ListItem
          selected={id === spaceId}
          onClick={() => setSpace({ id, slug })}
          button
        >
          <ListItemText primary={slug} />
        </ListItem>
      ))}
    </List>
  );
};

const Spaces = () => {
  const classes = useStyles();

  const [space, setSpace] = useState<{ id: string; slug: string }>();

  return (
    <>
      <Grid container>
        <Grid item xs={12} lg={8}>
          <Paper className={classes.paper}>
            <Text.SectionHeader>{`Spaces`}</Text.SectionHeader>
          </Paper>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={6} lg={2}>
          <Paper className={classes.paper}>
            <SpacesList setSpace={setSpace} spaceId={space?.id} />
          </Paper>
        </Grid>
        {space && (
          <Grid item xs={6} lg={10}>
            <SpaceSettings spaceId={space.id} slug={space.slug} />
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default Spaces;
