import React, { useCallback } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { Button, Input, Textarea } from '@elpassion/taco';
import { AudioInput } from '~/modules/Pages/PipelinePage/AudioInput';
import { IBlockConfig, IField } from '~/modules/Pipelines/pipelines.types';
import {
  IEvent,
  useRunPipeline,
  useRunPipelineNode,
} from '../RunPipelineProvider';

interface NodeFieldsProps {
  fields: IField[];
  block: IBlockConfig;
}

export function NodeFieldsForm({ fields, block }: NodeFieldsProps) {
  const formMethods = useForm();
  const { register } = formMethods;

  const blockName = block.name;
  const { status } = useRunPipeline();
  const { push, clearEvents } = useRunPipelineNode(block);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = new FormData(e.currentTarget);
      const fieldsData: Record<string, any> = {};
      // @ts-ignore
      for (let [key, value] of formData.entries()) {
        fieldsData[key] = value;
      }
      //todo should we clear block events after push click? if so we need an information about output block
      clearEvents(blockName);

      console.log(fieldsData);
      // what to do here?
      Object.keys(fieldsData).forEach((key) => {
        if (Array.isArray(fieldsData[key])) {
          fieldsData[key].forEach((value: any) => {
            push(`${blockName}:${key}`, value);
          });
        } else {
          push(`${blockName}:${key}`, fieldsData[key]);
        }
      });
    },
    [blockName, clearEvents, push],
  );

  const renderInput = useCallback((field: IField) => {
    const { type, name } = field.data;

    if (type === 'text' || type === 'file') {
      return (
        <Input
          id={name}
          type={field.data.type}
          placeholder="Start writing..."
          {...register(name)}
        />
      );
    } else if (field.data.type === 'audio') {
      return (
        <>
          <AudioInput name={name} />
        </>
      );
    }

    return <span>Unsupported input type - {type}</span>;
  }, []);

  return (
    <FormProvider {...formMethods}>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        {fields.map((field) => (
          <React.Fragment key={field.type}>{renderInput(field)}</React.Fragment>
        ))}
        <Button
          type="submit"
          text={status === 'running' ? 'Send' : 'Start pipeline'}
          size="xs"
          disabled={status !== 'running'}
        />
      </form>
    </FormProvider>
  );
}

export function NodeFieldsOutput({ fields, block }: NodeFieldsProps) {
  const { events } = useRunPipelineNode(block);

  const renderOutput = useCallback(
    (field: IField) => {
      const { type } = field.data;

      if (type === 'text') {
        return (
          <Textarea
            key={field.data.name}
            id={field.data.name}
            label=""
            value={getTextFieldsMessages(events, field.data.name)}
            className="w-full"
            rows={5}
            disabled
          />
        );
      } else if (type === 'audio') {
        return (
          <>
            <p>Audio output</p>
          </>
        );
      }

      return <span>Unsupported output type - {type}</span>;
    },
    [events],
  );

  return <div>{fields.map((field) => renderOutput(field))}</div>;
}

const getTextFieldsMessages = (events: IEvent[], outputName: string) => {
  const fieldEvents = events.filter((ev) => ev.output === outputName);

  return fieldEvents.map((ev) => ev.payload.message).join(' ');
};
