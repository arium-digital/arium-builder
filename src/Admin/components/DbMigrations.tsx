import { useState, useCallback } from "react";

import { useStyles } from "../../shared/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";

import "firebase/functions";
import Button from "@material-ui/core/Button";
import * as Text from "../../Editor/components/VisualElements/Text";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import {
  migrateAndApplyDefaultsToPlacards,
  migrateImages,
  migrateVideos,
  migrateNfts,
  migrateTheme,
} from "defaultConfigs/conversions";

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const MigrationButtons = () => {
  const [migrating, setIsMigrating] = useState(false);

  const [completedMigration, setCompletedMigration] = useState<string | null>(
    null
  );

  const migrate = useCallback(
    async (migration: () => Promise<void>, name: string) => {
      if (migrating) return;

      // const existingSpaceOwner = await getSpaceOwner(spaceId);
      setCompletedMigration(null);
      setIsMigrating(true);

      await migration();

      setCompletedMigration(name);
      setIsMigrating(false);
    },
    [migrating]
  );

  return (
    <Grid container>
      <Grid item xs={6}>
        <Button
          type="submit"
          size="large"
          variant="contained"
          color="primary"
          onClick={() =>
            migrate(
              migrateAndApplyDefaultsToPlacards,
              "Applied defaults to placards"
            )
          }
          disabled={migrating}
        >
          {"Apply Defaults to Placards"}
        </Button>
        <Button
          type="submit"
          size="large"
          variant="contained"
          color="primary"
          onClick={() => migrate(migrateImages, "Migrated images")}
          disabled={migrating}
        >
          {"Migrate Images"}
        </Button>
        <Button
          type="submit"
          size="large"
          variant="contained"
          color="primary"
          onClick={() => migrate(migrateVideos, "Migrated videos")}
          disabled={migrating}
        >
          {"Migrate Videos"}
        </Button>
        <Button
          type="submit"
          size="large"
          variant="contained"
          color="primary"
          onClick={() => migrate(migrateNfts, "Migrated nfts")}
          disabled={migrating}
        >
          {"Migrate Nfts"}
        </Button>
        <Button
          type="submit"
          size="large"
          variant="contained"
          color="primary"
          onClick={() => migrate(migrateTheme, "Migrated theme")}
          disabled={migrating}
        >
          {"Migrate Theme"}
        </Button>
      </Grid>
      <Snackbar
        open={!!completedMigration}
        autoHideDuration={6000}
        onClose={() => setCompletedMigration(null)}
      >
        <Alert onClose={() => setCompletedMigration(null)} severity="success">
          {completedMigration} migration completed
        </Alert>
      </Snackbar>
    </Grid>
  );
};

const DbMigrations = () => {
  const classes = useStyles();

  return (
    <>
      <Grid container>
        <Grid item xs={12} lg={8}>
          <Paper className={classes.paper}>
            <Text.SectionHeader>{`Database Migrations`}</Text.SectionHeader>
          </Paper>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={6} lg={2}>
          <Paper className={classes.paper}>
            <MigrationButtons />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default DbMigrations;
