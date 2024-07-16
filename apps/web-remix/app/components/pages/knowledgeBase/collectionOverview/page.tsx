import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { Pagination } from '~/components/pagination/Pagination';
import { dayjs } from '~/utils/Dayjs';
import { routes } from '~/utils/routes.utils';

import { MonthPicker } from '../../pipelines/MonthPicker/MonthPicker';
import { CollectionCostsTable } from './CollectionCostsTable';
import type { loader } from './loader.server';

export function KnowledgeBaseOverviewPage() {
  const {
    costList,
    organizationId,
    collectionName,
    pagination,
    startDate,
    endDate,
  } = useLoaderData<typeof loader>();

  return (
    <section className="pt-5 pb-1">
      <header className="w-full flex items-center justify-between py-2 mb-4">
        {/* <p className="text-white">
          <span className="text-neutral-100">Summary cost ($):</span>{" "}
          {details.total_cost}
        </p> */}

        <div className="w-[170px]">
          <MonthPicker
            date={new Date(startDate)}
            loaderUrl={routes.collectionOverview(
              organizationId,
              collectionName,
            )}
          />
        </div>
      </header>

      <div className="overflow-x-auto">
        <div className="min-w-[750px] pb-3">
          <CollectionCostsTable data={costList} />

          <div className="flex justify-end mt-4">
            <Pagination
              pagination={pagination}
              loaderUrl={routes.collectionOverview(
                organizationId,
                collectionName,
                {
                  start_date: dayjs(startDate).startOfMonth.toISOString(),
                  end_date: dayjs(endDate).endOfMonth.toISOString(),
                },
              )}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${data?.collectionName} overview`,
    },
  ];
};
