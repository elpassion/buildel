import { z } from 'zod';

import type { fetchTyped } from '~/utils/fetch.server';

import type { CreateExperimentSchema } from './experiments.contracts';
import {
  ExperimentResponse,
  ExperimentsResponse,
} from './experiments.contracts';

export class ExperimentsApi {
  constructor(private client: typeof fetchTyped) {}

  async getExperiments(organizationId: string | number) {
    return this.client(
      ExperimentsResponse,
      `/organizations/${organizationId}/experiments`,
    );
  }

  async getExperiment(
    organizationId: string | number,
    experimentId: string | number,
  ) {
    return this.client(
      ExperimentResponse,
      `/organizations/${organizationId}/experiments/${experimentId}`,
    );
  }

  async deleteExperiment(
    organizationId: string | number,
    experimentId: string | number,
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/experiments/${experimentId}`,
      { method: 'DELETE' },
    );
  }

  async createExperiment(
    organizationId: string | number,
    data: z.TypeOf<typeof CreateExperimentSchema>,
  ) {
    return this.client(
      ExperimentResponse,
      `/organizations/${organizationId}/experiments`,
      { method: 'POST', body: JSON.stringify({ experiment: data }) },
    );
  }
}
