import { z } from 'zod';

import type { PaginationQueryParams } from '~/components/pagination/usePagination';
import type { fetchTyped } from '~/utils/fetch.server';
import { buildUrlWithParams } from '~/utils/url';

import type {
  CreateDatasetSchema,
  UpdateDatasetSchema,
  UploadDatasetFileSchema,
} from './datasets.contracts';
import {
  DatasetResponse,
  DatasetRowResponse,
  DatasetRowsResponse,
  DatasetsResponse,
} from './datasets.contracts';

export class DatasetApi {
  constructor(private client: typeof fetchTyped) {}

  async getDatasets(
    organizationId: string | number,
    queryParams: Partial<PaginationQueryParams>,
  ) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/datasets`,
      { ...queryParams },
    );

    return this.client(DatasetsResponse, url);
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

  async updateDataset(
    organizationId: string | number,
    datasetId: string | number,
    data: Omit<z.TypeOf<typeof UpdateDatasetSchema>, 'id'>,
  ) {
    return this.client(
      DatasetResponse,
      `/organizations/${organizationId}/datasets/${datasetId}`,
      { method: 'PUT', body: JSON.stringify({ dataset: data }) },
    );
  }

  async uploadDatasetFile(
    organizationId: string | number,
    datasetId: string | number,
    data: z.TypeOf<typeof UploadDatasetFileSchema>,
  ) {
    return this.client(
      DatasetResponse,
      `/organizations/${organizationId}/datasets/${datasetId}/files`,
      { method: 'POST', body: JSON.stringify({ file: data }) },
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

  async bulkDeleteDatasetRows(
    organizationId: string | number,
    datasetId: string | number,
    ids: (string | number)[],
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/datasets/${datasetId}/rows`,
      { method: 'DELETE', body: JSON.stringify({ ids }) },
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
