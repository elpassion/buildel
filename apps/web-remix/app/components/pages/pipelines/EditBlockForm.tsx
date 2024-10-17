import type { ReactNode } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import type { Blocker, Location } from '@remix-run/react';
import { useBlocker } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { useFormContext, ValidatedForm } from 'remix-validated-form';
import type { z } from 'zod';

import type { ExtendedBlockConfig } from '~/api/blockType/blockType.contracts';
import { ChatMarkdown } from '~/components/chat/ChatMarkdown';
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
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import type { FieldProps } from '~/components/form/schema/Schema';
import { Schema } from '~/components/form/schema/Schema';
import {
  ArrayField,
  BooleanField,
  NumberField,
  StringField,
} from '~/components/form/schema/SchemaFields';
import type { JSONSchemaField } from '~/components/form/schema/SchemaParser';
import {
  checkDisplayWhenConditions,
  generateZODSchema,
} from '~/components/form/schema/SchemaParser';
import { SubmitButton } from '~/components/form/submit';
import { ConfirmationModal } from '~/components/modal/ConfirmationModal';
import type {
  IBlockConfig,
  IConfigConnection,
  IIOType,
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
  nodesNames = [],
  connections: propsConnections = [],
}: {
  organizationId: number | string;
  pipelineId: number;
  children?: ReactNode;
  onSubmit?: (
    data: IBlockConfig & { oldName: string },
    connections: IConfigConnection[],
  ) => void;
  blockConfig: z.TypeOf<typeof ExtendedBlockConfig>;
  disabled?: boolean;
  nodesNames?: string[];
  connections?: IConfigConnection[];
}) {
  const schema = generateZODSchema(blockConfig.block_type?.schema as any);
  const validator = React.useMemo(() => withZod(schema), []);
  const [connections, setConnections] =
    useState<IConfigConnection[]>(propsConnections);
  const [fieldsErrors, setFieldsErrors] = useState<Record<string, string>>({});
  const [latestValues, setLatestValues] = useState<Record<string, any>>({});

  const shouldDisplay = shouldDisplayField(blockConfig, connections);

  const clearFieldsErrors = () => {
    setFieldsErrors({});
  };

  const shouldBlock = useCallback(
    ({
      currentLocation,
      nextLocation,
    }: {
      currentLocation: Location;
      nextLocation: Location;
    }) => {
      if (nextLocation.state?.reset) return false;

      return (
        Object.keys(latestValues).length > 0 &&
        currentLocation.pathname !== nextLocation.pathname
      );
    },
    [latestValues],
  );

  const blocker = useBlocker(shouldBlock);

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

  const updateInputOptional = useCallback(
    (connection: IConfigConnection, optional: boolean) => {
      const newConnections = connections.map((existingConnection) => {
        if (
          existingConnection.from.block_name === connection.from.block_name &&
          existingConnection.to.block_name === connection.to.block_name
        ) {
          return {
            ...existingConnection,
            opts: { ...existingConnection.opts, optional },
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

    if (blocker.state === 'blocked') blocker.reset();

    const newConfig = { oldName: blockConfig.name, ...blockConfig, ...data };
    if (
      newConfig.oldName !== newConfig.name &&
      nodesNames.includes(data.name)
    ) {
      setFieldsErrors({ name: 'This block name is already in used' });
    } else {
      onSubmit?.(newConfig, connections);
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
              ...filterBlockConnections(connections, blockConfig),
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
            editable={!props.disabled}
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

      let defaultValue = props.field.default
        ?.replace('{{pipeline_id}}', pipelineId.toString())
        ?.replace('{{block_name}}', blockConfig.name)
        ?.replace(/{{([\w.]+)}}/g, (_fullMatch, optKey) => {
          const values = getValues();
          const replacedValue = values.get(optKey);

          return replacedValue || optKey;
        });

      if ('defaultWhen' in props.field && props.field.defaultWhen) {
        const formValues = getValues();
        const defaultKey = Object.keys(props.field.defaultWhen)[0];
        const defaultFieldValue = formValues.get(defaultKey);

        if (typeof defaultFieldValue === 'string') {
          defaultValue = (props.field.defaultWhen as any)[defaultKey][
            defaultFieldValue
          ];
        }
      }

      return (
        <FormField name={props.name!}>
          <AsyncSelectField
            allowClear
            disabled={props.disabled}
            url={replacedUrl}
            id={`${props.name}`}
            data-testid={props.name}
            label={props.field.title}
            dropdownClassName={`${props.name}-dropdown`}
            supportingText={props.field.description}
            errorMessage={fieldErrors[props.name!]}
            defaultValue={defaultValue}
            getPopupContainer={(node) => node.parentNode.parentNode}
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

      const values = getValues();

      const replacedUrl = props.field.url
        .replace('{{organization_id}}', organizationId.toString())
        .replace(/{{([\w.]+)}}/g, (_fullMatch, optKey) => {
          const replacedValue = values.get(optKey);
          return replacedValue || optKey;
        });

      let description = props.field.description;

      if ('descriptionWhen' in props.field && props.field.descriptionWhen) {
        const defaultKey = Object.keys(props.field.descriptionWhen)[0];
        const defaultFieldDescription = values.get(defaultKey);

        if (typeof defaultFieldDescription === 'string') {
          description =
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            // @ts-ignore
            props.field.descriptionWhen[defaultKey][defaultFieldDescription];
        }
      }

      let defaultValue = props.field.default
        ?.replace('{{pipeline_id}}', pipelineId.toString())
        ?.replace('{{block_name}}', blockConfig.name)
        ?.replace(/{{([\w.]+)}}/g, (_fullMatch, optKey) => {
          const values = getValues();
          const replacedValue = values.get(optKey);

          return replacedValue || optKey;
        });

      if ('defaultWhen' in props.field && props.field.defaultWhen) {
        const formValues = getValues();
        const defaultKey = Object.keys(props.field.defaultWhen)[0];
        const defaultFieldValue = formValues.get(defaultKey);

        if (typeof defaultFieldValue === 'string') {
          defaultValue = (props.field.defaultWhen as any)[defaultKey][
            defaultFieldValue
          ];
        }
      }

      return (
        <FormField name={props.name!}>
          <CreatableAsyncSelectField
            url={replacedUrl}
            disabled={props.disabled}
            schema={props.field.schema}
            id={`${props.name}`}
            label={props.field.title}
            supportingText={<ChatMarkdown>{description}</ChatMarkdown>}
            errorMessage={fieldErrors[props.name!]}
            dropdownClassName={`${props.name}-dropdown`}
            data-testid={props.name}
            defaultValue={defaultValue}
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
            getPopupContainer={(node) => node.parentNode.parentNode}
          />
        </FormField>
      );
    },
    [blockConfig.name, organizationId, pipelineId],
  );

  const shouldFieldBeDisplayed = (field: JSONSchemaField) => {
    if ('displayWhen' in field) {
      return shouldDisplay(field.displayWhen);
    }
    return true;
  };

  return (
    <ValidatedForm
      // @ts-ignore
      validator={validator}
      defaultValues={blockConfig}
      onSubmit={handleUpdate}
      className="w-full grow flex flex-col"
      onChange={(e: any) => {
        setLatestValues((prev) => ({ ...prev, [e.target.id]: e.target.value }));
      }}
      noValidate
    >
      <PageLeaveBlocker blocker={blocker} />

      <InputsProvider
        connections={connections}
        updateInputReset={updateInputReset}
        updateInputOptional={updateInputOptional}
      >
        <div className="space-y-5 grow">
          <div className="flex justify-end">
            <CopyConfigurationButton
              value={JSON.stringify({
                name: blockConfig.name,
                opts: blockConfig.opts,
                type: blockConfig.type,
              })}
            />
          </div>

          <div>
            <FormField name="name">
              <FieldLabel>Name</FieldLabel>
              <TextInputField
                name="name"
                defaultValue={blockConfig.name}
                readOnly={disabled}
              />
              <FieldMessage error={fieldsErrors.name}>
                The name of the chat.
              </FieldMessage>
            </FormField>
          </div>

          <HiddenField
            name="inputs"
            value={JSON.stringify(blockConfig.inputs)}
          />

          <Schema
            disabled={disabled}
            schema={blockConfig.block_type?.schema.properties.opts}
            shouldDisplay={shouldFieldBeDisplayed}
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
  updateInputOptional: (connection: IConfigConnection, value: boolean) => void;
}>({
  connections: [],
  updateInputReset: () => {},
  updateInputOptional: () => {},
});

const InputsProvider: React.FC<{
  connections: IConfigConnection[];
  updateInputReset: (connection: IConfigConnection, value: boolean) => void;
  updateInputOptional: (connection: IConfigConnection, value: boolean) => void;
  children: ReactNode;
}> = ({ connections, updateInputReset, updateInputOptional, children }) => {
  return (
    <>
      <InputsContext.Provider
        value={{ connections, updateInputReset, updateInputOptional }}
      >
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
      className="self-end text-xs text-muted-foreground underline bg-transparent !border-none hover:text-foreground"
    >
      Copy configuration
    </button>
  );
}

function shouldDisplayField(
  blockConfig: IBlockConfig,
  connections: IConfigConnection[],
) {
  return (
    displayWhen: Record<string, Record<string, any>> = {},
    ctx: Record<string, any> = {},
  ) => {
    const ctxConnections = buildConnectionsForCtx(
      [
        ...(blockConfig.block_type?.inputs ?? []),
        ...(blockConfig.block_type?.outputs ?? []),
        ...(blockConfig.block_type?.ios ?? []),
      ],
      {
        connections,
        blockName: blockConfig.name,
        ...ctx,
      },
    );

    return checkDisplayWhenConditions(displayWhen, {
      connections: ctxConnections,
      ...ctx,
    });
  };
}
type DisplayWhenCtx = {
  blockName: string;
  connections: IConfigConnection[];
} & Record<string, any>;

function buildConnectionsForCtx(connections: IIOType[], ctx: DisplayWhenCtx) {
  return connections.reduce(
    (acc, curr) => {
      const name = `${curr.name}_${curr.type}`;

      const connections = ctx.connections.filter(
        (conn) =>
          (conn.from.block_name === ctx.blockName &&
            conn.from.output_name === curr.name) ||
          (conn.to.block_name === ctx.blockName &&
            conn.to.input_name === curr.name),
      );

      return { ...acc, [name]: connections.length };
    },
    {} as Record<string, number>,
  );
}

function filterBlockConnections(
  connections: IConfigConnection[],
  blockConfig: IBlockConfig,
) {
  return connections.filter((conn) => conn.to.block_name === blockConfig.name);
}

interface PageLeaveBlockerProps {
  blocker: Blocker;
}

function PageLeaveBlocker({ blocker }: PageLeaveBlockerProps) {
  if (blocker.state !== 'blocked') return null;

  return (
    <ConfirmationModal
      isOpen={true}
      onClose={blocker.reset}
      onConfirm={async () => blocker.proceed()}
      onCancel={async () => blocker.reset()}
    >
      <p className="text-sm">You have unsaved changes that will be lost.</p>
    </ConfirmationModal>
  );
}
