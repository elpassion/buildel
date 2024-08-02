import React, { useMemo } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { CircleHelp } from 'lucide-react';
import { ValidatedForm } from 'remix-validated-form';
import type { z } from 'zod';

import { CreateDatasetFileUpload } from '~/api/datasets/datasets.contracts';
import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { SmallFileInputField } from '~/components/form/fields/file.field';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { errorToast } from '~/components/toasts/errorToast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';

import type { loader } from './loader.server';

export function NewDataset() {
  const { organizationId } = useLoaderData<typeof loader>();

  const handleUploadFile = async (data: {
    name: string;
    file: File;
  }): Promise<string> => {
    async function createFile(file: File) {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(
        `/super-api/organizations/${organizationId}/datasets/files`,
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
        `/super-api/organizations/${organizationId}/datasets/files/${fileId}`,
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

  const validator = useMemo(() => withZod(CreateDatasetFileUpload), []);
  const fetcher = useFetcher();

  const onSubmit = async (
    data: z.TypeOf<typeof CreateDatasetFileUpload>,
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    try {
      if (!data.file || data.file.size === 0) {
        fetcher.submit({ name: data.name }, { method: 'POST' });
      } else {
        const fileId = await handleUploadFile({
          name: data.name,
          file: data.file as File,
        });

        fetcher.submit(
          { file_id: fileId, name: data.name },
          { method: 'POST' },
        );
      }
    } catch {
      errorToast('Something went wrong!');
    }
  };

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      noValidate
      className="w-full py-1 flex flex-col gap-4"
      onSubmit={onSubmit}
    >
      <div>
        <Field name="name">
          <FieldLabel>Name</FieldLabel>
          <TextInputField placeholder="Type a name..." />
          <FieldMessage>It will help you identify the dataset</FieldMessage>
        </Field>
      </div>

      <div>
        <Field name="file">
          <FieldLabel className="flex gap-1 items-center">
            <span>File</span>
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger>
                  <CircleHelp className="w-3.5 h-3.5" />
                </TooltipTrigger>
                <TooltipContent>
                  Upload file in CSV format. Remember that first row should
                  contain column names.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </FieldLabel>
          <SmallFileInputField multiple={false} accept=".csv" />
          <FieldMessage />
        </Field>
      </div>

      <SubmitButton isFluid size="sm" className="mt-4">
        Create dataset
      </SubmitButton>
    </ValidatedForm>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'New Dataset',
    },
  ];
};
