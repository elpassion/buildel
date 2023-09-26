import React, { useCallback } from "react";
import { Button } from "@elpassion/taco";
import {
  FileListResponse,
  FileResponse,
} from "~/components/pages/pipelines/contracts";
import { FileUpload } from "~/components/fileUpload/FileUpload";
import { FileUploadListPreview } from "~/components/fileUpload/FileUploadListPreview";
import { TextareaInput } from "~/components/form/inputs/textarea.input";
import { IFile } from "~/components/fileUpload/fileUpload.types";
import { IBlockConfig, IField } from "../../pipeline.types";
import {
  IEvent,
  useRunPipeline,
  useRunPipelineNode,
} from "../RunPipelineProvider";
import { AudioField } from "./AudioField";

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

  const uploadFile = useCallback(async (file: File): Promise<IFile> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("collection_name", `${pipelineId}_${blockName}`);

    const response = await fetch(
      `/super-api/organizations/${organizationId}/memories`,
      {
        body: formData,
        method: "POST",
      }
    ).then((res) => res.json());

    return { ...FileResponse.parse(response), status: "done" };
  }, []);

  const removeFile = useCallback(async (id: number) => {
    return fetch(`/super-api/organizations/${organizationId}/memories/${id}`, {
      method: "DELETE",
    });
  }, []);

  const fetchFiles = useCallback(async (): Promise<IFile[]> => {
    const response = await fetch(
      `/super-api/organizations/${organizationId}/memories?collection_name=${pipelineId}_${blockName}`
    ).then((res) => res.json());

    return FileListResponse.parse(response).map((file) => ({
      ...file,
      status: "done",
    }));
  }, []);

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
            preview={FileUploadListPreview}
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
        return (
          <div className="w-full min-w-full max-w-full overflow-y-auto resize min-h-[100px] max-h-[500px] border border-neutral-200 rounded-md py-2 px-[10px]">
            <p className="text-xs text-white">
              {getTextFieldsMessages(events, field.data.name)}
            </p>
          </div>
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

const getTextFieldsMessages = (events: IEvent[], outputName: string) => {
  const fieldEvents = events.filter((ev) => ev.output === outputName);

  return fieldEvents.map((ev) => ev.payload.message).join("");
};
