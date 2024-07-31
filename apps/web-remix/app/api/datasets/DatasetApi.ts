import { z } from 'zod';

import type { PaginationQueryParams } from '~/components/pagination/usePagination';
import type { fetchTyped } from '~/utils/fetch.server';
import { buildUrlWithParams } from '~/utils/url';

import type { CreateDatasetSchema } from './datasets.contracts';
import {
  DatasetResponse,
  DatasetRowResponse,
  DatasetRowsResponse,
  DatasetsResponse,
} from './datasets.contracts';

export class DatasetApi {
  constructor(private client: typeof fetchTyped) {}

  async getDatasets(organizationId: string | number) {
    return this.client(
      DatasetsResponse,
      `/organizations/${organizationId}/datasets`,
    );
  }

  async getDataset(
    organizationId: string | number,
    datasetId: string | number,
  ) {
    return this.client(
      DatasetResponse,
      `/organizations/${organizationId}/datasets/${datasetId}`,
    );
  }

  async deleteDataset(
    organizationId: string | number,
    datasetId: string | number,
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/datasets/${datasetId}`,
      { method: 'DELETE' },
    );
  }

  async createDataset(
    organizationId: string | number,
    data: z.TypeOf<typeof CreateDatasetSchema>,
  ) {
    return this.client(
      DatasetResponse,
      `/organizations/${organizationId}/datasets`,
      { method: 'POST', body: JSON.stringify({ dataset: data }) },
    );
  }

  async getDatasetRows(
    organizationId: string | number,
    datasetId: string | number,
    pagination?: PaginationQueryParams,
  ) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/datasets/${datasetId}/rows`,
      { ...pagination },
    );

    return this.client(DatasetRowsResponse, url);
  }

  async getDatasetRow(
    organizationId: string | number,
    datasetId: string | number,
    rowId: string | number,
  ) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/datasets/${datasetId}/rows/${rowId}`,
    );

    return this.client(DatasetRowResponse, url);
  }

  async deleteDatasetRow(
    organizationId: string | number,
    datasetId: string | number,
    rowId: string | number,
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/datasets/${datasetId}/rows/${rowId}`,
      { method: 'DELETE' },
    );
  }

  async updateDatasetRow(
    organizationId: string | number,
    datasetId: string | number,
    rowId: string | number,
    data: Record<string, any>,
  ) {
    return this.client(
      DatasetRowResponse,
      `/organizations/${organizationId}/datasets/${datasetId}/rows/${rowId}`,
      { method: 'PUT', body: JSON.stringify({ data }) },
    );
  }

  async createDatasetRow(
    organizationId: string | number,
    datasetId: string | number,
    data: Record<string, any>,
  ) {
    return this.client(
      DatasetRowResponse,
      `/organizations/${organizationId}/datasets/${datasetId}/rows`,
      { method: 'POST', body: JSON.stringify({ data }) },
    );
  }
}
