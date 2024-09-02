import React, { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ExternalLink } from 'lucide-react';

import { EvaluationAverageCellBadge } from '~/components/pages/experiments/experiment/runs/components/EvaluationAverageCellBadge';
import type { IExperimentRun } from '~/components/pages/experiments/experiments.types';
import {
  CellNumberBadge,
  CellStatusBadge,
  ExternalLinkCell,
  Table,
  TableBody,
  TableBodyCell,
  TableBodyRow,
  TableEmptyMessage,
  TableHead,
  TableHeadCell,
  TableHeadRow,
} from '~/components/table/table.components';
import { getCommonPinningStyles } from '~/components/table/table.utils';
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
        cell: (info) => {
          const status = info.getValue();

          return <CellStatusBadge status={status}>{status}</CellStatusBadge>;
        },
        header: 'Status',
      }),
      columnHelper.accessor('total_cost', {
        header: 'Total cost ($)',
        id: 'cost',
        cell: (info) => info.getValue()?.toString(),
      }),
      columnHelper.accessor('runs_count', {
        header: 'Row Runs',
        id: 'runs',
        cell: (info) => (
          <CellNumberBadge>{info.getValue()?.toString()}</CellNumberBadge>
        ),
      }),
      columnHelper.accessor(`evaluations_avg`, {
        header: () => (
          <span className="whitespace-nowrap">Evaluations Average</span>
        ),
        id: 'evaluations_avg',
        cell: EvaluationAverageCellBadge,
      }),

      columnHelper.accessor('id', {
        header: '',
        id: 'run-actions',
        size: 50,
        cell: (info) => {
          const id = info.row.original.id;
          return (
            <div className="flex justify-end">
              <ExternalLinkCell
                target="_self"
                title="View experiment run"
                to={routes.experimentRun(organizationId, experimentId, id)}
                icon={<ExternalLink />}
              />
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
              <TableEmptyMessage>
                There are no experiment runs yet...
              </TableEmptyMessage>
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
