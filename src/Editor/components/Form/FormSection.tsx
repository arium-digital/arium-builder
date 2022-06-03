import { useStyles } from "Editor/styles";
import Grid from "@material-ui/core/Grid";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FormatClearIcon from "@material-ui/icons/FormatClear";
import { NestedFormProp } from ".";
import { useCallback, useContext, useEffect, useState } from "react";
import { EditorContext } from "components/InSpaceEditor/hooks/useEditorState";

function RevertToDefaultsButton<T>({
  nestedForm,
  isForTheme,
}: {
  nestedForm: NestedFormProp<T>;
  isForTheme?: boolean;
}) {
  if (nestedForm.values) return null;

  return <FormatClearIcon />;
}

export type FormSectionDisplaySettings = {
  defaultExpanded?: boolean;
  notExpandable?: boolean;
  title?: string;
};

function FormSection<T>({
  children,
  title,
  defaultExpanded,
  nestedForm,
  isForTheme,
  notExpandable,
  activeEditorKey,
}: {
  children:
    | React.ReactChild
    | (React.ReactChild | false | undefined)[]
    | false
    | undefined;
  nestedForm?: NestedFormProp<T>;
  isForTheme?: boolean;
} & FormSectionDisplaySettings & {
    activeEditorKey?: string;
  }) {
  const classes = useStyles();

  const setActiveEditor = useContext(EditorContext)?.setActiveEditor;

  const [mouseOver, setMouseOver] = useState(false);

  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleExpandedChange = useCallback(
    (e: any, expanded: boolean) => {
      setExpanded(expanded);
      if (activeEditorKey && setActiveEditor) {
        setActiveEditor(activeEditorKey, expanded);
      }
    },
    [activeEditorKey, setActiveEditor]
  );

  const shouldSetActiveEditor = expanded || mouseOver;

  useEffect(() => {
    if (!setActiveEditor || !activeEditorKey) return;
    if (shouldSetActiveEditor) {
      setActiveEditor(activeEditorKey, true);
      return () => {
        setActiveEditor(activeEditorKey, false);
      };
    }
  }, [setActiveEditor, activeEditorKey, shouldSetActiveEditor]);

  if (notExpandable) {
    return (
      <Grid container style={{ backgroundColor: "#ffffff" }}>
        <Grid item xs={12} style={{ padding: "8px 16px 16px" }}>
          {children}
        </Grid>
      </Grid>
    );
  }

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      style={{ width: "100%" }}
      onChange={handleExpandedChange}
      onMouseOver={() => setMouseOver(true)}
      onMouseOut={() => setMouseOver(false)}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${title}-content`}
        id={`${title}-header`}
      >
        <Typography className={classes.accordionHeading}>{title}</Typography>
        {nestedForm && (
          <RevertToDefaultsButton
            nestedForm={nestedForm}
            isForTheme={isForTheme}
          />
        )}
      </AccordionSummary>
      <AccordionDetails style={{ padding: "0 16px 8px" }}>
        <Grid container>
          <Grid item xs={12}>
            {children}
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}

export default FormSection;
