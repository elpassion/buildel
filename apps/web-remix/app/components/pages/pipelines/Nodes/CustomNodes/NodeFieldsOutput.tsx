import React, { useCallback } from 'react';
import { useBoolean } from 'usehooks-ts';

import { ChatMarkdown } from '~/components/chat/ChatMarkdown';
import {
  addReferenceToLinks,
  EmbedLinksList,
} from '~/components/chat/ChatMessages';
import { ToggleInput } from '~/components/form/inputs/toggle.input';

import type { IBlockConfig, IField } from '../../pipeline.types';
import { useRunPipelineNode } from '../../RunPipelineProvider';
import type { IEvent } from '../../RunPipelineProvider';
import { AudioOutput } from './AudioOutput';
import { FileOutput } from './FileOutput';
import {
  NodeClearButton,
  NodeCopyButton,
  NodeDownloadButton,
} from './NodeActionButtons';

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

      if (type === 'text') {
        const text = checkIfStringPayloads(fieldEvents)
          ? concatStringFieldsOutputs(fieldEvents)
          : concatJsonFieldsOutputs(fieldEvents);

        return (
          <TextOutput
            content={text}
            blockName={block.name}
            onClear={clearBlockEvents}
          />
        );
      } else if (type === 'audio') {
        const audio =
          fieldEvents.length > 0 ? getAudioOutput(fieldEvents) : null;

        return <AudioOutput audio={audio} />;
      } else if (type === 'file' || type === 'image') {
        const files =
          fieldEvents.length > 0 ? fieldEvents.map(getFileOutput) : [];

        return <FileOutput files={files} />;
      }

      return <span>Unsupported output type - {type}</span>;
    },
    [events],
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

function getFieldEvents(events: IEvent[], outputName: string) {
  return events.filter((ev) => ev.output === outputName);
}

function concatStringFieldsOutputs(events: IEvent[]) {
  return events.map((ev) => ev.payload.message).join('');
}

function concatJsonFieldsOutputs(events: IEvent[]) {
  try {
    return JSON.stringify(events.map((ev) => ev.payload.message));
  } catch (err) {
    return 'Something went wrong...';
  }
}

function checkIfStringPayloads(events: IEvent[]) {
  return events.every((ev) => typeof ev.payload.message === 'string');
}

function getAudioOutput(events: IEvent[]) {
  return new Blob(
    events.map((event) => event.payload),
    { type: 'audio/mp3' },
  );
}

function getFileOutput(event: IEvent) {
  return new Blob([event.payload], { type: 'file' });
}

interface TextOutputProps {
  content: string;
  blockName: string;
  onClear: (blockName: string) => void;
}

function TextOutput({ content, blockName, onClear }: TextOutputProps) {
  const { value: isRaw, toggle: toggleRaw } = useBoolean(false);
  const { message, links } = addReferenceToLinks(content);

  return (
    <>
      <div className="mb-1 flex gap-1">
        <label className="flex gap-1 items-center">
          <span className="text-xs text-muted-foreground">Raw</span>
          <ToggleInput
            size="sm"
            value={`${isRaw}`}
            checked={isRaw}
            onCheckedChange={toggleRaw}
          />
        </label>

        <NodeCopyButton text={content} />

        <NodeDownloadButton blockName={blockName} text={content} />

        <NodeClearButton onClear={() => onClear(blockName)} />
      </div>
      <div className="select-text cursor-default text-foreground w-full prose min-w-[280px] max-w-full overflow-y-auto resize min-h-[100px] max-h-[500px] border border-input rounded-md py-2 px-[10px] text-xs">
        {isRaw ? (
          content
        ) : (
          <>
            <ChatMarkdown>{message}</ChatMarkdown>
            <EmbedLinksList links={links} />
          </>
        )}
      </div>
    </>
  );
}
