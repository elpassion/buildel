'use client';
import {
  Badge,
  Button,
  Card,
  Icon,
  IconButton,
  Input,
  InputNumber,
} from '@elpassion/taco';
import { Modal } from '@elpassion/taco/Modal';
import { IDropdownOption, SelectDropdown } from '@elpassion/taco/Dropdown';
import { z } from 'zod';
import {
  BlockConfig,
  BlockType,
  IOType,
  JSONSchemaField,
  useBlockTypes,
  usePipeline,
  useUpdatePipeline,
} from '~/modules/Pipelines/hooks';
import { startCase } from 'lodash';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { createContext, useEffect, useState } from 'react';
import { assert } from '~/utils/assert';

export function BuildPipelinePage({
  params,
}: {
  params: { pipelineId: string };
}) {
  const { data: pipeline } = usePipeline(params.pipelineId);
  const updatePipeline = useUpdatePipeline(params.pipelineId, {
    onSuccess: () => {
      closeModal();
    },
  });

  const { data: blockTypes } = useBlockTypes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const config = pipeline ? pipeline.config : { version: '0', blocks: [] };

  const methods = useForm({
    defaultValues: config,
  });

  const { setValue } = methods;

  useEffect(() => {
    setValue('blocks', config.blocks);
  }, [config.blocks]);

  if (!pipeline || !blockTypes) return null;

  const trigger = {
    name: 'Websocket',
    url: `ws://localhost:4000/pipelines/${params.pipelineId}`,
    inputs: pipeline.config.blocks.reduce((inputs, block) => {
      const blockType = blockTypes.find(
        (blockType) => blockType.type === block.type,
      );
      if (!blockType) return inputs;
      const blockInputs = blockType.inputs.map((input) => ({
        name: `${block.name}:${input.name}`,
        type: input.type,
      }));
      return [...inputs, ...blockInputs];
    }, [] as z.TypeOf<typeof IOType>[]),
    outputs: pipeline.config.blocks.reduce((outputs, block) => {
      const blockType = blockTypes.find(
        (blockType) => blockType.type === block.type,
      );
      if (!blockType) return outputs;
      const blockOutputs = blockType.outputs.map((output) => ({
        name: `${block.name}:${output.name}`,
        type: output.type,
      }));
      return [...outputs, ...blockOutputs];
    }, [] as z.TypeOf<typeof IOType>[]),
  };

  const blocks = pipeline.config.blocks
    .map((block) => {
      const blockType = blockTypes.find(
        (blockType) => blockType.type === block.type,
      );
      if (!blockType) return null;
      return {
        name: block.name,
        type: blockType.type,
        opts: block.opts,
        blockType,
      };
    })
    .filter(Boolean) as {
    name: string;
    type: string;
    opts: {};
    blockType: z.TypeOf<typeof BlockType>;
  }[];

  function openModal(): void {
    setIsModalOpen(true);
  }

  function closeModal(): void {
    setIsModalOpen(false);
  }

  return (
    <>
      <Modal isOpen={isModalOpen} closeModal={closeModal}>
        <div className="p-8">
          <div className="flex space-x-6">
            <div>
              <div className="text-xl font-medium">Add block</div>
              <div className="mt-4 text-sm text-neutral-400">
                Blocks are modules within your app that can work simultaneously.
              </div>
            </div>
            <div>
              <IconButton
                onClick={closeModal}
                icon={<Icon iconName="x" />}
                variant="outlined"
                size="sm"
              />
            </div>
          </div>
          <div className="mt-8">
            <AddBlockForm
              blockTypes={blockTypes}
              onSubmit={(data) => {
                assert(pipeline);
                updatePipeline.mutate({
                  name: 'test',
                  config: {
                    version: pipeline.config.version,
                    blocks: [...pipeline.config.blocks, data],
                  },
                });
              }}
            />
          </div>
        </div>
      </Modal>
      <div className="grid grid-cols-3 gap-12">
        <div>
          <div className="flex">Trigger</div>
          <div className="mt-2">
            <Card className="bg-white p-4">
              <div className="text-xs font-bold">{trigger.name}</div>
              <div className="text-xxs">{trigger.url}</div>
              <div className="mt-2">
                <p className="text-xxs font-medium text-neutral-400">Inputs</p>
                <div className="flex flex-wrap gap-2">
                  {trigger.inputs.map((input) => (
                    <Badge
                      key={input.name}
                      text={input.name}
                      size="sm"
                      variant="outline"
                    />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
        <div>
          <FormProvider {...methods}>
            <div className="flex items-center">
              Blocks
              <Button
                onClick={openModal}
                text="Add"
                variant="ghost"
                hierarchy="primary"
                size="xs"
                className="ml-auto"
                leftIcon={<Icon iconName="plus" />}
              />
            </div>
            <div className="mt-2 space-y-2 border p-2">
              {blocks.map((block, index) => (
                <Card className="bg-white p-4" key={block.name}>
                  <div className="text-xs font-bold">
                    {startCase(block.type)}
                  </div>
                  <div className="text-xxs">{block.name}</div>
                  <div className="mt-2 border bg-neutral-50 p-2">
                    <Schema
                      schema={block.blockType.schema}
                      name={`blocks.${index}`}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </FormProvider>
        </div>
        <div>
          <div className="flex">Output</div>
          <div className="mt-2">
            <Card className="bg-white p-4">
              <div className="text-xs font-bold">{trigger.name}</div>
              <div className="text-xxs">{trigger.url}</div>
              <div className="mt-2">
                <p className="text-xxs font-medium text-neutral-400">Outputs</p>
                <div className="flex flex-wrap gap-2">
                  {trigger.outputs.map((output) => (
                    <Badge
                      key={output.name}
                      text={output.name}
                      size="sm"
                      variant="outline"
                    />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function AddBlockForm({
  blockTypes,
  onSubmit,
}: {
  blockTypes: z.TypeOf<typeof BlockType>[];
  onSubmit: (data: z.TypeOf<typeof BlockConfig>) => void;
}) {
  const methods = useForm<z.TypeOf<typeof BlockConfig>>({
    defaultValues: {
      name: '',
      forward_outputs: [],
      opts: {},
    },
  });
  const { handleSubmit, register, setValue, watch } = methods;
  const blockType = register('type');
  const blockTypeValue = watch('type');

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <SelectDropdown
          id={blockType.name}
          name={blockType.name}
          ref={blockType.ref}
          onSelect={(item) => {
            setValue(
              blockType.name,
              item ? (item as IDropdownOption).value : null!,
            );
          }}
          options={blockTypes.map((blockType) => ({
            id: blockType.type,
            label: startCase(blockType.type),
            value: blockType.type,
          }))}
          isMulti={false}
          isClearable
        />
        <div className="mt-6 space-y-4">
          {blockTypeValue && (
            <Schema
              schema={
                blockTypes.find(
                  (blockType) => blockType.type === blockTypeValue,
                )!.schema
              }
              name={null}
              fields={{
                string: StringField,
                number: NumberField,
              }}
            />
          )}
        </div>
        <Button
          text="Confirm"
          type="submit"
          variant="filled"
          className="mt-6"
        />
      </form>
    </FormProvider>
  );
}

function Schema({
  schema,
  name,
  fields,
}: {
  schema: string;
  name: string | null;
  fields?: { string?: React.FC<FieldProps>; number?: React.FC<FieldProps> };
}) {
  const schemaObj = JSON.parse(schema);
  return (
    <Field
      field={schemaObj}
      name={name}
      schema={schemaObj}
      fields={{
        string: fields?.string || StringSummaryField,
        number: fields?.number || NumberSummaryField,
      }}
    />
  );
}

function Field({
  field,
  name,
  schema,
  fields,
}: {
  field: JSONSchemaField;
  name: string | null;
  schema: JSONSchemaField;
  fields: { string: React.FC<FieldProps>; number: React.FC<FieldProps> };
}) {
  if (field.type === 'string') {
    return <fields.string field={field} name={name} schema={schema} />;
  } else if (field.type === 'number') {
    return <fields.number field={field} name={name} schema={schema} />;
  } else if (field.type === 'object') {
    return Object.entries(field.properties).map(([propertyKey, value]) => {
      const fieldKey = name === null ? propertyKey : `${name}.${propertyKey}`;
      return (
        <div key={name}>
          <Field
            field={value}
            name={fieldKey}
            schema={schema}
            fields={fields}
          />
        </div>
      );
    });
  } else if (field.type === 'array') {
    const fieldKey = name === null ? '0' : `${name}.0`;
    return (
      <div>
        {field.title} - {field.description}
        <Field
          field={field.items}
          name={fieldKey}
          schema={schema}
          fields={fields}
        />
      </div>
    );
  }
  console.warn('Unknown field type', field);
  return null;
}

function StringField({ field, name }: FieldProps) {
  const { register } = useFormContext();
  assert(field.type === 'string');
  return (
    <Input
      id={name!}
      {...register(name!)}
      label={field.title}
      supportingText={field.description}
    />
  );
}

function NumberField({ field, name }: FieldProps) {
  const { register, setValue } = useFormContext();
  const { onChange, ...methods } = register(name!);
  assert(field.type === 'number');
  return (
    <InputNumber
      id={name!}
      onChange={(value) => setValue(name!, value)}
      {...methods}
      label={field.title}
      supportingText={field.description}
    />
  );
}

function StringSummaryField({ field, name, schema }: FieldProps) {
  console.log(name);
  const { watch } = useFormContext();
  const value = watch(name!);
  assert(field.type === 'string');

  return (
    <div>
      <p className="text-xxs font-medium text-neutral-400">{field.title}</p>
      <p className="text-xxs font-medium text-neutral-700">{value}</p>
    </div>
  );
}

function NumberSummaryField({ field, name }: FieldProps) {
  const { watch } = useFormContext();
  const value = watch(name!);
  assert(field.type === 'number');

  return (
    <div>
      <p className="text-xxs font-medium text-neutral-400">{field.title}</p>
      <p className="text-xxs font-medium text-neutral-700">{value}</p>
    </div>
  );
}

interface FieldProps {
  field: JSONSchemaField;
  name: string | null;
  schema: JSONSchemaField;
}
