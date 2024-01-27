import React, { useCallback } from "react";
import { IEvent, useRunPipelineNode } from "../RunPipelineProvider";
import {
  ChatMessageFormats,
  FormatMessageProps,
} from "~/components/chat/ChatMessageFormats";
import { IBlockConfig, IField } from "../pipeline.types";
import {
  NodeClearButton,
  NodeCopyButton,
  NodeDownloadButton,
} from "./NodeActionButtons";
import { AudioOutput } from "./AudioOutput";

interface NodeFieldsOutputProps {
  fields: IField[];
  block: IBlockConfig;
}

export function NodeFieldsOutput({ fields, block }: NodeFieldsOutputProps) {
  const { events, clearBlockEvents } = useRunPipelineNode(block);

  const renderOutput = useCallback(
    (field: IField) => {
      const { type } = field.data;

      const fieldEvents = getFieldEvents(events, field.data.name);

      if (type === "text") {
        const text = checkIfStringPayloads(fieldEvents)
          ? concatStringFieldsOutputs(fieldEvents)
          : concatJsonFieldsOutputs(fieldEvents);

        return (
          <>
            <div className="mb-1 flex gap-1">
              <NodeCopyButton text={text} />

              <NodeDownloadButton blockName={block.name} text={text} />

              <NodeClearButton onClear={() => clearBlockEvents(block.name)} />
            </div>

            <div className="w-full prose min-w-[280px] max-w-full overflow-y-auto resize min-h-[100px] max-h-[500px] border border-neutral-200 rounded-md py-2 px-[10px]">
              <ChatMessageFormats
                message={text}
                formatComponents={{
                  default: NodeTextFormatOutput,
                  json: NodeCodeMessageFormatOutput,
                  html: NodeCodeMessageFormatOutput,
                }}
              />
            </div>
          </>
        );
      } else if (type === "audio") {
        const audio =
          fieldEvents.length > 0 ? getAudioOutput(fieldEvents) : null;

        return <AudioOutput audio={audio} />;
      }

      return <span>Unsupported output type - {type}</span>;
    },
    [events]
  );

  return (
    <div>
      {fields.map((field) => (
        <React.Fragment key={field.data.name}>
          {renderOutput(field)}
        </React.Fragment>
      ))}
    </div>
  );
}

function NodeTextFormatOutput({ children }: FormatMessageProps) {
  return (
    <div className="prose break-words whitespace-pre-wrap text-xs text-white">
      {children}
    </div>
  );
}

function NodeCodeMessageFormatOutput({ children }: FormatMessageProps) {
  return (
    <pre className="my-1 bg-neutral-900 prose break-words whitespace-pre-wrap text-white text-xs">
      <code>{children}</code>
    </pre>
  );
}

function getFieldEvents(events: IEvent[], outputName: string) {
  return events.filter((ev) => ev.output === outputName);
}

function concatStringFieldsOutputs(events: IEvent[]) {
  return events.map((ev) => ev.payload.message).join("");
}

function concatJsonFieldsOutputs(events: IEvent[]) {
  try {
    return JSON.stringify(events.map((ev) => ev.payload.message));
  } catch (err) {
    return "Something went wrong...";
  }
}

function checkIfStringPayloads(events: IEvent[]) {
  return events.every((ev) => typeof ev.payload.message === "string");
}

function getAudioOutput(events: IEvent[]) {
  return new Blob(
    events.map((event) => event.payload),
    { type: "audio/mp3" }
  );
}
