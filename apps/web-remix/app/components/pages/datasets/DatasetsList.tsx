import React from 'react';
import { useFetcher } from '@remix-run/react';
import { EllipsisVertical, Trash } from 'lucide-react';

import {
  MenuDropdown,
  MenuDropdownContent,
  MenuDropdownItem,
  MenuDropdownTrigger,
} from '~/components/dropdown/MenuDropdown';
import { BasicLink } from '~/components/link/BasicLink';
import { EmptyMessage, ItemList } from '~/components/list/ItemList';
import { confirm } from '~/components/modal/confirm';
import type { IDataset } from '~/components/pages/datasets/dataset.types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
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

          <MenuDropdownContent>
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
