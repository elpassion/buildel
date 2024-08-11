import React, { useCallback } from 'react';

import {
  KnowledgeBaseFileListResponse,
  KnowledgeBaseFileResponse,
} from '~/api/knowledgeBase/knowledgeApi.contracts';
import { FileUpload } from '~/components/fileUpload/FileUpload';
import type { IFile } from '~/components/fileUpload/fileUpload.types';
import { FileUploadListPreview } from '~/components/fileUpload/FileUploadListPreview';
import { TextareaInput } from '~/components/form/inputs/textarea.input';
import type {
  IBlockConfig,
  IField,
} from '~/components/pages/pipelines/pipeline.types';
import { Button } from '~/components/ui/button';

import { useRunPipeline, useRunPipelineNode } from '../../RunPipelineProvider';
import { AudioFieldTabs } from './AudioFieldTabs';

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
  const { status, organizationId, pipelineId, runId } = useRunPipeline();
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
    [blockName, clearEvents, push],
  );

  const uploadFile = useCallback(
    async (file: File): Promise<IFile> => {
      async function createFile(fileUpload: File) {
        const formData = new FormData();
        formData.append('file', fileUpload);
        formData.append(
          'collection_name',
          block.opts.knowledge || `${pipelineId}_${blockName}`,
        );

        const res = await fetch(
          `/super-api/organizations/${organizationId}/memory_collections/${block.opts.knowledge}/files`,
          {
            body: formData,
            method: 'POST',
          },
        );

        if (!res.ok) {
          const body = await res.json();
          throw new Error(body?.errors?.detail ?? 'Something went wrong!');
        }

        return res.json();
      }

      async function refreshFileStatus(fileId: string | number) {
        const res = await fetch(
          `/super-api/organizations/${organizationId}/memory_collections/${block.opts.knowledge}/files/${fileId}`,
        );

        if (!res.ok) {
          const body = await res.json();
          throw new Error(body?.errors?.detail ?? 'Something went wrong!');
        }

        const data = await res.json();

        if (data.data.status === 'success') {
          return data;
        } else if (data.data.status === 'error') {
          throw new Error();
        } else {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              refreshFileStatus(fileId).then(resolve).catch(reject);
            }, 1000);
          });
        }
      }

      async function createMemory(fileId: string | number) {
        const res = await fetch(
          `/super-api/organizations/${organizationId}/memory_collections/${block.opts.knowledge}/memories`,
          {
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              file_id: fileId,
            }),
            method: 'POST',
          },
        );

        if (!res.ok) {
          const body = await res.json();
          throw new Error(body?.errors?.detail ?? 'Something went wrong!');
        }

        return res;
      }

      const {
        data: { id: fileId },
      } = await createFile(file);
      await refreshFileStatus(fileId);
      const response = await createMemory(fileId);
      return {
        ...KnowledgeBaseFileResponse.parse(await response.json()),
        status: 'done',
      };
    },
    [block.opts],
  );

  const uploadFileTemporary = useCallback(
    async (file: File): Promise<IFile> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('block_name', blockName);
      formData.append('input_name', 'input');

      const response = await fetch(
        `/super-api/organizations/${organizationId}/pipelines/${pipelineId}/runs/${runId}/input_file`,
        {
          body: formData,
          method: 'POST',
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.errors?.detail ?? 'Something went wrong!');
      }

      return { ...KnowledgeBaseFileResponse.parse(data), status: 'done' };
    },
    [block.opts, runId],
  );

  const removeFileTemporary = useCallback(
    async (id: string | number) => {
      return fetch(
        `/super-api/organizations/${organizationId}/pipelines/${pipelineId}/runs/${runId}/input_file`,
        {
          body: JSON.stringify({
            file_id: id,
            block_name: blockName,
            input_name: 'input',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'DELETE',
        },
      );
    },
    [block.opts, runId],
  );

  const removeFile = useCallback(
    async (id: string | number) => {
      return fetch(
        `/super-api/organizations/${organizationId}/memory_collections/${block.opts.knowledge}/memories/${id}`,
        {
          method: 'DELETE',
        },
      );
    },
    [block.opts],
  );

  const fetchFiles = useCallback(async (): Promise<IFile[]> => {
    if (!block.opts.knowledge) return [];
    const response = await fetch(
      `/super-api/organizations/${organizationId}/memory_collections/${block.opts.knowledge}/memories`,
    ).then((res) => res.json());

    return KnowledgeBaseFileListResponse.parse(response).map((file) => ({
      ...file,
      status: 'done',
    }));
  }, [block.opts]);

  const uploadAudioChunk = useCallback(
    (chunk: Blob, fieldName: string) => {
      const topic = `${blockName}:${fieldName}`;
      push(topic, chunk);
    },
    [blockName, push],
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
          status: 'done' as const,
          file_type: file.type,
          file_name: file.name,
          file_size: file.size,
        };
      } catch (err) {
        console.error(err);
        return {
          id: Math.random(),
          status: 'error' as const,
          file_type: file.type,
          file_name: file.name,
          file_size: file.size,
        };
      }
    },
    [uploadAudioChunk],
  );

  const renderInput = useCallback(
    (field: IField) => {
      const { type, name } = field.data;

      if (type === 'text') {
        return (
          <div>
            <div className="bg-muted w-fit text-xs px-2 py-0.5 rounded border border-input !rounded-bl-none text-foreground">
              {name}
            </div>
            <TextareaInput
              data-testid={`${blockName}-${name}`}
              style={{ borderTopLeftRadius: 0 }}
              id={name}
              name={name}
              placeholder={`Input text to test the workflow`}
              rows={5}
              disabled={disabled}
            />
          </div>
        );
      } else if (type === 'file') {
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
      } else if (type === 'file_temporary' || 'image') {
        return (
          <FileUpload
            multiple
            id={name}
            name={name}
            onUpload={uploadFileTemporary}
            onRemove={removeFileTemporary}
            disabled={status !== 'running' || disabled}
            preview={(props) => (
              <FileUploadListPreview
                {...props}
                aria-label={`${blockName} temporary list`}
                className="max-h-[110px]"
                disabled={disabled}
              />
            )}
          />
        );
      } else if (type === 'audio') {
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
    [fetchFiles, removeFile, uploadFile, status],
  );

  return (
    <form onSubmit={onSubmit}>
      {fields.map((field) => (
        <React.Fragment key={field.type}>{renderInput(field)}</React.Fragment>
      ))}

      {fields.length > 0 && fields[0].data.type === 'text' ? (
        <Button
          aria-label={`Send message from: ${blockName}`}
          type="submit"
          size="xxs"
          disabled={status !== 'running'}
          className=" mt-2"
          isFluid
        >
          Send
        </Button>
      ) : null}
    </form>
  );
}
