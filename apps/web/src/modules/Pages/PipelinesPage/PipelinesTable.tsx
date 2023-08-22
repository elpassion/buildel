'use client';

import React from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@elpassion/taco';
import { Table } from '@elpassion/taco/Table';
import { TCreatePipeline } from '~/contracts';
import { PipelinesApi } from '~/modules/Api';
import { ROUTES } from '~/modules/Config';

const pipelinesApi = new PipelinesApi();

interface PipelinesTableProps {
  pipelines: any;
}

export const PipelinesTable = ({ pipelines }: PipelinesTableProps) => {
  const queryClient = useQueryClient();
  const { mutate: deleteMutation } = useMutation({
    mutationFn: async (payload: any) => {
      return await pipelinesApi.delete(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
    onError: (error) => {
      console.error('Oops! Something went wrong!');
      console.error(error);
    },
  });

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
        actions: (
          <>
            <Button
              text="X"
              hierarchy="destructive"
              onClick={() => {
                deleteMutation(pipeline.id);
              }}
              title={`Delete Pipeline: "${pipeline.name}"`}
            />
          </>
        ),
      });
    }

    return data;
  }, [pipelines]); // eslint-disable-line react-hooks/exhaustive-deps

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
            className: 'w-40 min-w-40 flex-grow',
            id: 'name',
            isSortable: true,
            name: 'Name',
          },
          {
            className: 'w-40 min-w-40',
            id: 'actions',
            isSortable: false,
            name: 'Actions',
          },
        ]}
        data={tableData}
        layoutFixed
        // withBuiltInPagination
      />
    </>
  );
};
