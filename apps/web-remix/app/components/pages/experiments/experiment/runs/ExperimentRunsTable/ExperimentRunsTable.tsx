import React, { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ExternalLink } from 'lucide-react';

import { IconButton } from '~/components/iconButton';
import { BasicLink } from '~/components/link/BasicLink';
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
import { useExperimentId } from '~/hooks/useExperimentId';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { dayjs } from '~/utils/Dayjs';
import { routes } from '~/utils/routes.utils';

interface ExperimentRunsTableProps {
  data: IExperimentRun[];
}

const columnHelper = createColumnHelper<IExperimentRun>();

export const ExperimentRunsTable: React.FC<ExperimentRunsTableProps> = ({
  data,
}) => {
  const organizationId = useOrganizationId();
  const experimentId = useExperimentId();
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
      columnHelper.accessor('id', {
        header: '',
        id: 'actions',
        size: 50,
        cell: (info) => {
          const id = info.row.original.id;
          return (
            <div className="flex justify-end">
              <BasicLink
                to={routes.experimentRun(organizationId, experimentId, id)}
              >
                <IconButton
                  size="xxs"
                  variant="ghost"
                  icon={<ExternalLink />}
                  tabIndex={-1}
                />
              </BasicLink>
            </div>
          );
        },
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
                There are no experiment runs yet...
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
