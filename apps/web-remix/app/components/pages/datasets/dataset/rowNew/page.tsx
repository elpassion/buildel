import React, { useMemo } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import { ValidatedForm } from 'remix-validated-form';
import type { z } from 'zod';

import { CreateDatasetRowSchema } from '~/api/datasets/datasets.contracts';
import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { Button } from '~/components/ui/button';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerFooter,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
import { withZod } from '~/utils/form';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import { DatasetRowEditorField } from '../DatasetRowEditorField';
import type { loader } from './loader.server';

export function DatasetRowNew() {
  const { organizationId, datasetId, pagination } =
    useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const navigate = useNavigate();

  const closeModal = () => {
    navigate(routes.dataset(organizationId, datasetId, pagination));
  };

  const onCreate = (
    { data }: z.TypeOf<typeof CreateDatasetRowSchema>,
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    fetcher.submit({ data }, { method: 'POST' });
  };

  const validator = useMemo(() => withZod(CreateDatasetRowSchema), []);

  return (
    <>
      <DialogDrawer open={true} onOpenChange={closeModal}>
        <DialogDrawerContent className="md:w-[95%] md:max-w-[800px]">
          <DialogDrawerHeader>
            <DialogDrawerTitle>New Dataset Row</DialogDrawerTitle>
          </DialogDrawerHeader>

          <DialogDrawerBody>
            <div className="py-1">
              <ValidatedForm
                id="new-dataset-row-form"
                noValidate
                validator={validator}
                onSubmit={onCreate}
                defaultValues={{ data: '{}' }}
              >
                <Field name="data">
                  <FieldLabel>Data</FieldLabel>
                  <DatasetRowEditorField />
                  <FieldMessage />
                </Field>
              </ValidatedForm>
            </div>
          </DialogDrawerBody>

          <DialogDrawerFooter>
            <Button variant="outline" size="sm" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" size="sm" form="new-dataset-row-form">
              Create
            </Button>
          </DialogDrawerFooter>
        </DialogDrawerContent>
      </DialogDrawer>
    </>
  );
}

export const meta: MetaFunction<typeof loader> = metaWithDefaults(() => {
  return [
    {
      title: `New Dataset Row`,
    },
  ];
});
