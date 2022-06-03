import React, { useEffect, useMemo, useState } from "react";
import * as Text from "../VisualElements/Text";
import Grid from "@material-ui/core/Grid";
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from "@material-ui/core";
import { HasSpaceId } from "components/InSpaceEditor/types";
import { EventInfo } from "../../../../shared/sharedTypes";
import { store } from "db";
import { useFileDownloadUrl } from "fileUtils";

export const EventCard = ({ event }: { event: EventInfo }) => {
  const coverImageUrl = useFileDownloadUrl(event.coverImage);
  return (
    <Card>
      <CardActionArea>
        <CardMedia image={coverImageUrl} title={`${event.name} cover`} />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {event.name}
          </Typography>
          <Typography
            noWrap
            variant="body2"
            color="textSecondary"
            component="p"
          >
            {event.abstract}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" color="primary">
          detail
        </Button>
        <Button size="small" color="primary">
          edit
        </Button>
      </CardActions>
    </Card>
  );
};

const useSpaceEvents = (spaceId: string): EventInfo[] => {
  const [events, setEvents] = useState<EventInfo[]>([]);
  const abortController = useMemo(() => new AbortController(), []);
  useEffect(() => {
    store
      .collection("events")
      .where("spaceId", "==", spaceId)
      .get()
      .then((data) => {
        const results: EventInfo[] = [];
        for (const doc of data.docs) {
          results.push(doc.data() as EventInfo);
        }

        setEvents(results);
      });
    return () => {
      abortController.abort();
    };
  }, [abortController, spaceId]);

  return events;
};
export const EventsList = ({ spaceId }: HasSpaceId) => {
  const events = useSpaceEvents(spaceId);

  return (
    <Grid container alignItems="stretch">
      {events.map((event, i) => (
        <Grid key={i} item xs={12} md={6} lg={4}>
          <EventCard event={event} />
        </Grid>
      ))}
    </Grid>
  );
};

export const EventsWIP = ({ spaceId }: { spaceId: string }) => {
  return (
    <>
      <Text.SectionHeader>{`Events`}</Text.SectionHeader>
      <EventsList spaceId={spaceId} />
    </>
  );
};

export default EventsWIP;
