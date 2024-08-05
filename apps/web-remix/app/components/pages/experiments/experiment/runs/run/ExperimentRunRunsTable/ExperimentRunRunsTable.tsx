import React, { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ExternalLink } from 'lucide-react';

import type { BasicLinkProps } from '~/components/link/BasicLink';
import { BasicLink } from '~/components/link/BasicLink';
import { EmptyMessage } from '~/components/list/ItemList';
import type {
  IExperimentRun,
  IExperimentRunRun,
} from '~/components/pages/experiments/experiments.types';
import {
  Table,
  TableBody,
  TableBodyCell,
  TableBodyRow,
  TableHead,
  TableHeadCell,
  TableHeadRow,
} from '~/components/table/table.components';
import { Badge } from '~/components/ui/badge';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { cn } from '~/utils/cn';
import { dayjs } from '~/utils/Dayjs';
import { routes } from '~/utils/routes.utils';

interface ExperimentRunRunsTableProps {
  data: IExperimentRunRun[];
  dynamicColumns: IExperimentRun['columns'];
}

const columnHelper = createColumnHelper<IExperimentRunRun>();

export const ExperimentRunRunsTable: React.FC<ExperimentRunRunsTableProps> = ({
  data,
  dynamicColumns,
}) => {
  const organizationId = useOrganizationId();

  const columns = useMemo(
    () => [
      columnHelper.accessor('created_at', {
        header: 'Date',
        id: 'created_at',
        cell: (info) => dayjs(info.getValue()).format('DD MMM HH:mm'),
      }),
      columnHelper.accessor('status', {
        id: 'status',
        cell: (info) => (
          <Badge
            variant={
              info.getValue() === 'finished'
                ? 'secondary'
                : info.getValue() === 'created'
                  ? 'outline'
                  : 'default'
            }
          >
            {info.getValue()}
          </Badge>
        ),
        header: 'Status',
      }),
      ...dynamicColumns.inputs.map((name) =>
        columnHelper.accessor(`data.${name}`, {
          header: `Input: ${name}`,
          id: name,
          cell: (info) => {
            return info.getValue();
          },
        }),
      ),
      ...dynamicColumns.outputs.map((name) =>
        columnHelper.accessor(`data.${name}`, {
          header: () => (
            <span className="whitespace-nowrap">Evaluation: {name}</span>
          ),
          id: name,
          cell: (info) => {
            const value = info.getValue();

            if (!value) return '';

            if (typeof value === 'number')
              return (
                <Badge
                  variant={
                    value < 25 ? 'error' : value >= 75 ? 'success' : 'warning'
                  }
                >
                  {value}%
                </Badge>
              );
            return info.getValue();
          },
        }),
      ),
      columnHelper.accessor('dataset_row_id', {
        id: 'dataset_row_id',
        cell: (info) => {
          const original = info.row.original;
          return (
            <ExternalLinkCell
              to={routes.datasetRow(
                organizationId,
                original.dataset_id,
                original.dataset_row_id,
              )}
            >
              {original.dataset_row_id}
            </ExternalLinkCell>
          );
        },
        header: () => <ExternalLinkHeader>Dataset Row ID</ExternalLinkHeader>,
      }),
      columnHelper.accessor('run_id', {
        id: 'run_id',
        cell: (info) => {
          const original = info.row.original;
          return (
            <ExternalLinkCell
              to={routes.pipelineRun(
                organizationId,
                original.pipeline_id,
                original.run_id,
              )}
            >
              {original.run_id}
            </ExternalLinkCell>
          );
        },
        header: () => <ExternalLinkHeader>Row ID</ExternalLinkHeader>,
      }),
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table
      className="overflow-x-auto"
      style={{ minWidth: table.getTotalSize() }}
    >
      <TableHead>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableHeadRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHeadCell
                key={header.id}
                style={{ width: header.column.getSize() }}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </TableHeadCell>
            ))}
          </TableHeadRow>
        ))}
      </TableHead>

      <TableBody>
        {data.length === 0 ? (
          <tr>
            <td className="py-2 mx-auto">
              <EmptyMessage className="px-5">
                There are no experiment run runs yet...
              </EmptyMessage>
            </td>
          </tr>
        ) : null}
        {table.getRowModel().rows.map((row) => (
          <TableBodyRow key={row.id} aria-label="pipeline run">
            {row.getVisibleCells().map((cell) => (
              <TableBodyCell
                key={cell.id}
                style={{ width: cell.column.getSize() }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableBodyCell>
            ))}
          </TableBodyRow>
        ))}
      </TableBody>
    </Table>
  );
};

function ExternalLinkHeader({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex gap-1 whitespace-nowrap', className)} {...rest}>
      {children}
      <ExternalLink className="w-3.5 h-3.5" />
    </div>
  );
}

function ExternalLinkCell({ children, className, ...rest }: BasicLinkProps) {
  return (
    <BasicLink
      className={cn('hover:underline', className)}
      target="_blank"
      {...rest}
    >
      {children}
    </BasicLink>
  );
}
