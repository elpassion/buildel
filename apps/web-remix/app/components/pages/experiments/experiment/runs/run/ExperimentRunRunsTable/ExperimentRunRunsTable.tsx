import React, { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

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
import { dayjs } from '~/utils/Dayjs';

interface ExperimentRunRunsTableProps {
  data: IExperimentRunRun[];
  dynamicColumns: IExperimentRun['columns'];
}

const columnHelper = createColumnHelper<IExperimentRunRun>();

export const ExperimentRunRunsTable: React.FC<ExperimentRunRunsTableProps> = ({
  data,
  dynamicColumns,
}) => {
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
                ? 'outline'
                : info.getValue() === 'created'
                  ? 'secondary'
                  : 'destructive'
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
          header: `Evaluation: ${name}`,
          id: name,
          cell: (info) => {
            const value = info.getValue();

            if (!value) return '';

            if (typeof value === 'number') return `${value}%`;
            return info.getValue();
          },
        }),
      ),
      columnHelper.accessor('dataset_row_id', {
        id: 'dataset_row_id',
        cell: (info) => info.getValue()?.toString(),
        header: 'Dataset Row ID',
      }),
      columnHelper.accessor('run_id', {
        id: 'run_id',
        cell: (info) => info.getValue()?.toString(),
        header: 'Run ID',
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
