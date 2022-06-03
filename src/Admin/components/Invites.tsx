import { useState, useCallback, useEffect, useMemo } from "react";

import { useStyles } from "../../shared/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { firestoreTimeNow, store } from "../../db";
import { BetaSignUp, Invite } from "../../../shared/sharedTypes";

import {
  DataGrid,
  ColDef,
  ValueFormatterParams,
  CellParams,
} from "@material-ui/data-grid";

import "firebase/functions";
import Button from "@material-ui/core/Button";
import * as Text from "../../Editor/components/VisualElements/Text";
import * as FormField from "../../Editor/components/Form";
import { Timestamp } from "@google-cloud/firestore";
import Alert from "@material-ui/lab/Alert";
import useTimedAlert, { OpenAlert } from "hooks/useTimedAlert";
import renderCellExpand from "./lib/renderCellExpand";

const inviteCols = ({
  copyToClipboard,
}: {
  copyToClipboard: (e: any) => void;
}): ColDef[] => [
  {
    field: "email",
    headerName: "email",
    width: 200,
  },
  {
    field: "name",
    headerName: "First Name",
    width: 100,
  },
  {
    field: "createdTime",
    headerName: "Invited On",
    width: 150,
    valueFormatter: (params: ValueFormatterParams) =>
      (params.value as Timestamp)?.toDate().toLocaleDateString(),
  },
  {
    field: "opened",
    headerName: "opened",
    width: 75,
  },
  {
    field: "used",
    headerName: "used",
    width: 75,
  },
  {
    field: "inviteUrl",
    headerName: "url",
    width: 150,
    renderCell: (params: CellParams) => {
      if (!params.value) return <></>;
      return (
        <a
          href={params.value as string}
          target="blank"
          onClick={copyToClipboard}
        >
          {params.value}
        </a>
      );
    },
  },
];

const InvitesList = ({ openAlert }: { openAlert: OpenAlert }) => {
  const [invites, setInvites] = useState<({ id: string } & Invite)[]>([]);
  useEffect(() => {
    const unsub = store
      .collection("invites")
      .orderBy("createdTime", "desc")
      .onSnapshot((snapshot) => {
        // console.log("num invitews", snapshot.size);
        const invites: ({ id: string } & Invite)[] = [];
        snapshot.forEach((doc) => {
          const invite = doc.data() as Invite;

          invites.push({
            ...invite,
            id: doc.id,
          });
        });

        setInvites(invites);
      });

    return () => {
      unsub();
    };
  }, []);

  const copyToClipboard = useCallback(
    (e: any) => {
      e.preventDefault();

      navigator.clipboard.writeText(e.target.href);

      openAlert({
        severity: "success",
        message: "Invite link copied to clipboard",
      });
    },
    [openAlert]
  );

  const cols = useMemo(() => inviteCols({ copyToClipboard }), [
    copyToClipboard,
  ]);

  const classes = useStyles();

  return (
    <DataGrid
      className={classes.dataGrid}
      autoHeight
      rows={invites}
      columns={cols}
      hideFooter={true}
    />
  );
};

const getInviteWithEmail = async (email: string) => {
  const existing = await store
    .collection("invites")
    .where("email", "==", email)
    .get();

  if (existing.size > 0) {
    return existing.docs[0].id;
  }

  return null;
};

const createInvite = async ({
  email,
  name,
}: {
  email: string | null | undefined;
  name: string | null;
}) => {
  const asLowerCase = email?.toLowerCase();

  const existingInviteId = asLowerCase
    ? await getInviteWithEmail(asLowerCase)
    : false;

  if (existingInviteId) {
    return {
      status: "alreadyExists",
      existingInviteId,
    };
  }

  const invite: Invite = {
    email: asLowerCase || null,
    name,
    createdTime: firestoreTimeNow(),
    opened: false,
    used: false,
    sentTimes: [],
  };

  const createdInvite = await store.collection("invites").add(invite);

  return {
    status: "created",
    id: createdInvite.id,
  };
};

const CreateInviteForm = ({ openAlert }: { openAlert: OpenAlert }) => {
  const [email, setEmail] = useState<string>();
  const [firstName, setFirstName] = useState<string>();
  const classes = useStyles();

  const [inviting, setInviting] = useState(false);

  const invite = useCallback(
    async (dontRequireEmail = false) => {
      console.log("invite cb");
      setInviting(true);
      if (email || dontRequireEmail) {
        const result = await createInvite({ email, name: firstName || null });
        const status = result.status;

        if (status === "created") {
          setEmail(undefined);
          setFirstName(undefined);
        }

        if (status === "created") {
          openAlert({
            severity: "success",
            message: "Invite successfully created",
          });
        } else if (status === "alreadyExists")
          openAlert({
            severity: "error",
            message:
              "Invite already send to a user with that email, so cannot send anothe invite",
          });
      }

      setInviting(false);
    },
    [email, firstName, openAlert]
  );

  const createInviteWithoutEmail = useCallback(() => {
    invite(true);
  }, [invite]);

  return (
    <>
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <Text.ElementHeader>{`Send an Invite to a New User`}</Text.ElementHeader>
          <div className={classes.formRow}>
            <FormField.FreeText
              value={email}
              setValue={setEmail}
              label="Email Address"
              size="lg"
            />
          </div>
          <div className={classes.formRow}>
            <FormField.FreeText
              value={firstName}
              setValue={setFirstName}
              label="First Name"
              size="lg"
            />
          </div>
          <Button
            type="submit"
            size="large"
            variant="contained"
            color="primary"
            onClick={invite}
            disabled={inviting}
          >
            Send Invite
          </Button>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          <Text.ElementHeader>{`Create an Invite`}</Text.ElementHeader>
          <Button
            type="submit"
            size="large"
            variant="contained"
            color="primary"
            onClick={createInviteWithoutEmail}
            disabled={inviting}
          >
            Create Invite
          </Button>
        </Paper>
      </Grid>
    </>
  );
};

const betaSignupsCols = (
  sendInvite: (betaSignUpId: string) => void,
  deleteInvite: (BetaSignUpId: string) => void
): ColDef[] => [
  {
    field: "emailAddress",
    headerName: "emailAddress",
    renderCell: renderCellExpand,
    width: 150,
  },
  {
    field: "name",
    headerName: "name",
    width: 150,
    renderCell: renderCellExpand,
  },
  {
    field: "eventDescription",
    headerName: "Reason",
    width: 200,
    renderCell: renderCellExpand,
  },
  {
    field: "signUpTime",
    headerName: "Signed Up On",
    width: 150,
    valueFormatter: (params: ValueFormatterParams) =>
      (params.value as Timestamp).toDate().toLocaleDateString(),
  },
  {
    field: "invitedOn",
    headerName: "Invited On",
    width: 150,
    valueFormatter: (params: ValueFormatterParams) =>
      (params.value as Timestamp)?.toDate().toLocaleDateString(),
  },
  {
    field: "inviteId",
    headerName: "Send an Invite",
    width: 150,
    renderCell: (params: CellParams) => {
      if (params.value) return <></>;

      const handleClick = () => {
        sendInvite(params.getValue("id") as string);
      };

      return (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleClick}
        >
          Invite
        </Button>
      );
    },
  },
  {
    field: "deleted",
    headerName: "Delete",
    width: 150,
    renderCell: (params: CellParams) => {
      if (params.value) return <></>;

      const handleClick = () => {
        if (window.confirm("Delete this invite?")) {
          deleteInvite(params.getValue("id") as string);
        }
      };

      return (
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={handleClick}
        >
          Delete
        </Button>
      );
    },
  },
];

const BetaInviteForms = ({ openAlert }: { openAlert: OpenAlert }) => {
  const [betaSignUps, setBetaSignUps] = useState<
    (BetaSignUp & { id: string })[]
  >([]);

  const classes = useStyles();

  useEffect(() => {
    const unsub = store
      .collection("betaSignUps")
      .orderBy("signUpTime", "desc")
      .onSnapshot((snapshot) => {
        const betaSignUps: (BetaSignUp & { id: string })[] = [];

        console.log(snapshot.size);

        snapshot.forEach((docChange) => {
          const signup = docChange.data() as BetaSignUp;
          if (!signup.deleted)
            betaSignUps.push({
              ...signup,
              id: docChange.id,
            });
        });

        setBetaSignUps(betaSignUps);
      });

    return () => {
      unsub();
    };
  }, []);

  const sendInviteToEmail = useCallback(
    async (signupId: string) => {
      const betaSignUp = (
        await store.collection("betaSignUps").doc(signupId).get()
      ).data() as BetaSignUp;

      const invite = await store.collection("invites").add({
        email: betaSignUp.emailAddress,
        name: betaSignUp.name,
        opened: false,
        used: false,
        createdTime: firestoreTimeNow(),
      });

      await store.collection("betaSignUps").doc(signupId).update({
        inviteId: invite.id,
        invitedOn: firestoreTimeNow(),
      });

      openAlert({
        severity: "success",
        message: "Invite sent to beta signup",
      });
    },
    [openAlert]
  );

  const deleteInvite = useCallback(async (signupId: string) => {
    await store.collection("betaSignUps").doc(signupId).update({
      deleted: true,
    });
  }, []);

  const cols = useMemo(() => betaSignupsCols(sendInviteToEmail, deleteInvite), [
    sendInviteToEmail,
    deleteInvite,
  ]);

  return (
    <DataGrid
      className={classes.dataGrid}
      autoHeight
      rows={betaSignUps}
      columns={cols}
      hideFooter={true}
      // pageSize={5}
      // rowsPerPageOptions={[5]}
    />
  );
};

const Invites = () => {
  const classes = useStyles();

  const { alert, openAlert } = useTimedAlert();

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Text.SectionHeader>{`Invites`}</Text.SectionHeader>
          </Paper>
        </Grid>
      </Grid>
      {alert && (
        <Grid container>
          <Grid item xs={12}>
            <Alert severity={alert.severity}>{alert.message}</Alert>
          </Grid>
        </Grid>
      )}
      <Grid container>
        <Grid item xs={12} lg={6}>
          <CreateInviteForm openAlert={openAlert} />
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Text.ElementHeader>{`Send an Invite to a Beta Request`}</Text.ElementHeader>
            </Paper>
            <BetaInviteForms openAlert={openAlert} />
          </Grid>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper className={classes.paper}>
            <Text.ElementHeader>{`Invites`}</Text.ElementHeader>
          </Paper>
          <InvitesList openAlert={openAlert} />
        </Grid>
      </Grid>
    </>
  );
};

export default Invites;
