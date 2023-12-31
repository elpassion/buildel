import React, { ReactNode, useCallback, useEffect } from "react";
import { z } from "zod";
import { Button } from "@elpassion/taco";
import { generateZODSchema } from "~/components/form/schema/SchemaParser";
import { FieldProps, Schema } from "~/components/form/schema/Schema";
import {
  ArrayField,
  BooleanField,
  NumberField,
  StringField,
} from "~/components/form/schema/SchemaFields";
import { ValidatedForm, useFormContext } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { MonacoEditorField } from "~/components/form/fields/monacoEditor.field";
import { AsyncSelectField } from "~/components/form/fields/asyncSelect.field";
import { CreatableAsyncSelectField } from "~/components/form/fields/creatableAsyncSelect.field";
import { assert } from "~/utils/assert";
import {
  Field as FormField,
  HiddenField,
} from "~/components/form/fields/field.context";
import { BlockConfig } from "../contracts";

export function EditBlockForm({
  onSubmit,
  blockConfig,
  children,
  organizationId,
  pipelineId,
  disabled = false,
}: {
  organizationId: number;
  pipelineId: number;
  children?: ReactNode;
  onSubmit: (data: z.TypeOf<typeof BlockConfig>) => void;
  blockConfig: z.TypeOf<typeof BlockConfig>;
  disabled?: boolean;
}) {
  const schema = generateZODSchema(blockConfig.block_type.schema as any);
  const validator = React.useMemo(() => withZod(schema), []);

  const handleUpdate = (
    data: Record<string, any>,
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    onSubmit({ ...blockConfig, ...data });
  };

  const EditorField = useCallback(
    (props: FieldProps) => {
      assert(props.field.type === "string");
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { fieldErrors } = useFormContext();

      return (
        <FormField name={props.name!}>
          <MonacoEditorField
            supportingText={props.field.description}
            label={props.field.title}
            suggestions={generateSuggestions(blockConfig.inputs)}
            error={fieldErrors[props.name!]}
          />
        </FormField>
      );
    },
    [blockConfig.inputs]
  );

  const SelectField = useCallback(
    (props: FieldProps) => {
      assert(props.field.type === "string");
      if (
        !("presentAs" in props.field) ||
        props.field.presentAs !== "async-select"
      ) {
        return;
      }
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { fieldErrors } = useFormContext();
      return (
        <FormField name={props.name!}>
          <AsyncSelectField
            url={props.field.url.replace(
              "{{organization_id}}",
              organizationId.toString()
            )}
            label={props.field.title}
            supportingText={props.field.description}
            errorMessage={fieldErrors[props.name!]}
            isClearable
            defaultValue={props.field.default
              ?.replace("{{pipeline_id}}", pipelineId.toString())
              ?.replace("{{block_name}}", blockConfig.name)}
          />
        </FormField>
      );
    },
    [blockConfig.name, organizationId, pipelineId]
  );

  const AsyncCreatableField = useCallback(
    (props: FieldProps) => {
      assert(props.field.type === "string");
      if (
        !("presentAs" in props.field) ||
        props.field.presentAs !== "async-creatable-select"
      ) {
        return;
      }
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { fieldErrors } = useFormContext();

      return (
        <FormField name={props.name!}>
          <CreatableAsyncSelectField
            url={props.field.url.replace(
              "{{organization_id}}",
              organizationId.toString()
            )}
            schema={props.field.schema}
            label={props.field.title}
            supportingText={props.field.description}
            errorMessage={fieldErrors[props.name!]}
            defaultValue={props.field.default
              ?.replace(":pipeline_id", pipelineId.toString())
              ?.replace(":block_name", blockConfig.name)}
          />
        </FormField>
      );
    },
    [blockConfig.name, organizationId, pipelineId]
  );

  return (
    <ValidatedForm
      // @ts-ignore
      validator={validator}
      defaultValues={blockConfig}
      onSubmit={handleUpdate}
      className="w-full grow flex flex-col h-[60%]"
      noValidate
    >
      <div className="space-y-4 grow max-h-full overflow-y-auto px-1">
        <HiddenField name="name" value={blockConfig.name} />
        <HiddenField name="inputs" value={JSON.stringify(blockConfig.inputs)} />

        <Schema
          schema={blockConfig.block_type.schema.properties.opts}
          name="opts"
          fields={{
            string: StringField,
            number: NumberField,
            array: ArrayField,
            boolean: BooleanField,
            editor: EditorField,
            asyncSelect: SelectField,
            asyncCreatableSelect: AsyncCreatableField,
          }}
        />

        {children}
      </div>

      <Button
        isFluid
        size="sm"
        type="submit"
        variant="filled"
        className="mt-6"
        disabled={disabled}
      >
        Save changes
      </Button>

      <TriggerValidation />
    </ValidatedForm>
  );
}

function TriggerValidation() {
  const { validate } = useFormContext();

  useEffect(() => {
    validate();
  }, [validate]);
  return null;
}

function generateSuggestions(inputs: string[]) {
  return inputs.map((suggestion) => suggestion.split("->").at(0) ?? "");
}
