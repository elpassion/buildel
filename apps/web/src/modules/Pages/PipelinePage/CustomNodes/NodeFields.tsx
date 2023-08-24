import { useCallback } from 'react';
import { IField } from '~/modules/Pipelines/pipelines.types';
import { IEvent, useRunPipelineNode } from '../RunPipelineProvider';

interface NodeFieldsProps {
  fields: IField[];
  blockName: string;
}

export function NodeFieldsForm({ fields, blockName }: NodeFieldsProps) {
  const { push, clearEvents } = useRunPipelineNode(blockName);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = new FormData(e.currentTarget);
      const fieldsData: Record<string, any> = {};
      // @ts-ignore
      for (let [key, value] of formData.entries()) {
        fieldsData[key] = value;
      }
      //todo should we clear block events after push click?
      clearEvents(blockName);

      // what to do here?
      Object.keys(fieldsData).forEach((key) => {
        push(`${blockName}:${key}`, fieldsData[key]);
      });
    },
    [blockName, push],
  );

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field) => (
        //todo handle types different than input
        <input type={field.data.type} name={field.data.name} />
      ))}
      <button type="submit">Send</button>
    </form>
  );
}

export function NodeFieldsOutput({ fields, blockName }: NodeFieldsProps) {
  const { events } = useRunPipelineNode(blockName);

  return (
    <div>
      {fields.map((field) => (
        <p key={field.data.name}>
          {getFieldsMessages(events, field.data.name)}
        </p>
      ))}
    </div>
  );
}

const getFieldsMessages = (events: IEvent[], outputName: string) => {
  const fieldEvents = events.filter((ev) => ev.output === outputName);

  return fieldEvents.map((ev) => ev.payload.message).join(' ');
};
