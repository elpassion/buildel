import React, { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FolderCog, Layers } from 'lucide-react';

import { EmptyMessage } from '~/components/list/ItemList';
import type {
  IExperimentRun,
  IExperimentRunRun,
} from '~/components/pages/experiments/experiments.types';
import {
  CellStatusBadge,
  ExternalLinkCell,
  Table,
  TableBody,
  TableBodyCell,
  TableBodyRow,
  TableHead,
  TableHeadCell,
  TableHeadRow,
} from '~/components/table/table.components';
import { getCommonPinningStyles } from '~/components/table/table.utils';
import { Badge } from '~/components/ui/badge';
import { useOrganizationId } from '~/hooks/useOrganizationId';
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
      columnHelper.accessor('id', {
        header: 'Id',
        id: 'id',
        cell: (info) => `#${info.getValue()}`,
        size: 70,
        maxSize: 70,
      }),
      columnHelper.accessor('created_at', {
        header: 'Date',
        id: 'created_at',
        cell: (info) => (
          <span className="whitespace-nowrap">
            {dayjs(info.getValue()).format('DD MMM HH:mm')}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        id: 'status',
        cell: (info) => (
          <CellStatusBadge status={info.getValue()}>
            {info.getValue()}
          </CellStatusBadge>
        ),
        header: 'Status',
      }),
      ...dynamicColumns.inputs.map((name) =>
        columnHelper.accessor(`data.${name}`, {
          header: () => (
            <span className="whitespace-nowrap">Input: ${name}</span>
          ),
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
      columnHelper.accessor('run_id', {
        id: 'run-actions',
        cell: (info) => {
          const original = info.row.original;
          return (
            <div className="flex gap-1 justify-end items-center">
              <ExternalLinkCell
                title="View dataset row"
                to={routes.datasetRow(
                  organizationId,
                  original.dataset_id,
                  original.dataset_row_id,
                )}
                icon={<FolderCog />}
              />

              <ExternalLinkCell
                title="View pipeline run"
                to={routes.pipelineRun(
                  organizationId,
                  original.pipeline_id,
                  original.run_id,
                )}
                icon={<Layers />}
              />
            </div>
          );
        },
        header: '',
        size: 100,
      }),
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: data,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      columnPinning: {
        right: ['run-actions'],
      },
    },
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
                style={{ ...getCommonPinningStyles(header.column) }}
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
          <TableBodyRow
            key={row.id}
            aria-label="pipeline run"
            data-row-key={row.original.id}
          >
            {row.getVisibleCells().map((cell) => (
              <TableBodyCell
                key={cell.id}
                style={{ ...getCommonPinningStyles(cell.column) }}
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
