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
  CardContentColumnTitle,
  CardContentColumnValue,
  CardContentColumnWrapper,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { cn } from '~/utils/cn';
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
      className="grid gap-4 grid-cols-1 md:grid-cols-2"
      items={items}
      emptyText={
        <EmptyMessage className="block mt-14 md:mt-20">
          There are no Experiments yet...
        </EmptyMessage>
      }
      renderItem={(item) => {
        const disabled = !item.pipeline;

        return (
          <BasicLink
            to={!disabled ? routes.experiment(organizationId, item.id) : ''}
            className={cn({ 'cursor-not-allowed opacity-50': disabled })}
            aria-disabled={disabled}
          >
            <ExperimentsListItem
              data={item}
              organizationId={organizationId}
              onDelete={handleDelete}
              disabled={disabled}
            />
          </BasicLink>
        );
      }}
    />
  );
};

interface ExperimentsListItemProps {
  data: IExperiment;
  organizationId: string;
  onDelete: (experiment: IExperiment) => void;
  disabled?: boolean;
}

export const ExperimentsListItem: React.FC<ExperimentsListItemProps> = ({
  data,
  onDelete,
  disabled,
}) => {
  const deleteDataset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    onDelete(data);
  };

  return (
    <Card className={cn({ 'hover:border-input': disabled })}>
      <CardHeader className="max-w-full flex-row gap-2 items-center justify-between space-y-0">
        <CardTitle
          className={cn('line-clamp-2', {
            'group-hover:text-foreground': disabled,
          })}
        >
          {data.name}
        </CardTitle>

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

      <CardContent className="border-t border-input">
        <div className="grid grid-cols-1 divide-y xl:divide-y-0 xl:grid-cols-[3fr_3fr_1fr_3fr] pt-3">
          <CardContentColumnWrapper>
            <CardContentColumnTitle>Workflow</CardContentColumnTitle>
            <CardContentColumnValue
              className="line-clamp-1"
              title={data.pipeline?.name}
            >
              {data.pipeline?.name ? data.pipeline.name : 'N/A'}
            </CardContentColumnValue>
          </CardContentColumnWrapper>

          <CardContentColumnWrapper>
            <CardContentColumnTitle>Dataset</CardContentColumnTitle>
            <CardContentColumnValue
              className="line-clamp-1"
              title={data.dataset.name}
            >
              {data.dataset.name}
            </CardContentColumnValue>
          </CardContentColumnWrapper>

          <CardContentColumnWrapper>
            <CardContentColumnTitle>Runs</CardContentColumnTitle>
            <CardContentColumnValue>{data.runs_count}</CardContentColumnValue>
          </CardContentColumnWrapper>

          <CardContentColumnWrapper>
            <CardContentColumnTitle>Created</CardContentColumnTitle>
            <CardContentColumnValue>
              {dayjs(data.created_at).format()}
            </CardContentColumnValue>
          </CardContentColumnWrapper>
        </div>
      </CardContent>
    </Card>
  );
};
