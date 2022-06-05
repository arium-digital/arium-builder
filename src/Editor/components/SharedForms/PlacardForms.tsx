import { HasBackingAndFrameConfig, PlacardConfig } from "spaceTypes/text";
import { useNullableChangeHandlersWithDefaults } from "Editor/hooks/useNullableChangeHandlers";
import * as Forms from "../Form";
import Grid from "@material-ui/core/Grid/Grid";
import { defaultFrameConfig, defaultMaterialConfig } from "defaultConfigs";
import FrameForm from "./HasFrameForm";
import { UseChangeHandlerResult } from "Editor/hooks/useChangeHandlers";
import FormSection, {
  FormSectionDisplaySettings,
} from "Editor/components/Form/FormSection";

const anchorXOptions: string[] = ["left", "center", "right"];
const anchorYOptions: string[] = [
  "top",
  "top-baseline",
  "middle",
  "bottom-baseline",
  "bottom",
];
const textAlignOptions: string[] = ["left", "right", "center", "justify"];

export const SimplifiedBackingAndFrameForm = ({
  values,
  handleFieldChanged,
  makeNestedFormProps,
  showBackingPadding = true,
  title,
  defaultExpanded,
  notExpandable,
}: Pick<
  UseChangeHandlerResult<HasBackingAndFrameConfig>,
  "values" | "handleFieldChanged" | "makeNestedFormProps"
> & {
  showBackingPadding?: boolean;
} & FormSectionDisplaySettings) => {
  const materialProps = makeNestedFormProps("backingMaterial");

  const materialHandlers = useNullableChangeHandlersWithDefaults({
    nestedForm: materialProps,
    defaultValues: defaultMaterialConfig,
  });

  return (
    <Grid item xs={12}>
      <FormSection {...{ title, defaultExpanded, notExpandable }}>
        <Forms.Switch
          label="Has Backing"
          value={values.hasBacking}
          setValue={handleFieldChanged("hasBacking")}
          description="If backing/a box should appear around the text"
        />
        {values.hasBacking && showBackingPadding && (
          <Grid item xs={12}>
            <Forms.Number
              label="Placard Contents Padding"
              initialValue={values.backingOffsetScale}
              setValue={handleFieldChanged("backingOffsetScale")}
              min={0}
              max={2}
              step={0.01}
              size="lg"
              description="How much percentage to pad around the text when adding backing."
            />
          </Grid>
        )}
        {values.hasBacking && (
          <Grid item xs={12}>
            <Forms.ColorPicker
              label={"Box Color"}
              value={materialHandlers.values.color}
              setValue={materialHandlers.handleFieldChanged("color")}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <Forms.Switch
            label="Has a Frame"
            value={values.hasFrame}
            setValue={handleFieldChanged("hasFrame")}
          />
        </Grid>
        <Grid item xs={12}>
          {values.hasFrame && (
            <FrameForm
              defaults={defaultFrameConfig}
              nestedForm={makeNestedFormProps("frameConfig")}
              formSection={false}
            />
          )}
        </Grid>
      </FormSection>
    </Grid>
  );
};

export const PlacardContentForm = ({
  values,
  handleFieldChanged,
  errors,
}: UseChangeHandlerResult<PlacardConfig>) => {
  return (
    <Grid container>
      <Grid item xs={12} style={{ padding: "8px 16px 16px" }}>
        <Forms.FreeText
          value={values.text}
          setValue={handleFieldChanged("text")}
          label="Text"
          size="fullWidth"
          multiline
          error={errors?.text}
        />
      </Grid>
      <Grid item xs={6} style={{ padding: "8px 16px 16px" }}>
        <Forms.Number
          label={"Max Width"}
          description="The max width of the text block.  If larger than this, text will be wrapped. If set to 0, this will be considered to not have a max width."
          initialValue={values.maxWidth}
          setValue={handleFieldChanged("maxWidth")}
          min={0}
          max={1000}
          step={0.1}
        ></Forms.Number>
      </Grid>
      <Grid item xs={6}>
        <Forms.DropdownSelect
          label="Text Align"
          value={values.textAlign || "left"}
          // @ts-ignore
          setValue={handleFieldChanged("textAlign")}
          options={textAlignOptions}
          size="md"
          description="The horizontal alignment of each line of text within the overall text bounding box."
        />
      </Grid>{" "}
      <FormSection title="Advanced Placard Alignment">
        <Grid container>
          <Grid item xs={4}>
            <Forms.DropdownSelect
              label="Anchor X"
              value={values.anchorX || "center"}
              // @ts-ignore
              setValue={handleFieldChanged("anchorX")}
              options={anchorXOptions}
              size="md"
              description="The horizontal position in the text block that should line up with the local origin. "
            />
          </Grid>
          <Grid item xs={4}>
            <Forms.DropdownSelect
              label="Anchor Y"
              value={values.anchorY || "middle"}
              // @ts-ignore
              setValue={handleFieldChanged("anchorY")}
              options={anchorYOptions}
              size="md"
              description="The vertical position in the text block that should line up with the local origin."
            />
          </Grid>
        </Grid>
      </FormSection>
    </Grid>
  );
};
