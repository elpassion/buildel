import React, { useState } from 'react';
import { useFetcher } from '@remix-run/react';

import { SmallFileUpload } from '~/components/fileUpload/SmallFileUpload';
import { confirm } from '~/components/modal/confirm';
import { useUploadDatasetFile } from '~/components/pages/datasets/useUploadDatasetFile';
import { errorToast } from '~/components/toasts/errorToast';
import type { ButtonProps } from '~/components/ui/button';
import { useOrganizationId } from '~/hooks/useOrganizationId';

export const UploadFileForm = (props: Omit<ButtonProps, 'onChange'>) => {
  const [file, setFile] = useState<File | null>(null);
  const fetcher = useFetcher();
  const organizationId = useOrganizationId();

  const { uploadFile } = useUploadDatasetFile({ organizationId });

  const onChange = async (
    file: File | null,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!file) return;

    setFile(file);

    confirm({
      children: (
        <p className="text-sm">
          You are about to upload the "{file.name}" file to your dataset.
        </p>
      ),
      onConfirm: async () => {
        try {
          const fileId = await uploadFile({ name: file.name, file });

          fetcher.submit({ file_id: fileId }, { method: 'POST' });
        } catch {
          errorToast('Something went wrong!');
        } finally {
          e.target.value = '';
          setFile(null);
        }
      },
      onCancel: async () => {
        e.target.value = '';
        setFile(null);
      },
    });
  };

  const renderText = () => {
    if (file) {
      return (
        <div title={file.name} className="max-w-[150px] truncate">
          {file.name}
        </div>
      );
    }

    return 'Upload file';
  };

  return (
    <SmallFileUpload onChange={onChange} {...props}>
      {renderText()}
    </SmallFileUpload>
  );
};
