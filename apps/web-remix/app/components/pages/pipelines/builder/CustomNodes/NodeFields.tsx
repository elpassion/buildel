import React, { HTMLProps, useCallback, useEffect, useState } from "react";
import { Button, Icon } from "@elpassion/taco";
import { FileUpload } from "~/components/fileUpload/FileUpload";
import { FileUploadListPreview } from "~/components/fileUpload/FileUploadListPreview";
import { TextareaInput } from "~/components/form/inputs/textarea.input";
import { IFile } from "~/components/fileUpload/fileUpload.types";
import {
  KnowledgeBaseFileListResponse,
  KnowledgeBaseFileResponse,
} from "~/components/pages/knowledgeBase/contracts";
import { IBlockConfig, IField } from "../../pipeline.types";
import { AudioField } from "./AudioField";
import {
  IEvent,
  useRunPipeline,
  useRunPipelineNode,
} from "../RunPipelineProvider";
import { useCopyToClipboard } from "usehooks-ts";
import classNames from "classnames";

interface NodeFieldsProps {
  fields: IField[];
  block: IBlockConfig;
}

export function NodeFieldsForm({ fields, block }: NodeFieldsProps) {
  const blockName = block.name;
  const { status, organizationId, pipelineId } = useRunPipeline();
  const { push, clearEvents } = useRunPipelineNode(block);

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      clearEvents(blockName);

      const formData = new FormData(e.currentTarget);
      const fieldsData: Record<string, any> = {};

      for (let [key, value] of formData.entries()) {
        fieldsData[key] = value;
      }

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

  const uploadFile = useCallback(
    async (file: File): Promise<IFile> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "collection_name",
        block.opts.persist_in || `${pipelineId}_${blockName}`
      );

      const response = await fetch(
        `/super-api/organizations/${organizationId}/memories`,
        {
          body: formData,
          method: "POST",
        }
      ).then((res) => res.json());

      return { ...KnowledgeBaseFileResponse.parse(response), status: "done" };
    },
    [block.opts]
  );

  const removeFile = useCallback(
    async (id: number) => {
      return fetch(
        `/super-api/organizations/${organizationId}/memories/${id}`,
        {
          method: "DELETE",
        }
      );
    },
    [block.opts]
  );

  const fetchFiles = useCallback(async (): Promise<IFile[]> => {
    const response = await fetch(
      `/super-api/organizations/${organizationId}/memories?collection_name=${
        block.opts.persist_in || `${pipelineId}_${blockName}`
      }`
    ).then((res) => res.json());

    return KnowledgeBaseFileListResponse.parse(response).map((file) => ({
      ...file,
      status: "done",
    }));
  }, [block.opts]);

  const uploadAudioChunk = useCallback(
    (chunk: Blob, fieldName: string) => {
      const topic = `${blockName}:${fieldName}`;
      push(topic, chunk);
    },
    [blockName, push]
  );

  const convertToBlobAndUpload = useCallback(
    async (file: File, fieldName: string) => {
      try {
        const blob = await file.arrayBuffer().then((arrayBuffer) => {
          return new Blob([new Uint8Array(arrayBuffer)], {
            type: file.type,
          });
        });

        uploadAudioChunk(blob, fieldName);

        return {
          id: Math.random(),
          status: "done" as const,
          file_type: file.type,
          file_name: file.name,
          file_size: file.size,
        };
      } catch (err) {
        console.error(err);
        return {
          id: Math.random(),
          status: "error" as const,
          file_type: file.type,
          file_name: file.name,
          file_size: file.size,
        };
      }
    },
    [uploadAudioChunk]
  );

  const renderInput = useCallback(
    (field: IField) => {
      const { type, name } = field.data;

      if (type === "text") {
        return (
          <TextareaInput
            label=""
            id={name}
            name={name}
            placeholder="Input text to test the workflow"
            rows={5}
          />
        );
      } else if (type === "file") {
        return (
          <FileUpload
            multiple
            id={name}
            name={name}
            onUpload={uploadFile}
            onFetch={fetchFiles}
            onRemove={removeFile}
            preview={(props) => (
              <FileUploadListPreview {...props} className="max-h-[110px]" />
            )}
          />
        );
      } else if (field.data.type === "audio") {
        return (
          <AudioField
            name={field.data.name}
            onUpload={convertToBlobAndUpload}
            onChunk={uploadAudioChunk}
          />
        );
      }

      return <span>Unsupported input type - {type}</span>;
    },
    [fetchFiles, removeFile, uploadFile, status]
  );

  return (
    <form onSubmit={onSubmit}>
      {fields.map((field) => (
        <React.Fragment key={field.type}>{renderInput(field)}</React.Fragment>
      ))}

      {fields.length > 0 && fields[0].data.type === "text" ? (
        <Button
          type="submit"
          size="xs"
          disabled={status !== "running"}
          className="!text-xs mt-2"
          isFluid
        >
          Send
        </Button>
      ) : null}
    </form>
  );
}

export function NodeFieldsOutput({ fields, block }: NodeFieldsProps) {
  const { events } = useRunPipelineNode(block);

  const renderOutput = useCallback(
    (field: IField) => {
      const { type } = field.data;

      if (type === "text") {
        const text = getTextFieldsMessages(events, field.data.name);
        return <NodeTextOutput text={text} blockName={block.name} />;
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
  blockName: string;
}
function NodeTextOutput({ text, blockName }: NodeTextOutputProps) {
  return (
    <>
      <div className="mb-1 flex gap-1">
        <NodeCopyButton text={text} />

        <NodeDownloadButton blockName={blockName} text={text} />
      </div>

      <div className="prose break-words text-xs text-white w-full min-w-full max-w-full overflow-y-auto resize min-h-[100px] max-h-[500px] border border-neutral-200 rounded-md py-2 px-[10px]">
        <p>{text}</p>
      </div>
    </>
  );
}

function NodeActionButton({
  children,
  className,
  type,
  ...rest
}: HTMLProps<HTMLButtonElement>) {
  return (
    <button
      className={classNames(
        "text-xs text-neutral-100 rounded px-1 py-[2px] flex items-center gap-1 hover:text-primary-500",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function NodeCopyButton({ text }: { text: string }) {
  const [_value, copy] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleCopy = useCallback(async () => {
    await copy(text);
    setIsCopied(true);
    setTimeoutId(setTimeout(() => setIsCopied(false), 2000));
  }, [text, copy]);

  useEffect(() => {
    if (!timeoutId) return;
    return () => {
      clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return (
    <NodeActionButton className="w-[52px]" onClick={handleCopy}>
      {isCopied ? null : <Icon iconName="copy" />}
      <span className={classNames({ "text-green-600": isCopied })}>
        {isCopied ? "Copied!" : "Copy"}
      </span>
    </NodeActionButton>
  );
}

function NodeDownloadButton({
  text,
  blockName,
}: {
  text: string;
  blockName: string;
}) {
  const handleDownload = useCallback(() => {
    const filename = `${blockName}.txt`;
    const textBlob = new Blob([text], { type: "text/plain" });

    const downloadLink = document.createElement("a");
    downloadLink.href = window.URL.createObjectURL(textBlob);
    downloadLink.download = filename;

    downloadLink.click();

    window.URL.revokeObjectURL(downloadLink.href);
  }, [blockName, text]);

  return (
    <NodeActionButton onClick={handleDownload}>
      <Icon iconName="download" />
      <span>Download</span>
    </NodeActionButton>
  );
}

const getTextFieldsMessages = (events: IEvent[], outputName: string) => {
  const fieldEvents = events.filter((ev) => ev.output === outputName);

  return fieldEvents.map((ev) => ev.payload.message).join("");
};
