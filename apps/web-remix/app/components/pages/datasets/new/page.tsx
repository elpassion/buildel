import React, { useMemo } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import { CircleHelp } from 'lucide-react';
import type { z } from 'zod';

import { CreateDatasetFileUpload } from '~/api/datasets/datasets.contracts';
import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { SmallFileInputField } from '~/components/form/fields/file.field';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { useUploadDatasetFile } from '~/components/pages/datasets/useUploadDatasetFile';
import { errorToast } from '~/components/toasts/errorToast';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { ValidatedForm, withZod } from '~/utils/form';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';

export function NewDataset() {
  const { organizationId } = useLoaderData<typeof loader>();
  const { uploadFile } = useUploadDatasetFile({ organizationId });

  const validator = useMemo(() => withZod(CreateDatasetFileUpload), []);
  const fetcher = useFetcher();

  const onSubmit = async (data: z.TypeOf<typeof CreateDatasetFileUpload>) => {
    try {
      if (!data.file || data.file.size === 0) {
        fetcher.submit({ name: data.name }, { method: 'POST' });
      } else {
        const fileId = await uploadFile({
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

  const navigate = useNavigate();

  const closeModal = (value: boolean) => {
    if (value) return;
    navigate(routes.datasets(organizationId));
  };

  return (
    <DialogDrawer open={true} onOpenChange={closeModal}>
      <DialogDrawerContent>
        <DialogDrawerHeader>
          <DialogDrawerTitle>Create a new dataset</DialogDrawerTitle>
          <DialogDrawerDescription>
            Compile examples and build datasets using data from production or
            other available sources.
          </DialogDrawerDescription>
        </DialogDrawerHeader>

        <DialogDrawerBody>
          <ValidatedForm
            validator={validator}
            method="post"
            noValidate
            className="w-full py-1 flex flex-col gap-4"
            handleSubmit={onSubmit}
          >
            <div>
              <Field name="name">
                <FieldLabel>Name</FieldLabel>
                <TextInputField placeholder="Type a name..." />
                <FieldMessage>
                  It will help you identify the dataset
                </FieldMessage>
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
                        Upload file in CSV format. Remember that first row
                        should contain column names.
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
        </DialogDrawerBody>
      </DialogDrawerContent>
    </DialogDrawer>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'New Dataset',
    },
  ];
});
