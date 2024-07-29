import type { z } from 'zod';

import type { fetchTyped } from '~/utils/fetch.server';

import type { CreateDatasetSchema } from './datasets.contracts';
import {
  DatasetResponse,
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
  ) {
    return this.client(
      DatasetRowsResponse,
      `/organizations/${organizationId}/datasets/${datasetId}/rows`,
    );
  }
}
