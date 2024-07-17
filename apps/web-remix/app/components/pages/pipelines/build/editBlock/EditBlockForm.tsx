import type { ReactNode } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import { withZod } from '@remix-validated-form/with-zod';
import { useFormContext, ValidatedForm } from 'remix-validated-form';
import type { z } from 'zod';

import type { ExtendedBlockConfig } from '~/api/blockType/blockType.contracts';
import type { Suggestion } from '~/components/editor/CodeMirror/codeMirror.types';
import { AsyncSelectField } from '~/components/form/fields/asyncSelect.field';
import {
  CreatableAsyncForm,
  CreatableAsyncSelectField,
} from '~/components/form/fields/creatableAsyncSelect.field';
import { EditorField } from '~/components/form/fields/editor.field';
import {
  Field as FormField,
  HiddenField,
} from '~/components/form/fields/field.context';
import { TextInputField } from '~/components/form/fields/text.field';
import type { FieldProps } from '~/components/form/schema/Schema';
import { Schema } from '~/components/form/schema/Schema';
import {
  ArrayField,
  BooleanField,
  NumberField,
  StringField,
} from '~/components/form/schema/SchemaFields';
import { generateZODSchema } from '~/components/form/schema/SchemaParser';
import { SubmitButton } from '~/components/form/submit';
import type {
  IBlockConfig,
  IConfigConnection,
} from '~/components/pages/pipelines/pipeline.types';
import { reverseToolConnections } from '~/components/pages/pipelines/PipelineFlow.utils';
import { successToast } from '~/components/toasts/successToast';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { assert } from '~/utils/assert';

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
  const [_latestValues, setLatestValues] = useState<Record<string, any>>({});

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
      setFieldsErrors({ name: 'This block name is already in used' });
    } else {
      onSubmit(newConfig, connections);
    }
  };

  const CustomEditorField = useCallback(
    (props: FieldProps) => {
      if (!('presentAs' in props.field) || props.field.presentAs !== 'editor') {
        return null;
      }

      const suggestions: Suggestion[] = (props.field.suggestions || []).flatMap(
        (suggestion) => {
          if (suggestion.value === 'inputs.*') {
            return generateSuggestions([
              ...connections,
              ...reverseToolConnections(connections, blockConfig.name),
            ]);
          }
          if (suggestion.value === 'metadata.*') {
            return [
              {
                label: 'metadata.',
                info: suggestion.description,
                type: suggestion.type,
                matchAll: true,
              },
            ];
          }
          if (suggestion.value === 'secrets.*') {
            return [
              {
                label: 'secrets.',
                info: suggestion.description,
                type: suggestion.type,
                matchAll: true,
              },
            ];
          }
          return [
            {
              label: suggestion.value,
              info: suggestion.description,
              type: suggestion.type,
            },
          ];
        },
      );

      return (
        <FormField name={props.name!}>
          <EditorField
            supportingText={props.field.description}
            language={props.field.editorLanguage}
            label={props.field.title}
            defaultValue={props.field.default}
            suggestions={suggestions}
          />
        </FormField>
      );
    },
    [blockConfig.connections],
  );

  const SelectField = useCallback(
    (props: FieldProps) => {
      assert(props.field.type === 'string');
      if (
        !('presentAs' in props.field) ||
        props.field.presentAs !== 'async-select'
      ) {
        return;
      }
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { fieldErrors, getValues } = useFormContext();

      const replacedUrl = props.field.url
        .replace('{{organization_id}}', organizationId.toString())
        .replace('{{pipeline_id}}', pipelineId.toString())
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
              ?.replace('{{pipeline_id}}', pipelineId.toString())
              ?.replace('{{block_name}}', blockConfig.name)
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
      assert(props.field.type === 'string');
      if (
        !('presentAs' in props.field) ||
        props.field.presentAs !== 'async-creatable-select'
      ) {
        return;
      }
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { fieldErrors, getValues } = useFormContext();

      const replacedUrl = props.field.url
        .replace('{{organization_id}}', organizationId.toString())
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
              ?.replace('{{pipeline_id}}', pipelineId.toString())
              ?.replace('{{block_name}}', blockConfig.name)
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
        className="mt-6 py-1.5"
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

function generateSuggestions(connections: IConfigConnection[]): Suggestion[] {
  return connections.map((connection) => {
    return {
      label: `${connection.from.block_name}:${connection.from.output_name}`,
      info: '',
      variant: connection.opts.reset ? 'primary' : 'secondary',
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

interface CopyConfigurationButtonProps {
  value: string;
}

function CopyConfigurationButton({ value }: CopyConfigurationButtonProps) {
  const { copy, isCopied } = useCopyToClipboard(value ?? '');

  useEffect(() => {
    if (isCopied) {
      successToast({ description: 'Configuration copied!' });
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
