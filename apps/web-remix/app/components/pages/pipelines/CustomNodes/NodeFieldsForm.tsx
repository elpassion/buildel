import React, { useCallback } from "react";
import { Button } from "@elpassion/taco";
import {
  IBlockConfig,
  IField,
} from "~/components/pages/pipelines/pipeline.types";
import { IFile } from "~/components/fileUpload/fileUpload.types";
import {
  KnowledgeBaseFileListResponse,
  KnowledgeBaseFileResponse,
} from "~/api/knowledgeBase/knowledgeApi.contracts";
import { TextareaInput } from "~/components/form/inputs/textarea.input";
import { FileUpload } from "~/components/fileUpload/FileUpload";
import { FileUploadListPreview } from "~/components/fileUpload/FileUploadListPreview";
import { useRunPipeline, useRunPipelineNode } from "../RunPipelineProvider";
import { AudioFieldTabs } from "./AudioFieldTabs";

interface NodeFieldsFormProps {
  fields: IField[];
  block: IBlockConfig;
  disabled?: boolean;
}

export function NodeFieldsForm({
  fields,
  block,
  disabled = false,
}: NodeFieldsFormProps) {
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
        block.opts.knowledge || `${pipelineId}_${blockName}`
      );

      const response = await fetch(
        `/super-api/organizations/${organizationId}/memory_collections/${block.opts.knowledge}/memories`,
        {
          body: formData,
          method: "POST",
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.errors?.detail ?? "Something went wrong!");
      }

      return { ...KnowledgeBaseFileResponse.parse(data), status: "done" };
    },
    [block.opts]
  );

  const removeFile = useCallback(
    async (id: number) => {
      return fetch(
        `/super-api/organizations/${organizationId}/memory_collections/${block.opts.knowledge}/memories/${id}`,
        {
          method: "DELETE",
        }
      );
    },
    [block.opts]
  );

  const fetchFiles = useCallback(async (): Promise<IFile[]> => {
    if (!block.opts.knowledge) return [];
    const response = await fetch(
      `/super-api/organizations/${organizationId}/memory_collections/${block.opts.knowledge}/memories`
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
          <div>
            <div className="bg-neutral-900 w-fit text-xs px-2 py-0.5 rounded !rounded-bl-none text-primary-500">
              {name}
            </div>
            <TextareaInput
              data-testid={`${blockName}-${name}`}
              style={{ borderTopLeftRadius: 0 }}
              label=""
              id={name}
              name={name}
              placeholder={`Input text to test the workflow`}
              rows={5}
              disabled={disabled}
            />
          </div>
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
            disabled={disabled}
            preview={(props) => (
              <FileUploadListPreview
                {...props}
                aria-label={`${blockName} memory list`}
                className="max-h-[110px]"
                disabled={disabled}
              />
            )}
          />
        );
      } else if (type === "audio") {
        return (
          <AudioFieldTabs
            disabled={disabled}
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
          aria-label={`Send message from: ${blockName}`}
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
