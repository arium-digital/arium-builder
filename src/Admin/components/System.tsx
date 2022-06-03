import { useState, useEffect, ChangeEvent, useCallback } from "react";

import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { communicationDb, store } from "../../db";

import "firebase/functions";
import * as Text from "../../Editor/components/VisualElements/Text";

import { RouterCountShard } from "../../../shared/sharedTypes";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import Typography from "@material-ui/core/Typography";

import { useStyles } from "shared/styles";
import { Observable, combineLatest, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { AggregateCounts, toAggregateCounts } from "./lib/systemAdmin";
import {
  useBehaviorSubjectFromCurrentValue,
  useCurrentValueFromObservable,
} from "hooks/useObservable";
import useActiveSessions from "hooks/useActivePresence";
import useServerTimeOffset from "hooks/useServerTimeOffset";

const observeRouterShards = (group: string) => {
  return new Observable<RouterCountShard[]>((subscribe) => {
    const unsubsribe = store
      .collection("routerGroupSessions")
      .doc(group)
      .collection("routerShards")
      .onSnapshot((snapshot) => {
        const routerShardCounts: RouterCountShard[] = [];
        snapshot.forEach((snapshot) => {
          routerShardCounts.push(snapshot.data() as RouterCountShard);
        });
        subscribe.next(routerShardCounts);
      });
    return () => {
      unsubsribe();
    };
  });
};

const observeConnectedRouters = (group: string) => {
  return new Observable<string[]>((subscribe) => {
    const ref = communicationDb
      .ref(`disconnectedRouters/${group}`)
      .orderByChild("disconnected")
      .equalTo(false);
    ref.on("value", (snapshot) => {
      const result: string[] = [];
      snapshot.forEach((child) => {
        if (child.key) {
          result.push(child.key);
        }
      });
      subscribe.next(result);
    });
    return () => {
      ref.off("value");
    };
  });
};

const empty = new Set<string>();

const ActiveSessions = ({ spaceId }: { spaceId: string }) => {
  const spaceId$ = useBehaviorSubjectFromCurrentValue(spaceId);
  const [sessionId$] = useState(
    new BehaviorSubject<string | undefined>(undefined)
  );

  const serverTimeOffset$ = useServerTimeOffset();
  const activeSessions$ = useActiveSessions({
    spaceId$,
    sessionId$,
    serverTimeOffset$,
  });

  const activeSessions = useCurrentValueFromObservable(activeSessions$, empty);

  return (
    <ul>
      {Array.from(activeSessions.values()).map((sessionId) => (
        <li key={sessionId}>{sessionId}</li>
      ))}
    </ul>
  );
};

const SpaceCount = ({ total, spaceId }: { total: number; spaceId: string }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const expand = useCallback((e: any) => {
    e.preventDefault();

    setExpanded(true);
  }, []);

  if (!total) return null;
  return (
    <li>
      {!expanded && (
        <a onClick={expand} href="#">
          {spaceId}: {total}
        </a>
      )}
      {expanded && `${spaceId}: ${total}`}
      {expanded && <ActiveSessions spaceId={spaceId} />}
    </li>
  );
};

const Clusters = () => {
  const [routerGroups, setRouterGroups] = useState<string[]>([]);

  useEffect(() => {
    store.collection("routerGroups").onSnapshot((snapshot) => {
      const routerGroups: string[] = [];
      snapshot.forEach((routerGroup) => {
        routerGroups.push(routerGroup.id);
      });
      setRouterGroups(routerGroups);
    });
  });

  const classes = useStyles();

  const [group, setGroup] = useState<string | false>(false);

  const handleChange = (panel: string) => (
    event: ChangeEvent<{}>,
    isExpanded: boolean
  ) => {
    setGroup(isExpanded ? panel : false);
  };

  const [aggregateCounts, setAggregateCounts] = useState<
    AggregateCounts | undefined
  >();

  useEffect(() => {
    setAggregateCounts(undefined);
    if (!group) return;

    const routerShards$ = observeRouterShards(group);
    const connectedRouters$ = observeConnectedRouters(group);

    const validRouterShards$ = combineLatest([
      routerShards$,
      connectedRouters$,
    ]).pipe(
      map(([routerShards, connectedRouters]) => {
        return routerShards.filter((shard) =>
          connectedRouters.includes(shard.routerId)
        );
      })
    );
    const aggregateCounts$ = validRouterShards$.pipe(
      map((routerShardCounts) => toAggregateCounts(routerShardCounts))
    );

    const sub = aggregateCounts$.subscribe({
      next: setAggregateCounts,
    });

    return () => {
      sub.unsubscribe();
    };
  }, [group]);

  return (
    <>
      {routerGroups.map((routerGroup) => (
        <Accordion
          expanded={group === routerGroup}
          onChange={handleChange(routerGroup)}
          key={routerGroup}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1c-content"
            id="panel1c-header"
          >
            <div className={classes.column}>
              <Typography className={classes.accordionHeading}>
                {routerGroup}
              </Typography>
            </div>
            {/* <div className={classes.column}>
              <Typography className={classes.accordionSecondaryHeading}>
                {aggregateCounts &&
                  `# routers: ${
                    Object.keys(aggregateCounts.routerCounts).length
                  }`}
              </Typography>
            </div> */}
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            {aggregateCounts && (
              <>
                <div className={classes.column}>
                  Count by router:
                  <ul>
                    {Object.entries(aggregateCounts.routerCounts).map(
                      ([key, value]) => (
                        <li key={key}>
                          {key}: {value.total} Total
                          <ul>
                            {Object.entries(value.bySpace).map(
                              ([spaceId, count]) =>
                                count ? (
                                  <li key={spaceId}>
                                    {spaceId}: {count}
                                  </li>
                                ) : null
                            )}
                          </ul>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className={classes.column}>
                  Count by space:
                  <ul>
                    {Object.entries(aggregateCounts.spaceCounts).map(
                      ([spaceId, count]) => (
                        <SpaceCount
                          key={spaceId}
                          spaceId={spaceId}
                          total={count}
                        />
                      )
                    )}
                  </ul>
                </div>
              </>
            )}
          </AccordionDetails>
          {/* <Divider />
          <AccordionActions>
            <Button size="small">Cancel</Button>
            <Button size="small" color="primary">
              Save
            </Button>
          </AccordionActions> */}
        </Accordion>
      ))}
    </>
  );
};

const System = () => {
  const classes = useStyles();

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Text.SectionHeader>{`System`}</Text.SectionHeader>
          </Paper>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Text.ElementHeader>{"Clusters"}</Text.ElementHeader>
            <Clusters />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default System;
