import React, { useMemo } from 'react';
import { useFetcher } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { Edit, EllipsisVertical, Trash } from 'lucide-react';
import { ValidatedForm } from 'remix-validated-form';
import { useBoolean } from 'usehooks-ts';

import { UpdateDatasetSchema } from '~/api/datasets/datasets.contracts';
import {
  MenuDropdown,
  MenuDropdownContent,
  MenuDropdownItem,
  MenuDropdownTrigger,
} from '~/components/dropdown/MenuDropdown';
import { Field, HiddenField } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import { BasicLink } from '~/components/link/BasicLink';
import { EmptyMessage, ItemList } from '~/components/list/ItemList';
import { confirm } from '~/components/modal/confirm';
import type { IDataset } from '~/components/pages/datasets/dataset.types';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerFooter,
  DialogDrawerHeader,
  DialogDrawerTitle,
  DialogDrawerTrigger,
} from '~/components/ui/dialog-drawer';
import { dayjs } from '~/utils/Dayjs';
import { routes } from '~/utils/routes.utils';

interface DatasetsListProps {
  items: IDataset[];
  organizationId: string;
}

export const DatasetsList: React.FC<DatasetsListProps> = ({
  items,
  organizationId,
}) => {
  const fetcher = useFetcher();

  const handleDelete = async (dataset: IDataset) => {
    confirm({
      onConfirm: async () =>
        fetcher.submit({ datasetId: dataset.id }, { method: 'DELETE' }),
      confirmText: 'Delete Dataset',
      children: (
        <p className="text-sm">
          You are about to delete the "{dataset.name}” dataset. This action is
          irreversible.
        </p>
      ),
    });
  };

  return (
    <ItemList
      aria-label="Memory collections list"
      className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      items={items}
      emptyText={
        <EmptyMessage className="block mt-14 md:mt-20">
          There are no Datasets yet...
        </EmptyMessage>
      }
      renderItem={(item) => (
        <BasicLink to={routes.dataset(organizationId, item.id)}>
          <DatasetsListItem
            data={item}
            organizationId={organizationId}
            onDelete={handleDelete}
          />
        </BasicLink>
      )}
    />
  );
};

interface DatasetsListItemProps {
  data: IDataset;
  organizationId: string;
  onDelete: (dataset: IDataset) => void;
}

export const DatasetsListItem: React.FC<DatasetsListItemProps> = ({
  data,
  onDelete,
}) => {
  const { value: isOpen, toggle, setValue, setFalse } = useBoolean(false);

  const deleteDataset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    onDelete(data);
  };

  return (
    <Card>
      <CardHeader className="max-w-full flex-row gap-2 items-center justify-between space-y-0">
        <CardTitle className="line-clamp-2">{data.name}</CardTitle>

        <MenuDropdown>
          <MenuDropdownTrigger
            className="w-8 h-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <EllipsisVertical className="w-4 h-4" />
          </MenuDropdownTrigger>

          <MenuDropdownContent
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <DialogDrawer open={isOpen} onOpenChange={setValue}>
              <MenuDropdownItem icon={<Edit />} onClick={toggle}>
                Edit
              </MenuDropdownItem>

              <DialogDrawerContent>
                <DialogDrawerHeader>
                  <DialogDrawerTitle>Update Dataset</DialogDrawerTitle>
                  <DialogDrawerDescription>
                    Compile examples and build datasets using data from
                    production or other available sources.
                  </DialogDrawerDescription>
                </DialogDrawerHeader>

                <DialogDrawerBody>
                  <DatasetEditForm
                    data={data}
                    id={`update-${data.name}-dataset-form`}
                    onSubmit={setFalse}
                  />
                </DialogDrawerBody>

                <DialogDrawerFooter>
                  <Button variant="outline" onClick={toggle}>
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    form={`update-${data.name}-dataset-form`}
                  >
                    Save
                  </Button>
                </DialogDrawerFooter>
              </DialogDrawerContent>
            </DialogDrawer>

            <MenuDropdownItem
              icon={<Trash />}
              variant="destructive"
              onClick={deleteDataset}
            >
              <span>Delete</span>
            </MenuDropdownItem>
          </MenuDropdownContent>
        </MenuDropdown>
      </CardHeader>

      <CardContent>
        <CardDescription>Rows: {data.rows_count}</CardDescription>
        <CardDescription>{dayjs(data.created_at).format()}</CardDescription>
      </CardContent>
    </Card>
  );
};

interface DatasetEditFormProps {
  data: IDataset;
  id?: string;
  onSubmit?: () => void;
}

function DatasetEditForm({ data, id, onSubmit }: DatasetEditFormProps) {
  const validator = useMemo(() => withZod(UpdateDatasetSchema), []);

  return (
    <ValidatedForm
      id={id}
      method="PUT"
      validator={validator}
      onSubmit={onSubmit}
      defaultValues={{ name: data.name, id: data.id }}
    >
      <HiddenField name="id" value={data.id} />

      <Field name="name">
        <FieldLabel>Name</FieldLabel>
        <TextInputField placeholder="Type a name..." />
        <FieldMessage>It will help you identify the dataset</FieldMessage>
      </Field>
    </ValidatedForm>
  );
}
