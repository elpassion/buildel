'use client';
import { Badge, Button, Card, Icon, IconButton } from '@elpassion/taco';
import { Modal } from '@elpassion/taco/Modal';
import { startCase } from 'lodash';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import {
  BlockType,
  IOType,
  useBlockTypes,
  usePipeline,
  useUpdatePipeline,
} from '~/modules/Pipelines/hooks';
import { assert } from '~/utils/assert';
import { AddBlockForm } from './AddBlockForm';
import { FieldProps, Schema } from './Schema';

export function BuildPipelinePage({
  params,
}: {
  params: { pipelineId: string };
}) {
  const { data: pipeline } = usePipeline(params.pipelineId);
  const { data: blockTypes } = useBlockTypes();
  const updatePipeline = useUpdatePipeline(params.pipelineId, {
    onSuccess: () => {
      closeModal();
    },
  });
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
                      fields={{
                        string: StringSummaryField,
                        number: NumberSummaryField,
                      }}
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

function StringSummaryField({ field, name }: FieldProps) {
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
