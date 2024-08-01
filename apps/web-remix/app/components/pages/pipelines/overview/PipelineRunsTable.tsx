import React, { useMemo } from 'react';
import { Link } from '@remix-run/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ExternalLink } from 'lucide-react';

import { IconButton } from '~/components/iconButton';
import { EmptyMessage } from '~/components/list/ItemList';
import { StopRunForm } from '~/components/pages/pipelines/overview/StopRunForm';
import type {
  IPipelineRun,
  IPipelineRuns,
} from '~/components/pages/pipelines/pipeline.types';
import {
  Table,
  TableBody,
  TableBodyCell,
  TableBodyRow,
  TableHead,
  TableHeadCell,
  TableHeadRow,
} from '~/components/table/table.components';
import { Tooltip } from '~/components/tooltip/Tooltip';
import { Badge } from '~/components/ui/badge';
import { dayjs } from '~/utils/Dayjs';
import { routes } from '~/utils/routes.utils';

interface PipelineRunsTableProps {
  data: IPipelineRuns;
  pipelineId: string;
  organizationId: string;
}

const columnHelper = createColumnHelper<IPipelineRun>();

export const PipelineRunsTable: React.FC<PipelineRunsTableProps> = ({
  data,
  pipelineId,
  organizationId,
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
      columnHelper.accessor('costs', {
        header: 'Run costs ($)',
        id: 'costs',
        cell: (info) =>
          info
            .getValue()
            .reduce((acc, curr) => acc + Number(curr.data.amount), 0)
            .toFixed(10),
      }),
      columnHelper.accessor('costs', {
        header: 'Input tokens',
        id: 'input_tokens',
        cell: (info) =>
          info
            .getValue()
            .reduce((acc, curr) => acc + Number(curr.data.input_tokens), 0),
      }),
      columnHelper.accessor('costs', {
        header: 'Output tokens',
        id: 'output_tokens',
        cell: (info) =>
          info
            .getValue()
            .reduce((acc, curr) => acc + Number(curr.data.output_tokens), 0),
      }),

      columnHelper.accessor('status', {
        header: '',
        id: 'action',
        maxSize: 20,
        cell: (info) => {
          const id = info.row.original.id;
          return (
            <div className="flex gap-3 items-center justify-end">
              {info.getValue() === 'running' ? <StopRunForm id={id} /> : null}

              <Link
                id={`run-link-${id}`}
                to={routes.pipelineRun(organizationId, pipelineId, id)}
              >
                <IconButton
                  tabIndex={-1}
                  variant="secondary"
                  aria-label="Go to run overview"
                  icon={<ExternalLink />}
                  size="xxs"
                />
              </Link>

              <Tooltip
                offset={17}
                anchorSelect={`#run-link-${id}`}
                content="Go to run overview"
                place="top"
              />
            </div>
          );
        },
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
                There are no pipeline runs...
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
