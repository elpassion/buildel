'use client';
import { Badge, Button, Card, Icon } from '@elpassion/taco';
import { z } from 'zod';
import {
  BlockType,
  IOType,
  JSONSchemaField,
  useBlockTypes,
  usePipeline,
} from '~/modules/Pipelines/hooks';
import { startCase } from 'lodash';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useEffect } from 'react';

export function BuildPipelinePage({
  params,
}: {
  params: { pipelineId: string };
}) {
  const { data: pipeline } = usePipeline(params.pipelineId);
  const { data: blockTypes } = useBlockTypes();

  const blockFields = pipeline ? pipeline.data.config.blocks : [];

  const methods = useForm({
    defaultValues: {
      blocks: [
        {
          name: 'test',
        },
        {
          name: 'test2',
        },
      ],
    },
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = methods;

  useEffect(() => {
    setValue('blocks', blockFields);
  }, [blockFields]);

  const onSubmit = (data: any) => console.log(data);

  if (!pipeline || !blockTypes) return null;

  const trigger = {
    name: 'Websocket',
    url: `ws://localhost:4000/pipelines/${params.pipelineId}`,
    inputs: pipeline.data.config.blocks.reduce((inputs, block) => {
      const blockType = blockTypes.data.find(
        (blockType) => blockType.type === block.type,
      );
      if (!blockType) return inputs;
      const blockInputs = blockType.inputs.map((input) => ({
        name: `${block.name}:${input.name}`,
        type: input.type,
      }));
      return [...inputs, ...blockInputs];
    }, [] as z.TypeOf<typeof IOType>[]),
    outputs: pipeline.data.config.blocks.reduce((outputs, block) => {
      const blockType = blockTypes.data.find(
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

  const blocks = pipeline.data.config.blocks
    .map((block) => {
      const blockType = blockTypes.data.find(
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

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-3 gap-12">
          <div>
            <div className="flex">Trigger</div>
            <div className="mt-2">
              <Card className="bg-white p-4">
                <div className="text-xs font-bold">{trigger.name}</div>
                <div className="text-xxs">{trigger.url}</div>
                <div className="mt-2">
                  <p className="text-xxs font-medium text-neutral-400">
                    Inputs
                  </p>
                  <div className="space-x-2">
                    {trigger.inputs.map((input) => (
                      <Badge text={input.name} size="sm" variant="outline" />
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
          <div>
            <div className="flex items-center">
              Blocks
              <Button
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
                <Card className="bg-white p-4">
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
          </div>
          <div>
            <div className="flex">Output</div>
            <div className="mt-2">
              <Card className="bg-white p-4">
                <div className="text-xs font-bold">{trigger.name}</div>
                <div className="text-xxs">{trigger.url}</div>
                <div className="mt-2">
                  <p className="text-xxs font-medium text-neutral-400">
                    Outputs
                  </p>
                  <div className="space-x-2">
                    {trigger.outputs.map((output) => (
                      <Badge text={output.name} size="sm" variant="outline" />
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

function Schema({ schema, name }: { schema: string; name: string | null }) {
  const schemaObj = JSON.parse(schema);
  return <Field field={schemaObj} name={name} schema={schemaObj} />;
}

function Field({
  field,
  name,
  schema,
}: {
  field: JSONSchemaField;
  name: string | null;
  schema: JSONSchemaField;
}) {
  const { watch } = useFormContext();
  const value = watch(name!);
  if (field.type === 'string') {
    return (
      <div>
        <p className="text-xxs font-medium text-neutral-400">{field.title}</p>
        <p className="text-xxs font-medium text-neutral-700">{value}</p>
      </div>
    );
  } else if (field.type === 'number') {
    return (
      <div>
        <p className="text-xxs font-medium">{field.title}</p>
        <input name={name!} />
        <p className="text-xxs">{field.description}</p>
      </div>
    );
  } else if (field.type === 'object') {
    return Object.entries(field.properties).map(([propertyKey, value]) => {
      const fieldKey = name === null ? propertyKey : `${name}.${propertyKey}`;
      return (
        <div key={name}>
          <Field field={value} name={fieldKey} schema={schema} />
        </div>
      );
    });
  } else if (field.type === 'array') {
    const fieldKey = name === null ? '0' : `${name}.0`;
    return (
      <div>
        {field.title} - {field.description}
        <Field field={field.items} name={fieldKey} schema={schema} />
      </div>
    );
  }
  console.warn('Unknown field type', field);
  return null;
}
