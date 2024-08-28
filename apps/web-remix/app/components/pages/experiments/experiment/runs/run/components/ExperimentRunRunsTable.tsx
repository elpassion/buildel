import React, { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FolderCog, Layers } from 'lucide-react';

import type {
  IExperimentRun,
  IExperimentRunRun,
} from '~/components/pages/experiments/experiments.types';
import {
  CellHeader,
  CellStatusBadge,
  CellText,
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
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { dayjs } from '~/utils/Dayjs';
import { routes } from '~/utils/routes.utils';

import { EvaluationAverageCellBadge } from '../../components/EvaluationAverageCellBadge';

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
          header: () => <CellHeader>Input: ${name}</CellHeader>,
          id: name,
          cell: (info) => {
            return <CellText>{info.getValue()}</CellText>;
          },
          size: 250,
          maxSize: 350,
        }),
      ),
      ...dynamicColumns.outputs.map((name) =>
        columnHelper.accessor(`data.${name}`, {
          header: () => <CellHeader>Evaluation: {name}</CellHeader>,
          id: name,
          cell: EvaluationAverageCellBadge,
        }),
      ),
      columnHelper.accessor(`evaluation_avg`, {
        header: () => <CellHeader>Evaluation Average</CellHeader>,
        id: 'evaluation_avg',
        cell: EvaluationAverageCellBadge,
      }),

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
              <TableEmptyMessage>
                There are no experiment run runs yet...
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
