import { useCallback } from 'react';
import { Button, Input, Textarea } from '@elpassion/taco';
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
    const { type } = field.data;

    if (type === 'text' || type === 'file') {
      return (
        <Input
          id={field.data.name}
          key={field.data.name}
          type={field.data.type}
          name={field.data.name}
          placeholder="Start writing..."
        />
      );
    } else if (field.data.type === 'audio') {
      return <span>Record audio - not implemented</span>;
    }

    return <span>Unsupported input type - {type}</span>;
  }, []);

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      {fields.map((field) => renderInput(field))}
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
