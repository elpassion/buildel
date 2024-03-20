import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { FieldProps, Schema } from "~/components/form/schema/Schema";
import { ValidatedForm, useFormContext } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { MonacoSuggestionEditorField } from "~/components/form/fields/monacoSuggestionEditor.field";
import { AsyncSelectField } from "~/components/form/fields/asyncSelect.field";
import {
  CreatableAsyncForm,
  CreatableAsyncSelectField,
} from "~/components/form/fields/creatableAsyncSelect.field";
import { assert } from "~/utils/assert";
import { TextInputField } from "~/components/form/fields/text.field";
import { MonacoEditorField } from "~/components/form/fields/monacoEditor.field";
import { useCopyToClipboard } from "~/hooks/useCopyToClipboard";
import { successToast } from "~/components/toasts/successToast";
import { ExtendedBlockConfig } from "~/api/blockType/blockType.contracts";
import {
  ArrayField,
  BooleanField,
  NumberField,
  StringField,
} from "~/components/form/schema/SchemaFields";
import {
  generateZODSchema,
  JSONSchemaField,
} from "~/components/form/schema/SchemaParser";
import {
  IBlockConfig,
  IConfigConnection,
} from "~/components/pages/pipelines/pipeline.types";
import {
  Field as FormField,
  HiddenField,
} from "~/components/form/fields/field.context";
import { SubmitButton } from "~/components/form/submit";
import { reverseToolConnections } from "~/components/pages/pipelines/PipelineFlow.utils";

export function EditBlockForm({
  onSubmit,
  blockConfig,
  children,
  organizationId,
  pipelineId,
  disabled = false,
  nodesNames,
  connections: propsConnections,
}: {
  organizationId: number;
  pipelineId: number;
  children?: ReactNode;
  onSubmit: (
    data: IBlockConfig & { oldName: string },
    connections: IConfigConnection[],
  ) => void;
  blockConfig: z.TypeOf<typeof ExtendedBlockConfig>;
  disabled?: boolean;
  nodesNames: string[];
  connections: IConfigConnection[];
}) {
  const schema = generateZODSchema(blockConfig.block_type?.schema as any);
  const validator = React.useMemo(() => withZod(schema), []);
  const [connections, setConnections] =
    useState<IConfigConnection[]>(propsConnections);
  const [fieldsErrors, setFieldsErrors] = useState<Record<string, string>>({});
  const [latestValues, setLatestValues] = useState<Record<string, any>>({});

  const clearFieldsErrors = () => {
    setFieldsErrors({});
  };

  const updateInputReset = useCallback(
    (connection: IConfigConnection, reset: boolean) => {
      const newConnections = connections.map((existingConnection) => {
        if (
          existingConnection.from.block_name === connection.from.block_name &&
          existingConnection.to.block_name === connection.to.block_name
        ) {
          return {
            ...existingConnection,
            opts: { ...existingConnection.opts, reset },
          };
        }

        return existingConnection;
      });
      setConnections(newConnections);
    },
    [connections],
  );

  const handleUpdate = (
    data: Record<string, any>,
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    clearFieldsErrors();
    const newConfig = { oldName: blockConfig.name, ...blockConfig, ...data };

    if (
      newConfig.oldName !== newConfig.name &&
      nodesNames.includes(data.name)
    ) {
      setFieldsErrors({ name: "This block name is already in used" });
    } else {
      onSubmit(newConfig, connections);
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
          connections={[
            ...connections.filter(
              (connection) => connection.to.block_name === blockConfig.name,
            ),
            ...reverseToolConnections(connections, blockConfig.name),
          ]}
          schema={props.schema}
        />
      );
    },
    [blockConfig.connections],
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
        .replace("{{pipeline_id}}", pipelineId.toString())
        .replace(/{{([\w.]+)}}/g, (_fullMatch, optKey) => {
          const values = getValues();
          const replacedValue = values.get(optKey);

          return replacedValue || optKey;
        });

      return (
        <FormField name={props.name!}>
          <AsyncSelectField
            url={replacedUrl}
            id={`${props.name}`}
            data-testid={props.name}
            label={props.field.title}
            dropdownClassName={`${props.name}-dropdown`}
            supportingText={props.field.description}
            errorMessage={fieldErrors[props.name!]}
            defaultValue={props.field.default
              ?.replace("{{pipeline_id}}", pipelineId.toString())
              ?.replace("{{block_name}}", blockConfig.name)
              ?.replace(/{{([\w.]+)}}/g, (_fullMatch, optKey) => {
                const values = getValues();
                const replacedValue = values.get(optKey);

                return replacedValue || optKey;
              })}
          />
        </FormField>
      );
    },
    [blockConfig.name, organizationId, pipelineId],
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
            id={`${props.name}`}
            label={props.field.title}
            supportingText={props.field.description}
            errorMessage={fieldErrors[props.name!]}
            dropdownClassName={`${props.name}-dropdown`}
            data-testid={props.name}
            defaultValue={props.field.default
              ?.replace("{{pipeline_id}}", pipelineId.toString())
              ?.replace("{{block_name}}", blockConfig.name)
              ?.replace(/{{([\w.]+)}}/g, (_fullMatch, optKey) => {
                const values = getValues();
                const replacedValue = values.get(optKey);

                return replacedValue || optKey;
              })}
            renderForm={({ onCreate }) => (
              <CreatableAsyncForm
                //@ts-ignore
                schema={props.field.schema}
                onCreate={onCreate}
                asyncSelect={(innerProps) => <SelectField {...innerProps} />}
                asyncCreatableSelect={(innerProps) => (
                  <AsyncCreatableField {...innerProps} />
                )}
              />
            )}
          />
        </FormField>
      );
    },
    [blockConfig.name, organizationId, pipelineId],
  );

  return (
    <ValidatedForm
      // @ts-ignore
      validator={validator}
      defaultValues={blockConfig}
      onSubmit={handleUpdate}
      className="w-full grow flex flex-col h-[70vh]"
      onChange={(e: any) => {
        setLatestValues((prev) => ({ ...prev, [e.target.id]: e.target.value }));
      }}
      noValidate
    >
      <InputsProvider
        connections={connections}
        updateInputReset={updateInputReset}
      >
        <div className="space-y-4 grow overflow-y-auto px-1">
          <div className="flex justify-end">
            <CopyConfigurationButton
              value={JSON.stringify({
                name: blockConfig.name,
                opts: blockConfig.opts,
                type: blockConfig.type,
              })}
            />
          </div>

          <FormField name="name">
            <TextInputField
              name="name"
              label="Name"
              supportingText="The name of the chat."
              defaultValue={blockConfig.name}
              errorMessage={fieldsErrors.name}
            />
          </FormField>
          <HiddenField
            name="inputs"
            value={JSON.stringify(blockConfig.inputs)}
          />

          <Schema
            schema={blockConfig.block_type?.schema.properties.opts}
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

      <SubmitButton
        isFluid
        size="sm"
        variant="filled"
        className="mt-6"
        disabled={disabled}
      >
        Save changes
      </SubmitButton>

      <TriggerValidation />
    </ValidatedForm>
  );
}

function TriggerValidation() {
  const { validate } = useFormContext();

  useEffect(() => {
    const validateForm = async () => {
      try {
        await validate();
      } catch {}
    };

    validateForm();
  }, [validate]);
  return null;
}

function generateSuggestions(connections: IConfigConnection[]) {
  return connections.map((connection) => {
    return {
      value: `${connection.from.block_name}:${connection.from.output_name}`,
      reset: connection.opts.reset,
    };
  });
}

const InputsContext = React.createContext<{
  connections: IConfigConnection[];
  updateInputReset: (connection: IConfigConnection, value: boolean) => void;
}>({ connections: [], updateInputReset: () => {} });

const InputsProvider: React.FC<{
  connections: IConfigConnection[];
  updateInputReset: (connection: IConfigConnection, value: boolean) => void;
  children: ReactNode;
}> = ({ connections, updateInputReset, children }) => {
  return (
    <>
      <InputsContext.Provider value={{ connections, updateInputReset }}>
        {children}
      </InputsContext.Provider>
    </>
  );
};

export function useInputs() {
  return React.useContext(InputsContext);
}

interface EditorFieldProps {
  connections: IConfigConnection[];
  field: {
    type: "string";
    title: string;
    description: string;
    presentAs: "editor";
    editorLanguage: "json" | "custom";
    suggestions?: { value: string; description: string; type: string }[];
    default?: string;
  };
  name: string;
  schema: JSONSchemaField;
}
function EditorField({ field, name, connections, schema }: EditorFieldProps) {
  const { fieldErrors } = useFormContext();

  const renderEditorByLanguage = () => {
    switch (field.editorLanguage) {
      case "json":
        return (
          <MonacoSuggestionEditorField
            supportingText={field.description}
            language={field.editorLanguage}
            label={field.title}
            defaultValue={field.default}
            error={fieldErrors[name]}
          />
        );
      default:
        const suggestions = (field.suggestions || []).flatMap((suggestion) => {
          if (suggestion.value === "inputs.*") {
            return generateSuggestions(connections);
          }
          if (suggestion.value === "metadata.*") {
            return [{ value: "metadata.", reset: false }];
          }
          if (suggestion.value === "secrets.*") {
            return [{ value: "secrets.", reset: false }];
          }
          return [{ value: suggestion.value, reset: false }];
        });

        return (
          <MonacoSuggestionEditorField
            supportingText={field.description}
            label={field.title}
            suggestions={suggestions}
            defaultValue={field.default}
            error={fieldErrors[name]}
          />
        );
    }
  };

  return <FormField name={name}>{renderEditorByLanguage()}</FormField>;
}

interface CopyConfigurationButtonProps {
  value: string;
}

function CopyConfigurationButton({ value }: CopyConfigurationButtonProps) {
  const { copy, isCopied } = useCopyToClipboard(value ?? "");

  useEffect(() => {
    if (isCopied) {
      successToast({ description: "Configuration copied!" });
    }
  }, [isCopied]);

  return (
    <button
      onClick={copy}
      type="button"
      className="self-end text-sm text-neutral-100 underline bg-transparent !border-none hover:text-primary-500"
    >
      Copy configuration
    </button>
  );
}
