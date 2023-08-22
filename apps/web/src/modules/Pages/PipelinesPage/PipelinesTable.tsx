'use client';

import React from 'react';
import Link from 'next/link';
import { Table } from '@elpassion/taco/Table';
import { ROUTES } from '~/modules/Config';

interface PipelinesTableProps {
  pipelines: any;
}

export const PipelinesTable = ({ pipelines }: PipelinesTableProps) => {
  const tableData = React.useMemo(() => {
    const data = [];
    for (const pipeline of pipelines) {
      data.push({
        id: pipeline.id,
        name: (
          <>
            <Link
              href={ROUTES.PIPELINE(pipeline.id)}
              className="font-bold hover:underline"
            >
              {pipeline.name}
            </Link>
          </>
        ),
      });
    }

    return data;
  }, [pipelines]);

  return (
    <>
      <Table
        columns={[
          {
            className: 'w-2 min-w-2',
            id: 'id',
            isSortable: true,
            name: 'ID',
          },
          {
            className: 'w-40 min-w-40',
            id: 'name',
            isSortable: true,
            name: 'Name',
          },
        ]}
        data={tableData}
        layoutFixed
        withBuiltInPagination
      />
    </>
  );
};
