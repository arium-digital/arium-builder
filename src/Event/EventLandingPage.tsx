import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  TextField,
  Typography,
  Container,
  IconButton,
  GridProps,
  Box,
  Hidden,
  TextFieldProps,
  Menu,
  MenuItem,
} from "@material-ui/core";
import React, { useCallback, useEffect, useMemo, memo } from "react";
import { Footer } from "website/Layout/Footer";
import styles from "css/eventLandingPage.module.scss";
import router from "next/router";
import { useState } from "react";
import { interval } from "rxjs";
import { ArrowForwardRounded, Event } from "@material-ui/icons";
import { EventInfo } from "../../shared/sharedTypes";
import parse from "html-react-parser";
import {
  EventRegistrationState,
  EventRegistrationStatus,
  useEventRegistrationForm,
} from "./useEventRegistrationForm";
import { LoadingLinear } from "Space/Loading";
import { useGetServerTime } from "hooks/useServerTimeOffset";
import { formatDatetime, getDurationDaysHoursMinuesSeconds } from "./utils";
import { AriumLogo } from "website/AriumLogo";
import { useFileDownloadUrl } from "fileUtils";
import { google, outlook, ics, CalendarEvent } from "calendar-link";
import { SpaceRouteKeys } from "Space/SpaceRoute/useSpaceQueryParams";

const EMAIL_SUBMITTED_TITLE = "Thank you,";
const EMAIL_SUBMITTED_BODY = "we'll get back to you with a reminder.";
const EMAIL_SUBMIT_ERROR = "Something went wrong, please try again.";

enum EventStatus {
  scheduled,
  ongoing,
  ended,
}

const RowOf8Cols = ({ children }: GridProps) => (
  <Grid container justify="center">
    <Grid item xs={12} md={10}>
      {children}
    </Grid>
  </Grid>
);
export const FormLayout = ({ form }: { form: React.ReactNode }) => {
  return (
    <Grid item xs={12} md={6} className={styles.eventTimeText}>
      {form}
    </Grid>
  );
};

const AddToCalendar = ({ event }: { event: EventInfo }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [googleCalendarLink, setGoogleCalendarLink] = useState("");
  const [outlookCalendarLink, setOutlookCalendarLink] = useState("");
  const [ICSCalendarLink, setICSCalendarLink] = useState("");

  useEffect(() => {
    const startDate = new Date(event.startTimestamp);

    const eventInfoForCalendarLink = {
      title: event.name,
      description: event.abstract,
      location: `https://arium.xyz/events/${event.slug}`,
      start: startDate.toISOString(),
      duration: [1, "hour"],
    };
    setGoogleCalendarLink(google(eventInfoForCalendarLink as CalendarEvent));
    setOutlookCalendarLink(outlook(eventInfoForCalendarLink as CalendarEvent));
    setICSCalendarLink(ics(eventInfoForCalendarLink as CalendarEvent));
  }, [event]);

  return (
    <>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        className={styles.addToCalendarButton}
      >
        <Typography variant="body1">+ Add to Calendar</Typography>
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        className={styles.addToCalendar}
      >
        <MenuItem
          href={googleCalendarLink}
          target="_blank"
          component="a"
          onClick={handleClose}
        >
          Google
        </MenuItem>
        <MenuItem
          href={outlookCalendarLink}
          target="_blank"
          component="a"
          onClick={handleClose}
        >
          Outlook
        </MenuItem>
        <MenuItem
          href={ICSCalendarLink}
          target="_blank"
          component="a"
          download
          onClick={handleClose}
        >
          Apple
        </MenuItem>
      </Menu>
    </>
  );
};

export const TextFieldWithFormIK = ({
  formik,
  color,
}: {
  formik: any;
} & Pick<TextFieldProps, "color">) => {
  return (
    <>
      <div className={styles.submitEmailContainer}>
        <TextField
          color={color}
          className={styles.textField}
          id="email"
          placeholder="Your email"
          onChange={formik.handleChange}
          value={formik.values.email}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email ? formik.errors.email : ""}
        />
        <IconButton
          type="submit"
          aria-label="enter"
          className={styles.buttonSubmitEmail}
        >
          <ArrowForwardRounded />
        </IconButton>
      </div>
    </>
  );
};
export const EmailRegistration = ({
  event,
  eventStatus,
  onSubmitEmail,
}: {
  event: EventInfo;
  eventStatus: EventStatus;
  onSubmitEmail?: (state: EventRegistrationState) => void;
}) => {
  const [checked, setChecked] = useState(false);
  const handleCheck = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
  }, []);

  const { formik, status } = useEventRegistrationForm(
    event.slug,
    checked || eventStatus !== EventStatus.scheduled,
    eventStatus === EventStatus.scheduled,
    onSubmitEmail
  );

  if (status === EventRegistrationStatus.saving)
    return <LoadingLinear height="160px" />;
  if (status === EventRegistrationStatus.error)
    return (
      <Typography variant="h3" align="center">
        {EMAIL_SUBMIT_ERROR}
      </Typography>
    );
  if (status === EventRegistrationStatus.saved)
    return (
      <>
        <Typography variant="h3" align="center">
          {EMAIL_SUBMITTED_TITLE}
        </Typography>
        <Typography variant="body1" align="center">
          {EMAIL_SUBMITTED_BODY}
        </Typography>
      </>
    );

  const started = eventStatus !== EventStatus.scheduled;
  return (
    <>
      {started ? (
        // get similar events
        <FormLayout
          form={
            <form onSubmit={formik.handleSubmit}>
              <FormGroup>
                <Typography>Get notified about events on Arium:</Typography>
                <TextFieldWithFormIK formik={formik} />
              </FormGroup>
            </form>
          }
        />
      ) : (
        // get reminder
        <FormLayout
          form={
            <form onSubmit={formik.handleSubmit}>
              <FormGroup>
                <Typography>Get a reminder about this event:</Typography>
                <TextFieldWithFormIK formik={formik} />
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={handleCheck}
                      checked={checked}
                      name="keepInTheLoop"
                      color="primary"
                    />
                  }
                  label="Keep me in the loop about upcoming events on Arium"
                />
              </FormGroup>
            </form>
          }
        />
      )}
    </>
  );
};

const countDownKeys = ["DAYS", "HOURS", "MINUTES", "SECONDS"];
export const CountDown = ({
  date,
  onCountDownEnd,
}: {
  date: Date;
  onCountDownEnd?: () => void;
}) => {
  const [countDown, setCountDown] = useState<(number | string)[]>([
    "...",
    "...",
    "...",
    "...",
  ]);

  const getServerTime = useGetServerTime();

  const updateCountDown = useCallback(() => {
    const delta = date.getTime() - getServerTime();
    if (delta < 0) {
      onCountDownEnd && onCountDownEnd();
      return;
    }
    setCountDown(getDurationDaysHoursMinuesSeconds(delta));
  }, [date, getServerTime, onCountDownEnd]);

  useEffect(() => {
    const sub = interval(1000).subscribe(updateCountDown);
    return () => {
      sub.unsubscribe();
    };
  }, [updateCountDown]);

  return (
    <Grid container alignItems="center">
      {countDownKeys.map((key, i) => (
        <Grid key={key} item xs={3}>
          <Typography variant="h3">{countDown[i]}</Typography>
          {key}
        </Grid>
      ))}
    </Grid>
  );
};

const Abstract = memo(({ text }: { text: string }) => (
  <Typography variant="body1" className={styles.abstract}>
    {parse(text)}
  </Typography>
));

export const EventLandingPage = ({ event }: { event: EventInfo }) => {
  const [startDate, endDate] = useMemo(
    () => [new Date(event.startTimestamp), new Date(event.endTimestamp)],
    [event.endTimestamp, event.startTimestamp]
  );

  const getServerTime = useGetServerTime();

  const initialEventStatus = useMemo(() => {
    const now = getServerTime();
    if (now >= endDate.getTime()) return EventStatus.ended;
    else if (now >= startDate.getTime()) return EventStatus.ongoing;
    else return EventStatus.scheduled;
  }, [endDate, getServerTime, startDate]);

  const [eventStatus, setEventStatus] = useState(initialEventStatus);

  const handleCountDownEnd = useCallback(() => {
    setEventStatus(EventStatus.ongoing);
  }, []);
  const [joinedSpace, setJoinedSpace] = useState<boolean | undefined>(
    undefined
  );

  const onSubmitEmail = useCallback((state: EventRegistrationState) => {}, []);

  const handleJoinSpace = useCallback(() => {
    setJoinedSpace(true);
    router.push({
      pathname: `/spaces/${event.spaceId}`,
      query: { [SpaceRouteKeys.eventSlug]: event.slug },
    });
  }, [event.slug, event.spaceId]);

  const coverUrl = useFileDownloadUrl(event.coverImage);
  const started = eventStatus !== EventStatus.scheduled;

  return (
    <>
      <a className={styles.topLogo} href="/">
        <AriumLogo />
      </a>
      <div className={styles.cover}>
        <img src={coverUrl} alt="event cover" />
      </div>
      <Container maxWidth="xl" disableGutters className={styles.mainContainer}>
        <RowOf8Cols>
          <Typography variant="body1" className={styles.eventTypeText}>
            {event.eventType}
          </Typography>
          <Typography variant="h1" className={styles.eventNameText}>
            {event.name}
          </Typography>
          <Typography variant="h3" className={styles.eventHostNameText}>
            By {event.hostName}
          </Typography>
          <Grid container justify="center">
            <Grid item xs={12} md={6} className={styles.eventTimeText}>
              <Grid container justify="center" alignItems="flex-start">
                <Grid item xs={2}>
                  <Event />
                </Grid>

                <Grid item xs={10}>
                  <Grid container justify="center">
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        {formatDatetime(event)}
                      </Typography>
                    </Grid>
                    {!started && (
                      <Grid item xs={12}>
                        <AddToCalendar event={event} />
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <EmailRegistration
              event={event}
              eventStatus={eventStatus}
              onSubmitEmail={onSubmitEmail}
            />
          </Grid>
          <hr />
        </RowOf8Cols>

        <Grid
          container
          alignItems="center"
          justify="center"
          className={styles.ctaContainer}
        >
          {eventStatus === EventStatus.scheduled && (
            <>
              <Grid item xs={12} md={4}>
                <CountDown
                  date={startDate}
                  onCountDownEnd={handleCountDownEnd}
                />
              </Grid>
              <Grid item xs={1}>
                <Box height="48px" />
              </Grid>
            </>
          )}
          <Grid item xs={12} md={eventStatus === EventStatus.scheduled ? 3 : 4}>
            <Button
              disableElevation
              onClick={handleJoinSpace}
              variant="contained"
              color="primary"
              disabled={eventStatus === EventStatus.scheduled || joinedSpace}
              className={styles.fullSize}
            >
              {joinedSpace ? <LoadingLinear height="32px" /> : "Join the space"}
            </Button>
          </Grid>
        </Grid>
        <RowOf8Cols>
          <Hidden mdUp>
            <hr />
          </Hidden>
          <Abstract text={event.abstract} />
        </RowOf8Cols>

        <Footer />
        <br />
        <br />
      </Container>
    </>
  );
};
