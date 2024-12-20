import type { ReactNode } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { KnowledgeBaseFileResponse } from '~/api/knowledgeBase/knowledgeApi.contracts';
import { Button } from '~/components/ui/button';
import { assert } from '~/utils/assert';
import { cn } from '~/utils/cn';

import type { IFile, IFileUpload, IPreviewProps } from './fileUpload.types';

export interface FileUploadProps extends React.HTMLProps<HTMLInputElement> {
  preview?: (props: IPreviewProps) => ReactNode;
  onUpload?: (file: File) => Promise<IFile>;
  onFetch?: () => Promise<IFile[]>;
  onRemove?: (id: number | string) => Promise<any>;
  uploadText?: ReactNode;
  labelText?: ReactNode;
  fileList?: IFileUpload[];
}

export function FileUpload({
  name,
  preview,
  onUpload,
  onFetch,
  onRemove,
  disabled,
  uploadText = 'Browse files to upload',
  labelText = 'Upload files',
  className,
  onChange,
  fileList: propsFileList,
  ...rest
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileList, setFileList] = useState<IFileUpload[]>([]);

  const handleFetchFiles = useCallback(async () => {
    assert(onFetch);
    try {
      const files = await onFetch();

      setFileList(files);
    } catch (e) {
      console.error(e);
    }
  }, [onFetch]);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        return onChange(e);
      }

      const { files } = e.target;
      if (!files) return;

      [...files].forEach(async (file) => {
        const id = Math.random();
        setFileList((prev) => [
          {
            id: id,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            status: 'uploading',
          },
          ...prev,
        ]);
        onUpload?.(file)
          .then((res) => {
            setFileList((prev) =>
              prev.map((file) => {
                if (file.id === id) {
                  return { ...res, status: 'done' };
                }
                return file;
              }),
            );
          })
          .catch((e) => {
            setFileList((prev) =>
              prev.map((file) => {
                if (file.id === id) {
                  return { ...file, status: 'error', error: e };
                }
                return file;
              }),
            );
          })
          .finally(() => {
            e.target.value = '';
          });
      });
    },
    [onUpload, onChange],
  );

  const handleRemove = useCallback(
    async (id: string | number) => {
      try {
        if (onRemove && (typeof id === 'string' || id % 1 === 0)) {
          await onRemove(id);
        }

        setFileList((prev) => prev.filter((file) => file.id !== id));
      } catch (err) {
        console.error(err);
      }
    },
    [onRemove],
  );

  const handleSelectFiles = useCallback(() => {
    inputRef.current?.click();
  }, []);

  useEffect(() => {
    if (!onFetch) return;
    handleFetchFiles();
  }, [handleFetchFiles]);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={rest.id}>
        <span className="text-foreground text-xs font-medium">{labelText}</span>
        <input
          name={name}
          type="file"
          ref={inputRef}
          {...rest}
          disabled={disabled}
          onChange={handleUpload}
          hidden
        />
        <Button
          onClick={handleSelectFiles}
          size="xs"
          variant="outline"
          className="!text-xs"
          type="button"
          disabled={disabled}
          isFluid
        >
          {uploadText}
        </Button>
      </label>

      {preview?.({
        fileList: propsFileList ?? fileList,
        remove: onRemove ? handleRemove : undefined,
      })}
    </div>
  );
}

export function useFilesUpload({
  organizationId,
  pipelineId,
  runId,
}: {
  organizationId: number;
  pipelineId: number;
  runId: number | string;
}): {
  fileList: IFileUpload[];
  uploadFile: (file: File, fileBlockName?: string | null) => Promise<void>;
  removeFile: (fileId: number | string, fileBlockName?: string | null) => void;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  clearFiles: () => void;
  isUploading: boolean;
} {
  const [fileList, setFileList] = useState<IFileUpload[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFileRequest = useCallback(
    async (file: File, fileBlockName?: string | null): Promise<IFile> => {
      if (!fileBlockName) throw new Error('Missing file block name');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('block_name', fileBlockName);
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

      const fileUpload = {
        ...KnowledgeBaseFileResponse.parse(data),
        status: 'done' as const,
      };

      return fileUpload;
    },
    [organizationId, pipelineId, runId],
  );

  const removeFileRequest = useCallback(
    async (id: number | string, fileBlockName?: string | null) => {
      return fetch(
        `/super-api/organizations/${organizationId}/pipelines/${pipelineId}/runs/${runId}/input_file`,
        {
          method: 'DELETE',
          body: JSON.stringify({
            file_id: id,
            block_name: fileBlockName,
            input_name: 'input',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    },
    [organizationId, pipelineId, runId],
  );

  const uploadFile = async (file: File, fileBlockName?: string | null) => {
    const id = Math.random();
    setFileList((prev) => [
      {
        id: id,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        status: 'uploading',
      },
      ...prev,
    ]);
    try {
      const res = await uploadFileRequest(file, fileBlockName);
      setFileList((prev) =>
        prev.map((file) => {
          if (file.id === id) {
            return { ...res, status: 'done' };
          }
          return file;
        }),
      );
    } catch (e) {
      setFileList((prev) =>
        prev.map((file) => {
          if (file.id === id) {
            return { ...file, status: 'error', error: e };
          }
          return file;
        }),
      );
    } finally {
      if (!inputRef.current) return;
      inputRef.current.value = '';
    }
  };

  const removeFile = useCallback(
    async (id: number | string, fileBlockName?: string | null) => {
      try {
        if (typeof id === 'string' || id % 1 === 0) {
          await removeFileRequest(id, fileBlockName);
        }

        setFileList((prev) => prev.filter((file) => file.id !== id));
      } catch (err) {
        console.error(err);
      }
    },
    [removeFileRequest, setFileList],
  );

  const clearFiles = useCallback(() => {
    setFileList([]);
  }, [setFileList]);

  return {
    fileList,
    uploadFile,
    removeFile,
    inputRef,
    clearFiles,
    isUploading: fileList.some((upload) => upload.status === 'uploading'),
  };
}
