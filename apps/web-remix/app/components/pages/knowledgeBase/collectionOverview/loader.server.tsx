import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { KnowledgeBaseApi } from '~/api/knowledgeBase/KnowledgeBaseApi';
import { getParamsPagination } from '~/components/pagination/usePagination';
import { requireLogin } from '~/session.server';
import { loaderBuilder } from '~/utils.server';

import {
  DEFAULT_END_DATE,
  DEFAULT_START_DATE,
} from '../../pipelines/MonthPicker/monthPicker.utils';
import { DateFilterSchema } from './schema';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.collectionName, 'collectionName not found');

    const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

    const searchParams = new URL(request.url).searchParams;
    const { page, per_page, search } = getParamsPagination(searchParams);
    const start_date = searchParams.get('start_date') ?? DEFAULT_START_DATE;
    const end_date = searchParams.get('end_date') ?? DEFAULT_END_DATE;

    const dateResult = DateFilterSchema.safeParse({ start_date, end_date });

    const dates = dateResult.success
      ? { start_date, end_date }
      : {
          start_date: DEFAULT_START_DATE,
          end_date: DEFAULT_END_DATE,
        };

    const {
      data: { id: collectionId },
    } = await knowledgeBaseApi.getCollectionByName(
      params.organizationId,
      params.collectionName,
    );

    const { data: collectionCosts } = await knowledgeBaseApi.getCollectionCosts(
      params.organizationId,
      collectionId,
      { page, per_page, search: '', ...dates },
    );

    const totalItems = collectionCosts.meta.total;
    const totalPages = Math.ceil(totalItems / per_page);
    const pagination = { page, per_page, search, totalItems, totalPages };

    return json({
      costList: collectionCosts.data,
      meta: collectionCosts.meta,
      organizationId: params.organizationId,
      collectionName: params.collectionName,
      collectionId: collectionId,
      pagination,
      startDate: dates.start_date,
      endDate: dates.end_date,
    });
  })(args);
}
