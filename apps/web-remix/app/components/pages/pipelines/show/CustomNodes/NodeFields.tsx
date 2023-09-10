import React, { useCallback } from "react";
import { Button, Input, Textarea } from "@elpassion/taco";
import { IBlockConfig, IField } from "../../list/contracts";
import {
  IEvent,
  useRunPipeline,
  useRunPipelineNode,
} from "../RunPipelineProvider";

interface NodeFieldsProps {
  fields: IField[];
  block: IBlockConfig;
}

export function NodeFieldsForm({ fields, block }: NodeFieldsProps) {
  const blockName = block.name;
  const { status } = useRunPipeline();
  const { push, clearEvents } = useRunPipelineNode(block);

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      clearEvents(blockName);

      // Object.keys(data).forEach((key) => {
      //   const topic = `${blockName}:${key}`;
      //   if (Array.isArray(data[key])) {
      //     data[key].forEach((value: any) => {
      //       push(topic, value);
      //     });
      //   } else {
      //     push(topic, data[key]);
      //   }
      // });

      // e.preventDefault();
      //
      const formData = new FormData(e.currentTarget);
      const fieldsData: Record<string, any> = {};

      for (let [key, value] of formData.entries()) {
        fieldsData[key] = value;
      }

      // what to do here?
      Object.keys(fieldsData).forEach((key) => {
        const topic = `${blockName}:${key}`;
        if (Array.isArray(fieldsData[key])) {
          fieldsData[key].forEach((value: any) => {
            push(topic, value);
          });
        } else {
          push(topic, fieldsData[key]);
        }
      });
    },
    [blockName, clearEvents, push]
  );

  const renderInput = useCallback((field: IField) => {
    const { type, name } = field.data;

    if (type === "text") {
      return (
        <Textarea
          label=""
          id={name}
          name={name}
          placeholder="Start writing..."
        />
      );
    } else if (type === "file") {
      return (
        <Input
          id={name}
          name={name}
          type={field.data.type}
          placeholder="Start writing..."
          multiple
        />
      );
    } else if (field.data.type === "audio") {
      return (
        <>
          <p>Audio input</p>
          {/*<AudioInput name={name} />*/}
        </>
      );
    }

    return <span>Unsupported input type - {type}</span>;
  }, []);

  return (
    <form onSubmit={onSubmit}>
      {fields.map((field) => (
        <React.Fragment key={field.type}>{renderInput(field)}</React.Fragment>
      ))}

      <Button
        type="submit"
        size="xs"
        text={status === "running" ? "Send" : "Start pipeline"}
        disabled={status !== "running"}
        className="mt-2"
        isFluid
      />
    </form>
  );
}

export function NodeFieldsOutput({ fields, block }: NodeFieldsProps) {
  const { events } = useRunPipelineNode(block);

  const renderOutput = useCallback(
    (field: IField) => {
      const { type } = field.data;

      if (type === "text") {
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
      } else if (type === "audio") {
        return (
          <>
            <p>Audio output</p>
          </>
        );
      }

      return <span>Unsupported output type - {type}</span>;
    },
    [events]
  );

  return <div>{fields.map((field) => renderOutput(field))}</div>;
}

const getTextFieldsMessages = (events: IEvent[], outputName: string) => {
  const fieldEvents = events.filter((ev) => ev.output === outputName);

  return fieldEvents.map((ev) => ev.payload.message).join("");
};
