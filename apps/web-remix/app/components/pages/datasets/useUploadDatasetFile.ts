import { errorToast } from '~/components/toasts/errorToast';

interface UseUploadFile {
  organizationId: string;
}

export const useUploadDatasetFile = (args: UseUploadFile) => {
  const handleUploadFile = async (data: {
    name: string;
    file: File;
  }): Promise<string> => {
    async function createFile(file: File) {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(
        `/super-api/organizations/${args.organizationId}/datasets/files`,
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
        `/super-api/organizations/${args.organizationId}/datasets/files/${fileId}`,
      );

      if (!res.ok) {
        const body = await res.json();
        errorToast('Something went wrong!');
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

    try {
      const {
        data: { id: fileId },
      } = await createFile(data.file);
      await refreshFileStatus(fileId);

      return fileId;
    } catch (e) {
      throw e;
    }
  };

  return { uploadFile: handleUploadFile };
};
