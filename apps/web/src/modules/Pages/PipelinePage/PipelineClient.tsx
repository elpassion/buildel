'use client';

import { Badge, Button, Card, Icon, IconButton } from '@elpassion/taco';
import { Modal } from '@elpassion/taco/Modal';
import { startCase } from 'lodash';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { ENV } from '~/env.mjs';
import {
  BlockConfig,
  BlockType,
  getBlocksIO,
  useBlockTypes,
  usePipeline,
  usePipelineRun,
  useUpdatePipeline,
} from '~/modules/Pipelines/pipelines.hooks';
import { assert } from '~/utils/assert';
import { useModal } from '~/utils/hooks/useModal';
import { AddBlockForm } from './AddBlockForm';
import { ChannelForm } from './ChannelForm';
import { EditBlockForm } from './EditBlockForm';
import { Field, FieldProps, Schema } from './Schema';

export function PipelineClient({ params }: { params: { pipelineId: string } }) {
  const { data: pipeline } = usePipeline(params.pipelineId);
  const { data: blockTypes } = useBlockTypes();
  const { isModalOpen, openModal, closeModal: closeModalBase } = useModal();
  const [currentlyEditedBlock, setCurrentlyEditedBlock] =
    useState<z.TypeOf<typeof BlockConfig>>();
  const updatePipeline = useUpdatePipeline(params.pipelineId, {
    onSuccess: () => {
      closeModal();
    },
  });
  const [events, setEvents] = useState<any[]>([]);

  function closeModal() {
    setCurrentlyEditedBlock(undefined);
    closeModalBase();
  }
  function editBlock(block: z.TypeOf<typeof BlockConfig>) {
    setCurrentlyEditedBlock(block);
    openModal();
  }

  const { config } = pipeline;

  const methods = useForm({
    defaultValues: config,
  });

  const { setValue } = methods;

  useEffect(() => {
    setValue('blocks', config.blocks);
  }, [setValue, config.blocks]);

  const {
    status: runStatus,
    startRun,
    stopRun: stopRunBase,
    push,
    io,
  } = usePipelineRun(params.pipelineId, (block, output, payload) => {
    setEvents((events) => [...events, { block, output, payload }]);
  });
  // @ts-ignore
  window.push = push;

  const stopRun = () => {
    setEvents([]);
    stopRunBase();
  };

  if (!pipeline || !blockTypes) return null;

  const trigger = {
    name: 'Websocket',
    url: `${ENV.WEBSOCKET_URL}/pipelines/${params.pipelineId}`,
    ...getBlocksIO(config.blocks, blockTypes),
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
        forward_outputs: block.forward_outputs,
        blockType,
      };
    })
    .filter(Boolean) as {
    name: string;
    type: string;
    opts: Record<string, unknown>;
    forward_outputs: string[];
    blockType: z.TypeOf<typeof BlockType>;
  }[];

  function formatEvents(events: any[]) {
    let text = '';
    const sentences: string[] = [];
    for (const event of events) {
      if (event.block === 'chat' && event.output === 'sentences_output') {
        text = '';
        sentences.push(event.payload.message);
      } else if (event.block === 'chat' && event.output === 'output') {
        console.log(event.payload);
        text = text.concat(event.payload.message);
      }
    }
    return { text, sentences };
  }

  const { sentences, text } = formatEvents(events);

  return (
    <>
      <Modal
        isOpen={['running', 'starting'].includes(runStatus)}
        closeModal={stopRun}
      >
        <div className="p-8">
          <div className="text-xl font-medium">Pipeline is running</div>
          <div className="flex flex-col gap-2">
            <div>
              {sentences.map((sentence) => (
                <div key={sentence}>
                  <div className="text-sm font-medium">{sentence}</div>
                </div>
              ))}
              {text}
            </div>
            <ChannelForm
              io={io}
              onSubmit={(a) => {
                push(a.io.name, a.message);
                console.log(a);
              }}
            />
          </div>

          <div className="flex gap-2"></div>
          <div className="mt-8">
            <Button
              onClick={stopRun}
              text="Stop"
              variant="ghost"
              hierarchy="primary"
              size="xs"
              leftIcon={<Icon iconName="x" />}
            />
          </div>
        </div>
      </Modal>
      <Modal isOpen={isModalOpen} closeModal={closeModal} ariaHideApp={false}>
        <div className="p-8">
          <div className="flex space-x-6">
            <div>
              <div className="text-xl font-medium">
                {currentlyEditedBlock ? 'Edit block' : 'Add block'}
              </div>
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
            {currentlyEditedBlock ? (
              <EditBlockForm
                blockConfig={currentlyEditedBlock}
                onSubmit={(data) => {
                  assert(pipeline);
                  updatePipeline.mutate({
                    name: 'test',
                    config: {
                      version: pipeline.config.version,
                      blocks: pipeline.config.blocks.map((block) => {
                        if (block.name === currentlyEditedBlock.name) {
                          return data;
                        }
                        return block;
                      }),
                    },
                  });
                }}
                onDelete={() => {
                  assert(pipeline);
                  updatePipeline.mutate({
                    name: 'test',
                    config: {
                      version: pipeline.config.version,
                      blocks: pipeline.config.blocks.filter(
                        (block) => block.name !== currentlyEditedBlock.name,
                      ),
                    },
                  });
                }}
              />
            ) : (
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
            )}
          </div>
        </div>
      </Modal>
      <Button
        onClick={runStatus === 'idle' ? startRun : stopRun}
        text={runStatus === 'idle' ? 'Start' : 'Stop'}
        disabled={runStatus === 'starting'}
      />
      <div className="grid grid-cols-3 gap-12">
        <div>
          <div className="flex">Trigger</div>
          <div className="mt-2">
            <Card className="bg-white p-4">
              <div className="text-xs font-bold">{trigger.name}</div>
              <div className="text-xxs">{trigger.url}</div>
              <div className="mt-2">
                <p className="text-xxs font-medium text-neutral-400">Inputs</p>
                <div className="mb-0.5" />
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
                  <div onClick={() => editBlock(block)}>
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
                          array: ArraySummaryField,
                        }}
                      />
                    </div>
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

function ArraySummaryField({ field, name, fields, schema }: FieldProps) {
  const { watch } = useFormContext();
  const value: any[] = watch(name!, []);
  assert(field.type === 'array');

  return (
    <div className="mt-2 bg-white p-2">
      <p className="text-xxs font-medium text-neutral-400">{field.title}</p>
      <p className="text-xxs font-medium text-neutral-700">
        {value.map((_item, index) => {
          const fieldKey =
            name === null ? index.toString() : `${name}.${index}`;

          return (
            <Field
              key={index}
              field={field.items}
              fields={fields}
              name={fieldKey}
              schema={schema}
            />
          );
        })}
      </p>
    </div>
  );
}
