import React, { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { EmptyMessage } from '~/components/list/ItemList';
import type { IDatasetRow } from '~/components/pages/datasets/dataset.types';
import {
  Table,
  TableBody,
  TableBodyCell,
  TableBodyRow,
  TableHead,
  TableHeadCell,
  TableHeadRow,
} from '~/components/table/table.components';
import { getCommonPinningStyles } from '~/components/table/table.utils';
import { cn } from '~/utils/cn';
import { dayjs } from '~/utils/Dayjs';

import { DatasetRowMenuDropdown } from './DatasetRowMenuDropdown';

interface DatasetRowTableProps {
  data: IDatasetRow[];
  className?: string;
}

const columnHelper = createColumnHelper<IDatasetRow>();

export const DatasetRowTable = ({ data, className }: DatasetRowTableProps) => {
  const columnNames = useMemo(() => {
    if (data.length === 0) return [];

    return Object.keys(data[0].data);
  }, [data]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('created_at', {
        header: 'Date',
        id: 'created_at',
        cell: (info) => dayjs(info.getValue()).format('DD MMM HH:mm'),
      }),

      ...columnNames.map((name) =>
        columnHelper.accessor(`data.${name}`, {
          header: name,
          id: name,
          cell: (info) => info.getValue(),
        }),
      ),

      columnHelper.accessor('data.row-actions', {
        id: 'row-actions',
        header: '',
        cell: (info) => (
          <div className="flex justify-end">
            <DatasetRowMenuDropdown data={info.row.original} />
          </div>
        ),
        size: 100,
      }),
    ],
    [columnNames],
  );

  const tableData = useMemo(() => {
    return data;
  }, [data]);

  const table = useReactTable({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      columnPinning: {
        right: ['row-actions'],
      },
    },
  });

  return (
    <Table
      className={cn('w-full max-w-full overflow-x-auto', className)}
      style={{
        minWidth: table.getTotalSize(),
      }}
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
                There are no dataset rows yet...
              </EmptyMessage>
            </td>
          </tr>
        ) : null}
        {table.getRowModel().rows.map((row) => (
          <TableBodyRow key={row.id} aria-label="pipeline run">
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
