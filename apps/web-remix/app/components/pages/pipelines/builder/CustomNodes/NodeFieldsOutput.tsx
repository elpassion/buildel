import React, { useCallback } from "react";
import { IBlockConfig, IField } from "../../pipeline.types";
import { IEvent, useRunPipelineNode } from "../RunPipelineProvider";
import { NodeCopyButton, NodeDownloadButton } from "./NodeActionButtons";

interface NodeFieldsOutputProps {
  fields: IField[];
  block: IBlockConfig;
}

export function NodeFieldsOutput({ fields, block }: NodeFieldsOutputProps) {
  const { events } = useRunPipelineNode(block);

  const renderOutput = useCallback(
    (field: IField) => {
      const { type } = field.data;

      if (type === "text") {
        const text = getTextFieldsMessages(events, field.data.name);
        return (
          <>
            <div className="mb-1 flex gap-1">
              <NodeCopyButton text={text} />

              <NodeDownloadButton blockName={block.name} text={text} />
            </div>

            <NodeTextOutput text={text} />
          </>
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

interface NodeTextOutputProps {
  text: string;
}
function NodeTextOutput({ text }: NodeTextOutputProps) {
  return (
    <div className="prose break-words text-xs text-white w-full min-w-[280px] max-w-full overflow-y-auto resize min-h-[100px] max-h-[500px] border border-neutral-200 rounded-md py-2 px-[10px]">
      <p>{text}</p>
    </div>
  );
}

const getTextFieldsMessages = (events: IEvent[], outputName: string) => {
  const fieldEvents = events.filter((ev) => ev.output === outputName);

  return fieldEvents.map((ev) => ev.payload.message).join("");
};
