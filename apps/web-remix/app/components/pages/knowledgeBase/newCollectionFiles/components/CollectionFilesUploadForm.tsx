import React, { useState } from 'react';
import { Form, useLoaderData, useRevalidator } from '@remix-run/react';

import { FileUpload } from '~/components/fileUpload/FileUpload';
import type { IFileUpload } from '~/components/fileUpload/fileUpload.types';
import { FileUploadListPreview } from '~/components/fileUpload/FileUploadListPreview';
import { errorToast } from '~/components/toasts/errorToast';
import { loadingToast } from '~/components/toasts/loadingToast';
import { Button } from '~/components/ui/button';

import type { loader } from '../loader.server';

type IExtendedFileUpload = IFileUpload & { file: File };

export const CollectionFilesUploadForm = () => {
  const revalidator = useRevalidator();
  const { organizationId, collectionName, collectionId } =
    useLoaderData<typeof loader>();
  const [items, setItems] = useState<IExtendedFileUpload[]>([]);

  const isUploading = items.some(
    (fileUpload) => fileUpload.status === 'uploading',
  );
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (!files) return;

    const uploadFiles: IExtendedFileUpload[] = [...files].map((file) => {
      return {
        id: Math.random(),
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        status: 'done',
        file,
      };
    });

    setItems((prev) => [...uploadFiles, ...prev]);
  };
  const removeFile = async (id: number | string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateStatus = (
    id: number | string,
    status: 'done' | 'error' | 'uploading',
  ) => {
    setItems((prev) =>
      prev.map((fileUpload) => {
        if (fileUpload.id === id) {
          fileUpload.status = status;
        }

        return fileUpload;
      }),
    );
  };

  const handleUploadFile = async (fileUpload: IExtendedFileUpload) => {
    async function createFile(fileUpload: IExtendedFileUpload) {
      const formData = new FormData();
      formData.append('file', fileUpload.file);
      formData.append('collection_name', collectionName);

      handleUpdateStatus(fileUpload.id, 'uploading');

      const res = await fetch(
        `/super-api/organizations/${organizationId}/memory_collections/${collectionId}/files`,
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
        `/super-api/organizations/${organizationId}/memory_collections/${collectionId}/files/${fileId}`,
      );

      if (!res.ok) {
        const body = await res.json();
        errorToast('Something went wrong!');
        handleUpdateStatus(fileUpload.id, 'error');
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
        `/super-api/organizations/${organizationId}/memory_collections/${collectionId}/memories`,
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
    }

    try {
      const {
        data: { id: fileId },
      } = await createFile(fileUpload);
      await refreshFileStatus(fileId);
      await createMemory(fileId);
      handleUpdateStatus(fileUpload.id, 'done');
      revalidator.revalidate();
      removeFile(fileUpload.id);
    } catch (e) {
      handleUpdateStatus(fileUpload.id, 'error');
      throw e;
    }
  };

  const handleUploadFiles = async () => {
    loadingToast(
      async () => {
        const results = await Promise.allSettled(items.map(handleUploadFile));

        const successCount = results.filter(
          (result) => result.status === 'fulfilled',
        ).length;
        const errorCount = results.filter(
          (result) => result.status === 'rejected',
        ).length;

        if (errorCount === 0) {
          return Promise.resolve({
            title: 'Files processed successfully.',
            description: `You can now view the files in the collection.`,
          });
        } else if (successCount === 0) {
          return Promise.reject({
            title: 'Files processing failed.',
            description: 'Please try again later.',
          });
        } else {
          return Promise.resolve({
            title: 'Partial success.',
            description: `${successCount} file(s) processed successfully, ${errorCount} file(s) failed.`,
            backgroundColor: 'bg-yellow-500',
          });
        }
      },
      {
        loading: {
          title: 'Files are still processing...',
          description: 'Please do not close or refresh the app.',
        },
      },
    );
  };

  return (
    <Form className="grow flex flex-col gap-2 p-1">
      <FileUpload
        multiple
        name="files"
        className="!gap-2"
        labelText="Browse files to upload"
        fileList={items}
        onChange={onChange}
        onRemove={removeFile}
        preview={({ fileList }) => (
          <FileUploadListPreview fileList={fileList} remove={removeFile} />
        )}
      />

      <Button
        aria-label="Upload knowledge items"
        isFluid
        size="sm"
        disabled={!items.length || isUploading}
        onClick={handleUploadFiles}
        isLoading={isUploading}
        className="mt-4"
      >
        Add {items.length > 0 ? items.length : ''} knowledge items
      </Button>
    </Form>
  );
};
