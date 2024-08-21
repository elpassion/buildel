import React, { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FolderCog, Layers } from 'lucide-react';

import type { IOrganizationCost } from '~/api/organization/organization.contracts';
import { isOrganizationCollectionCost } from '~/api/organization/organization.contracts';
import { EmptyMessage } from '~/components/list/ItemList';
import {
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
import { cn } from '~/utils/cn';
import { dayjs } from '~/utils/Dayjs';
import { routes } from '~/utils/routes.utils';

interface OrganizationCostTableProps {
  data: IOrganizationCost[];
}

const columnHelper = createColumnHelper<IOrganizationCost>();

export const OrganizationCostTable: React.FC<OrganizationCostTableProps> = ({
  data,
}) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor('type', {
        header: 'Cost from',
        id: 'type',
        cell: (info) => {
          const type = info.getValue();
          if (!type) return 'unknown';

          return type === 'collection' ? 'Collection' : 'Workflow';
        },
      }),
      columnHelper.accessor('created_at', {
        header: 'Date',
        id: 'created_at',
        cell: (info) => dayjs(info.getValue()).format('DD MMM HH:mm'),
      }),
      columnHelper.accessor('cost_type', {
        header: 'Cost type',
        id: 'cost_type',
        cell: (info) => {
          const row = info.row.original;
          if (isOrganizationCollectionCost(row)) {
            return (
              <Badge
                variant={row.cost_type !== 'query' ? 'secondary' : 'outline'}
              >
                {row.cost_type}
              </Badge>
            );
          }

          return null;
        },
      }),
      columnHelper.accessor('amount', {
        header: 'Costs ($)',
        id: 'amount',
        cell: (info) => info.getValue(),
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

      columnHelper.accessor('id', {
        id: 'row-actions',
        header: '',
        cell: (info) => {
          const row = info.row.original;

          return <CostTableActionColumn data={row} />;
        },
        size: 70,
      }),
    ],
    [data],
  );

  const table = useReactTable({
    columns,
    data: data,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      columnPinning: {
        right: ['row-actions'],
      },
    },
  });

  return (
    <Table
      className={cn('w-full max-w-full overflow-x-auto')}
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
              <EmptyMessage className="px-5 whitespace-nowrap text-nowrap">
                There are no organization costs...
              </EmptyMessage>
            </td>
          </tr>
        ) : null}
        {table.getRowModel().rows.map((row) => (
          <TableBodyRow key={row.id}>
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

function CostTableActionColumn({ data }: { data: IOrganizationCost }) {
  const organizationId = useOrganizationId();

  if (!data.type) return;
  if (isOrganizationCollectionCost(data)) {
    if (!data.memory_collection_name) return null;

    return (
      <div className="flex justify-end">
        <ExternalLinkCell
          title="View collection"
          to={routes.collectionFiles(
            organizationId,
            data.memory_collection_name,
          )}
          icon={<FolderCog />}
        />
      </div>
    );
  }

  if (!data.pipeline_id || !data.run_id) return null;

  return (
    <div className="flex justify-end">
      <ExternalLinkCell
        title="View workflow"
        to={routes.pipelineRun(organizationId, data.pipeline_id, data.run_id)}
        icon={<Layers />}
      />
    </div>
  );
}
