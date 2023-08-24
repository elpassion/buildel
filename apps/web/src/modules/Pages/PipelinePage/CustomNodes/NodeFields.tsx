import { useCallback, useMemo } from 'react';
import { IField } from '~/modules/Pipelines/pipelines.types';
import { IEvent, useRunPipelineNode } from '../RunPipelineProvider';
import { Button, Input, Textarea } from '@elpassion/taco';

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
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      {fields.map((field) => (
        <Input
          id={field.data.name}
          key={field.data.name}
          type={field.data.type}
          name={field.data.name}
          placeholder="Start writing..."
        />
      ))}
      <Button type="submit" text="Send" size="xs" />
    </form>
  );
}

export function NodeFieldsOutput({ fields, blockName }: NodeFieldsProps) {
  const { events } = useRunPipelineNode(blockName);

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
