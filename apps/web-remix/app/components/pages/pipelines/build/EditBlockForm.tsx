import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@elpassion/taco";
import {
  generateZODSchema,
  JSONSchemaField,
} from "~/components/form/schema/SchemaParser";
import { FieldProps, Schema } from "~/components/form/schema/Schema";
import {
  ArrayField,
  BooleanField,
  NumberField,
  StringField,
} from "~/components/form/schema/SchemaFields";
import { ValidatedForm, useFormContext } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { MonacoSuggestionEditorField } from "~/components/form/fields/monacoSuggestionEditor.field";
import { AsyncSelectField } from "~/components/form/fields/asyncSelect.field";
import { CreatableAsyncSelectField } from "~/components/form/fields/creatableAsyncSelect.field";
import { assert } from "~/utils/assert";
import {
  Field as FormField,
  HiddenField,
} from "~/components/form/fields/field.context";
import { BlockConfig } from "../contracts";
import {
  IBlockConfig,
  IBlockConfigConnection,
} from "~/components/pages/pipelines/pipeline.types";
import { TextInputField } from "~/components/form/fields/text.field";
import { MonacoEditorField } from "~/components/form/fields/monacoEditor.field";

export function EditBlockForm({
  onSubmit,
  blockConfig,
  children,
  organizationId,
  pipelineId,
  disabled = false,
  nodesNames,
}: {
  organizationId: number;
  pipelineId: number;
  children?: ReactNode;
  onSubmit: (data: IBlockConfig & { oldName: string }) => void;
  blockConfig: z.TypeOf<typeof BlockConfig>;
  disabled?: boolean;
  nodesNames: string[];
}) {
  const schema = generateZODSchema(blockConfig.block_type.schema as any);
  const validator = React.useMemo(() => withZod(schema), []);
  const [inputs, setInputs] = useState(blockConfig.inputs);
  const [fieldsErrors, setFieldsErrors] = useState<Record<string, string>>({});
  const [latestValues, setLatestValues] = useState<Record<string, any>>({});

  const clearFieldsErrors = () => {
    setFieldsErrors({});
  };

  const updateInputReset = useCallback(
    (input: string, reset: boolean) => {
      const newInputs = inputs.map((existingInput) => {
        if (existingInput.split("?")[0] !== input.split("?")[0])
          return existingInput;
        return `${input.split("?")[0]}?reset=${reset}`;
      });
      setInputs(newInputs);
    },
    [inputs]
  );

  const handleUpdate = (
    data: Record<string, any>,
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    clearFieldsErrors();
    const newConfig = { oldName: blockConfig.name, ...blockConfig, ...data };
    newConfig.inputs = inputs;

    if (
      newConfig.oldName !== newConfig.name &&
      nodesNames.includes(data.name)
    ) {
      setFieldsErrors({ name: "This block name is already in used" });
    } else {
      onSubmit(newConfig);
    }
  };

  const CustomEditorField = useCallback(
    (props: FieldProps) => {
      if (!("presentAs" in props.field) || props.field.presentAs !== "editor") {
        return null;
      }

      return (
        <EditorField
          field={props.field}
          name={props.name as string}
          blockConfig={blockConfig}
          schema={props.schema}
        />
      );
    },
    [blockConfig.connections]
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
      const { fieldErrors, getValues } = useFormContext();

      const replacedUrl = props.field.url
        .replace("{{organization_id}}", organizationId.toString())
        .replace(/{{([\w.]+)}}/g, (_fullMatch, optKey) => {
          const values = getValues();
          const replacedValue = values.get(optKey);

          return replacedValue || optKey;
        });

      return (
        <FormField name={props.name!}>
          <AsyncSelectField
            url={replacedUrl}
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
    [blockConfig.name, organizationId, pipelineId, latestValues]
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
      const { fieldErrors, getValues } = useFormContext();
      const replacedUrl = props.field.url
        .replace("{{organization_id}}", organizationId.toString())
        .replace(/{{([\w.]+)}}/g, (_fullMatch, optKey) => {
          const values = getValues();
          const replacedValue = values.get(optKey);
          return replacedValue || optKey;
        });

      return (
        <FormField name={props.name!}>
          <CreatableAsyncSelectField
            url={replacedUrl}
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
    [blockConfig.name, organizationId, pipelineId, latestValues]
  );

  return (
    <ValidatedForm
      // @ts-ignore
      validator={validator}
      defaultValues={blockConfig}
      onSubmit={handleUpdate}
      className="w-full grow flex flex-col h-[60%]"
      onChange={(e: any) => {
        setLatestValues((prev) => ({ ...prev, [e.target.id]: e.target.value }));
      }}
      noValidate
    >
      <InputsProvider inputs={inputs} updateInputReset={updateInputReset}>
        <div className="space-y-4 grow max-h-full overflow-y-auto px-1">
          <FormField name="name">
            <TextInputField
              name="name"
              label="Name"
              supportingText="The name of the chat."
              defaultValue={blockConfig.name}
              errorMessage={fieldsErrors.name}
            />
          </FormField>
          <HiddenField name="inputs" value={JSON.stringify(inputs)} />

          <Schema
            schema={blockConfig.block_type.schema.properties.opts}
            name="opts"
            fields={{
              string: StringField,
              number: NumberField,
              array: ArrayField,
              boolean: BooleanField,
              editor: CustomEditorField,
              asyncSelect: SelectField,
              asyncCreatableSelect: AsyncCreatableField,
            }}
          />

          {children}
        </div>
      </InputsProvider>

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

function generateSuggestions(connections: IBlockConfigConnection[]) {
  return connections.map((connection) => {
    return {
      value: `${connection.from.block_name}:${connection.from.output_name}`,
      reset: connection.opts.reset,
    };
  });
}

const InputsContext = React.createContext<{
  inputs: string[];
  updateInputReset: (input: string, value: boolean) => void;
}>({ inputs: [], updateInputReset: () => {} });

const InputsProvider: React.FC<{
  inputs: string[];
  updateInputReset: (input: string, value: boolean) => void;
  children: ReactNode;
}> = ({ inputs, updateInputReset, children }) => {
  return (
    <>
      <InputsContext.Provider value={{ inputs, updateInputReset }}>
        {children}
      </InputsContext.Provider>
    </>
  );
};

export function useInputs() {
  return React.useContext(InputsContext);
}

interface EditorFieldProps {
  blockConfig: z.TypeOf<typeof BlockConfig>;
  field: {
    type: "string";
    title: string;
    description: string;
    presentAs: "editor";
    editorLanguage: "json" | "custom";
  };
  name: string;
  schema: JSONSchemaField;
}
function EditorField({ field, name, blockConfig }: EditorFieldProps) {
  const { fieldErrors } = useFormContext();

  const renderEditorByLanguage = () => {
    switch (field.editorLanguage) {
      case "json":
        return (
          <MonacoEditorField
            supportingText={field.description}
            language={field.editorLanguage}
            label={field.title}
            error={fieldErrors[name]}
          />
        );
      default:
        return (
          <MonacoSuggestionEditorField
            supportingText={field.description}
            label={field.title}
            suggestions={generateSuggestions(blockConfig.connections)}
            error={fieldErrors[name]}
          />
        );
    }
  };

  return <FormField name={name}>{renderEditorByLanguage()}</FormField>;
}
