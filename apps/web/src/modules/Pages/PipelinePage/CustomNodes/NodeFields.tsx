import React, { useCallback } from 'react';
import { Button, Input, Textarea } from '@elpassion/taco';
import { MicrophoneRecorder } from '~/components/MicrophoneRecorder';
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

      // what to do here?
      Object.keys(fieldsData).forEach((key) => {
        push(`${blockName}:${key}`, fieldsData[key]);
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
          name={name}
          placeholder="Start writing..."
        />
      );
    } else if (field.data.type === 'audio') {
      return (
        <>
          <div>
            <MicrophoneRecorder
              name={name}
              onStartCallback={async (event) => {
                // TODO (hub33k): handle mic
                // console.log(await event.data.arrayBuffer());
              }}
              onStopCallback={() => {}}
            />
          </div>
          <div className="mb-4" />
          <Input
            id={name}
            type={'file'}
            name={name}
            accept="audio/*"
            placeholder="Upload audio file..."
            required
            // disabled
            // onChange={(e) => {
            //   if (e.target.files) {
            //     // console.log(e.target.files[0]);
            //   }
            // }}
          />
        </>
      );
    }

    return <span>Unsupported input type - {type}</span>;
  }, []);

  return (
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
