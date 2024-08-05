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
import type { IExperiment } from '~/components/pages/experiments/experiments.types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { dayjs } from '~/utils/Dayjs';
import { routes } from '~/utils/routes.utils';

interface ExperimentsListProps {
  items: IExperiment[];
}

export const ExperimentsList: React.FC<ExperimentsListProps> = ({ items }) => {
  const organizationId = useOrganizationId();
  const fetcher = useFetcher();

  const handleDelete = async (experiment: IExperiment) => {
    confirm({
      onConfirm: async () =>
        fetcher.submit({ experimentId: experiment.id }, { method: 'DELETE' }),
      confirmText: 'Delete Experiment',
      children: (
        <p className="text-sm">
          You are about to delete the "{experiment.name}” experiment. This
          action is irreversible.
        </p>
      ),
    });
  };

  return (
    <ItemList
      aria-label="Experiments List"
      className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      items={items}
      emptyText={
        <EmptyMessage className="block mt-14 md:mt-20">
          There are no Experiments yet...
        </EmptyMessage>
      }
      renderItem={(item) => (
        <BasicLink to={routes.experiment(organizationId, item.id)}>
          <ExperimentsListItem
            data={item}
            organizationId={organizationId}
            onDelete={handleDelete}
          />
        </BasicLink>
      )}
    />
  );
};

interface ExperimentsListItemProps {
  data: IExperiment;
  organizationId: string;
  onDelete: (experiment: IExperiment) => void;
}

export const ExperimentsListItem: React.FC<ExperimentsListItemProps> = ({
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

      <CardContent className="flex flex-row flex-wrap gap-2">
        <CardDescription>Pipeline: {data.pipeline_id}</CardDescription>
        <CardDescription>Dataset: {data.dataset_id}</CardDescription>
        <CardDescription>Runs: {data.runs_count}</CardDescription>
        <CardDescription className="w-full">
          Created: {dayjs(data.created_at).format()}
        </CardDescription>
      </CardContent>
    </Card>
  );
};
