import React, { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { EmptyMessage } from '~/components/list/ItemList';
import type { IExperimentRun } from '~/components/pages/experiments/experiments.types';
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

interface ExperimentRunsTableProps {
  data: IExperimentRun[];
}

const columnHelper = createColumnHelper<IExperimentRun>();

export const ExperimentRunsTable: React.FC<ExperimentRunsTableProps> = ({
  data,
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
            variant={info.getValue() !== 'finished' ? 'destructive' : 'outline'}
          >
            {info.getValue()}
          </Badge>
        ),
        header: 'Status',
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
    <Table>
      <TableHead>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableHeadRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHeadCell key={header.id}>
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
                There are no experiment runs yet...
              </EmptyMessage>
            </td>
          </tr>
        ) : null}
        {table.getRowModel().rows.map((row) => (
          <TableBodyRow key={row.id} aria-label="pipeline run">
            {row.getVisibleCells().map((cell) => (
              <TableBodyCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableBodyCell>
            ))}
          </TableBodyRow>
        ))}
      </TableBody>
    </Table>
  );
};
