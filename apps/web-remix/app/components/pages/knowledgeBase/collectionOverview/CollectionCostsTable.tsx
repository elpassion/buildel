import React, { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableBodyCell,
  TableBodyRow,
  TableEmptyMessage,
  TableHead,
  TableHeadCell,
  TableHeadRow,
} from '~/components/table/table.components';
import { HelpfulIcon } from '~/components/tooltip/HelpfulIcon';
import { Badge } from '~/components/ui/badge';
import { dayjs } from '~/utils/Dayjs';

import type { IKnowledgeBaseCollectionCost } from '../knowledgeBase.types';

interface CollectionCostsTableProps {
  data: IKnowledgeBaseCollectionCost[];
}

const columnHelper = createColumnHelper<IKnowledgeBaseCollectionCost>();

export const CollectionCostsTable: React.FC<CollectionCostsTableProps> = ({
  data,
}) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor('created_at', {
        header: 'Date',
        id: 'created_at',
        cell: (info) => dayjs(info.getValue()).format('DD MMM HH:mm'),
      }),
      columnHelper.accessor('cost_type', {
        id: 'cost_type',
        cell: (info) => (
          <Badge
            variant={info.getValue() !== 'query' ? 'secondary' : 'outline'}
          >
            {info.getValue()}
          </Badge>
        ),
        header: 'Cost type',
      }),
      columnHelper.accessor('amount', {
        header: 'Collection costs ($)',
        id: 'amount',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        id: 'description',
        cell: (info) => {
          const value = info.getValue();

          return value.length > 20 ? (
            <>
              {`${value.slice(0, 17)}... `}
              <HelpfulIcon
                id={`inputs-helpful-icon`}
                text={value}
                size="sm"
                place="right"
              />
            </>
          ) : (
            value
          );
        },
      }),
      columnHelper.accessor('input_tokens', {
        header: 'Input tokens',
        id: 'input_tokens',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('output_tokens', {
        header: 'Output tokens',
        id: 'output_tokens',
        cell: (info) => info.getValue(),
      }),
    ],
    [],
  );

  const tableData = useMemo(() => {
    return data;
  }, [data]);

  const table = useReactTable({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table className="w-full">
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
              <TableEmptyMessage>
                There are no collection costs...
              </TableEmptyMessage>
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
