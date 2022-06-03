import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  SyntheticEvent,
} from "react";
import { useStyles } from "../../shared/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { ElementHeader } from "../../Editor/components/VisualElements/Text";
import { store } from "../../db";

import * as FormField from "../../Editor/components/Form";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import { DataGrid, ColDef, ValueGetterParams } from "@material-ui/data-grid";
import range from "lodash/range";
import { firestoreTimeNow } from "db";

interface OpenExecuteArgs {
  url: string;
  video?: string;
  instanceId: string;
  x?: number;
  z?: number;
  randomPositionRadius?: number;
  randomTimeOffset?: number;
  duration?: number;
  motionProbability?: number;
}

interface TestCallEntry extends OpenExecuteArgs {
  id: string;
  status: "success" | "error" | "executing";
  error?: string;
  result?: any;
}

const columns: ColDef[] = [
  {
    field: "status",
    headerName: "status",
    width: 100,
  },
  {
    field: "url",
    headerName: "url",
    width: 300,
    valueGetter: (params: ValueGetterParams) =>
      (params.getValue("params") as OpenExecuteArgs)?.url,
  },
  {
    field: "instanceId",
    headerName: "instanceId",
    width: 100,
    valueGetter: (params: ValueGetterParams) =>
      (params.getValue("params") as OpenExecuteArgs)?.instanceId,
  },
  {
    field: "duration",
    headerName: "duration",
    width: 100,
    valueGetter: (params: ValueGetterParams) =>
      (params.getValue("params") as OpenExecuteArgs)?.duration,
  },
  {
    field: "error",
    headerName: "error",
    width: 150,
  },
];

const TestAgentsCallsDisplay = ({
  testCallResults,
}: {
  testCallResults: TestCallEntry[];
}) => {
  return (
    <div style={{ height: 1000, width: "100%" }}>
      <DataGrid rows={testCallResults} columns={columns} />;
    </div>
  );
};

const useSpaceIds = () => {
  const [spaceIds, setSpaceIds] = useState<string[]>([]);

  useEffect(() => {
    const unsub = store.collection("spaces").onSnapshot((snapshot) => {
      const spaceIds: string[] = [];

      snapshot.forEach((snap) => spaceIds.push(snap.id));

      setSpaceIds(spaceIds);
    });

    return () => {
      unsub();
    };
  }, []);

  return spaceIds;
};

const TestAgentsForm = () => {
  const classes = useStyles();

  const [baseUrl, setBaseUrl] = useState<string | undefined>(
    "https://arium.xyz"
  );

  const [numberAgents, setNumberAgents] = useState<number | undefined>(10);
  const [duration, setDuration] = useState<number | undefined>(60);
  const [centerX, setCenterX] = useState<number | undefined>(0);
  const [centerZ, setCenterZ] = useState<number | undefined>(0);
  const [randomPositionRadius, setRandomPositionRadius] = useState<
    number | undefined
  >(40);
  const [randomTimeOffset, setRandomTimeOffset] = useState<number | undefined>(
    10
  );
  const [motionProbability, setMotionProbability] = useState<
    number | undefined
  >(0.1);

  const [submitting, setSubmitting] = useState(false);

  const testAgentCallsRef = useMemo(
    () => store.collection("testAgentCalls"),
    []
  );

  const [testCallResults, setTestCallResults] = useState<TestCallEntry[]>([]);

  const [spaceId, setSpaceId] = useState<string | null>(null);

  useEffect(() => {
    const unsusbcribe = testAgentCallsRef
      .orderBy("invokeTime", "desc")
      .limit(200)
      .onSnapshot((snap) => {
        const newResults: TestCallEntry[] = [];

        snap.forEach((doc) => {
          newResults.push({
            ...doc.data(),
            id: doc.id,
          } as TestCallEntry);
        });

        setTestCallResults(newResults);
      });

    return () => {
      unsusbcribe();
    };
  }, [testAgentCallsRef]);

  const spaceIds = useSpaceIds();

  const submit = useCallback(
    async (e: SyntheticEvent) => {
      if (submitting) return;
      setSubmitting(true);

      if (!baseUrl || !spaceId) return;

      try {
        const numberOfCalls = range(numberAgents || 1);
        await Promise.all(
          numberOfCalls.map(() => {
            const params: OpenExecuteArgs = {
              instanceId: spaceId,
              duration,
              x: centerX,
              z: centerZ,
              randomPositionRadius,
              url: baseUrl,
              motionProbability,
            };
            return testAgentCallsRef.add({
              params,
              invokeTime: firestoreTimeNow(),
            });
          })
        );
      } catch (e) {
        console.error(e);
      }

      setSubmitting(false);
    },
    [
      submitting,
      baseUrl,
      numberAgents,
      spaceId,
      duration,
      centerX,
      centerZ,
      randomPositionRadius,
      testAgentCallsRef,
      motionProbability,
    ]
  );

  return (
    <>
      <Grid item xs={12} md={4}>
        <Paper className={classes.paper}>
          <ElementHeader>Test Agents</ElementHeader>
          <div className={classes.formRow}>
            <FormField.FreeText
              value={baseUrl}
              setValue={setBaseUrl}
              label="Base site url to send agents to"
              size="fullWidth"
            />
          </div>
          <div className={classes.formRow}>
            {spaceIds.length > 0 && (
              <FormField.DropdownSelect
                // @ts-ignore
                options={spaceIds}
                value={spaceIds[0]}
                label={"Space"}
                setValue={setSpaceId}
              />
            )}
          </div>
          <div className={classes.formRow}>
            <FormField.Number
              initialValue={numberAgents}
              setValue={setNumberAgents}
              label="Number of test agents"
              step={1}
              min={0}
              max={200}
              size="lg"
            />
          </div>
          <div className={classes.formRow}>
            <FormField.Number
              initialValue={randomTimeOffset}
              setValue={setRandomTimeOffset}
              label="Random time offset, in seconds, for the agents to visit the page"
              step={1}
              min={0}
              size="lg"
            />
          </div>
          <div className={classes.formRow}>
            <FormField.Number
              initialValue={randomPositionRadius}
              setValue={setRandomPositionRadius}
              label="Radius of random area that agents are dropped into"
              step={1}
              min={0}
              size="lg"
            />
          </div>
          <div className={classes.formRow}>
            <FormField.Number
              initialValue={motionProbability}
              setValue={setMotionProbability}
              label="Probability (0-1) that the agent moves every second"
              step={1}
              min={0}
              max={1}
              size="lg"
            />
          </div>
          <div className={classes.formRow}>
            <FormField.Number
              initialValue={centerX}
              setValue={setCenterX}
              label="Center x where agents will be dropped near"
              step={1}
              size="lg"
            />
          </div>
          <div className={classes.formRow}>
            <FormField.Number
              initialValue={centerZ}
              setValue={setCenterZ}
              label="Center z where agents will be dropped near"
              step={1}
              size="lg"
            />
          </div>

          <div className={classes.formRow}>
            <FormField.Number
              initialValue={duration}
              setValue={setDuration}
              label="Duration, in seconds, for the agents to run"
              step={1}
              size="lg"
            />
          </div>
          <Divider />
          <Button
            type="submit"
            size="large"
            variant="contained"
            color="primary"
            onClick={submit}
            disabled={submitting}
          >
            Spin Up Test Agents
          </Button>
        </Paper>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper className={classes.paper}>
          <TestAgentsCallsDisplay testCallResults={testCallResults} />
        </Paper>
      </Grid>
    </>
  );
};

const Administration = () => {
  const classes = useStyles();
  return (
    <>
      <Grid container>
        <Grid item xs={12} lg={8}>
          <Paper className={classes.paper}>
            <Typography variant="h4">{`Test Agents`}</Typography>
          </Paper>
        </Grid>
      </Grid>
      <Grid container>
        <TestAgentsForm />
      </Grid>
    </>
  );
};

export default Administration;
