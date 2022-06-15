import { useCallback, useMemo, useState } from "react";
import { slugFieldSchema } from "website/spaceCreation/ChooseNameAndPassword";
import EditIcon from "@material-ui/icons/Edit";
import IconButton from "@material-ui/core/IconButton";
import * as yup from "yup";
import { useFormik } from "formik";
import TextField from "@material-ui/core/TextField";
import clsx from "clsx";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";

import { functions } from "db";
import { useFieldClassForSize } from "../Form/helpers";
import { InputAdornment } from "@material-ui/core";
import { useStyles } from "Editor/styles";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";

const spacePrefix = "/spaces/";

const generateSpaceUrl = (spaceSlug: string | undefined) => {
  return `${spacePrefix}${spaceSlug || ""}`;
};

const updateSlug = async ({
  spaceId,
  slug,
}: {
  spaceId: string;
  slug: string;
}) => {
  await functions().httpsCallable("updateSlug")({
    spaceId,
    slug,
  });
};

const EditSpaceUrl = ({
  slug,
  onSubmit,
  cancel,
}: {
  slug: string;
  onSubmit: (args: { slug: string }) => Promise<void>;
  cancel: () => void;
}) => {
  const classes = useStyles();

  const schema = useMemo(() => {
    return yup.object({
      // lowercase letters or strings
      slug: slugFieldSchema(slug),
    });
  }, [slug]);
  const formik = useFormik({
    initialValues: {
      slug,
    },
    validationSchema: schema,
    onSubmit,
  });

  const fieldClass = useFieldClassForSize("xl");
  return (
    <form onSubmit={formik.handleSubmit}>
      <FormControl className={clsx(classes.fieldMargin, fieldClass)}>
        <TextField
          className={fieldClass}
          error={!!formik.errors.slug}
          id="standard-error-helper-text"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          name="slug"
          // onChange={(slug: string) => handleChange({ slug })}
          disabled={formik.isSubmitting}
          value={formik.values.slug}
          InputProps={{
            startAdornment: (
              <InputAdornment
                position="start"
                style={{ marginRight: 0, marginBottom: 2 }}
              >
                {spacePrefix}
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => formik.handleSubmit()}
                  disabled={formik.isSubmitting}
                  title="Save"
                  style={{ padding: 4 }}
                  color="primary"
                >
                  <CheckCircleIcon
                  // style={{
                  //   color: !formik.isSubmitting ? ariumRed : undefined,
                  // }}
                  />
                </IconButton>
                <IconButton
                  onClick={() => cancel()}
                  disabled={formik.isSubmitting}
                  title="Cancel"
                  style={{ padding: 4 }}
                >
                  <CancelIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          // disabled={disabled || locked}
        />
        {formik.errors.slug && (
          <FormHelperText id="standard-weight-helper-text">
            {formik.errors.slug}
          </FormHelperText>
        )}
      </FormControl>
    </form>
  );
};

const SpaceUrlFormInner = ({
  slug,
  handleUpdateSlug,
  prefix,
}: {
  slug: string;
  handleUpdateSlug: (slug: string) => Promise<void>;
  prefix?: string;
}) => {
  const [editing, setEditing] = useState(false);

  const onSubmit = useCallback(
    async ({ slug }: { slug: string }) => {
      await handleUpdateSlug(slug);
      setEditing(false);
    },
    [handleUpdateSlug]
  );

  if (!editing)
    return (
      <>
        {prefix || null}{" "}
        <a href={`/spaces/${slug}`}>{generateSpaceUrl(slug)}</a>
        <IconButton
          onClick={() => setEditing(true)}
          size="small"
          style={{ padding: 0 }}
          color="primary"
        >
          <EditIcon style={{ fontSize: "1rem" }}></EditIcon>
        </IconButton>
      </>
    );

  return (
    <EditSpaceUrl
      slug={slug}
      onSubmit={onSubmit}
      cancel={() => setEditing(false)}
    />
  );
};

const SpaceUrlForm = ({
  spaceId,
  initialSlug,
  prefix,
  setUpdating,
}: {
  spaceId: string;
  initialSlug: string;
  prefix?: string;
  setUpdating?: (updating: boolean) => void;
}) => {
  const [spaceSlug, setSpaceSlug] = useState<string>(initialSlug);

  const handleUpdateSlug = useCallback(
    async (newSlug: string) => {
      if (spaceSlug === newSlug) {
        return;
      }
      if (setUpdating) setUpdating(true);
      await updateSlug({ spaceId, slug: newSlug });

      if (setUpdating) setUpdating(false);
      setSpaceSlug(newSlug);
    },
    [spaceId, spaceSlug, setUpdating]
  );

  if (!spaceSlug) return null;

  return (
    <SpaceUrlFormInner
      slug={spaceSlug}
      handleUpdateSlug={handleUpdateSlug}
      prefix={prefix}
    />
  );
};

export default SpaceUrlForm;
