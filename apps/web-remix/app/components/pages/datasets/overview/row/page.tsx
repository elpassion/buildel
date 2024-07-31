import React, { useMemo } from 'react';
import type { MetaFunction } from '@remix-run/node';
import {
  useFetcher,
  useLoaderData,
  useMatch,
  useNavigate,
} from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { useControlField, ValidatedForm } from 'remix-validated-form';
import type { z } from 'zod';

import { UpdateDatasetRowSchema } from '~/api/datasets/datasets.contracts';
import {
  Field,
  HiddenField,
  useFieldContext,
} from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { EditorInput } from '~/components/form/inputs/editor.input';
import { Button } from '~/components/ui/button';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerFooter,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';

export function DatasetRowPage() {
  const { row, organizationId, datasetId, rowId } =
    useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const navigate = useNavigate();
  const match = useMatch(routes.datasetRow(organizationId, datasetId, rowId));
  const isModalOpen = !!match;

  const closeModal = () => {
    navigate(routes.dataset(organizationId, datasetId));
  };

  const onEdit = (
    { data }: z.TypeOf<typeof UpdateDatasetRowSchema>,
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    fetcher.submit({ data }, { method: 'PUT' });
  };

  return (
    <>
      <DialogDrawer open={isModalOpen} onOpenChange={closeModal}>
        <DialogDrawerContent className="md:w-[95%] md:max-w-[800px]">
          <DialogDrawerHeader>
            <DialogDrawerTitle>Dataset Row</DialogDrawerTitle>
            <DialogDrawerDescription>
              Id: {row.id}, Index: {row.index}
            </DialogDrawerDescription>
          </DialogDrawerHeader>

          <DialogDrawerBody>
            <div className="py-1">
              <DatasetRowForm
                id="dataset-row-form"
                defaultValue={JSON.stringify(row.data)}
                onSubmit={onEdit}
              />
            </div>
          </DialogDrawerBody>

          <DialogDrawerFooter>
            <Button variant="outline" size="sm" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" size="sm" form="dataset-row-form">
              Update
            </Button>
          </DialogDrawerFooter>
        </DialogDrawerContent>
      </DialogDrawer>
    </>
  );
}

interface DatasetRowEditorProps {
  defaultValue: string;
  onSubmit: (
    values: z.TypeOf<typeof UpdateDatasetRowSchema>,
    e: React.FormEvent<HTMLFormElement>,
  ) => void;
  id?: string;
}

function DatasetRowForm({ defaultValue, id, onSubmit }: DatasetRowEditorProps) {
  const validator = useMemo(() => withZod(UpdateDatasetRowSchema), []);

  return (
    <ValidatedForm
      id={id}
      noValidate
      validator={validator}
      onSubmit={onSubmit}
      defaultValues={{ data: defaultValue }}
    >
      <Field name="data">
        <FieldLabel>Data</FieldLabel>
        <DatasetRowEditorField />
        <FieldMessage />
      </Field>
    </ValidatedForm>
  );
}

function DatasetRowEditorField() {
  const { name, getInputProps, validate } = useFieldContext();
  const [value, setValue] = useControlField<string | undefined>(name);

  const handleOnChange = (v: string | undefined) => {
    setValue(v);
    validate();
  };

  const currentValue = value;

  return (
    <>
      <HiddenField value={currentValue ?? ''} {...getInputProps()} />
      <EditorInput
        height="200px"
        language="json"
        value={currentValue}
        onChange={handleOnChange}
      />
    </>
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `Row | ID ${data?.rowId}`,
    },
  ];
};
