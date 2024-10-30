import z from 'zod';

import type { IPipeline } from '~/components/pages/pipelines/pipeline.types';
import type { PaginationQueryParams } from '~/components/pagination/usePagination';
import type { fetchTyped } from '~/utils/fetch.server';
import { buildUrlWithParams } from '~/utils/url';

import {
  AliasesResponse,
  AliasResponse,
  PipelineDetailsResponse,
  PipelinePublicResponse,
  PipelineResponse,
  PipelineRunLogsResponse,
  PipelineRunResponse,
  PipelineRunsResponse,
  PipelinesResponse,
} from './pipeline.contracts';
import type {
  CreateAliasSchema,
  CreatePipelineSchema,
  UpdateAliasSchema,
  UpdatePipelineSchema,
} from './pipeline.contracts';

type DateQueryParams = {
  start_date: string;
  end_date: string;
};

export class PipelineApi {
  constructor(private client: typeof fetchTyped) {}

  getPipeline(organizationId: string | number, pipelineId: string | number) {
    return this.client(
      PipelineResponse,
      `/organizations/${organizationId}/pipelines/${pipelineId}`,
    );
  }

  getPipelineRuns(
    organizationId: string | number,
    pipelineId: string | number,
    pagination?: DateQueryParams & PaginationQueryParams,
  ) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/pipelines/${pipelineId}/runs`,
      { ...pagination },
    );

    return this.client(PipelineRunsResponse, url);
  }

  getPipelineRun(
    organizationId: string | number,
    pipelineId: string | number,
    runId: string | number,
  ) {
    return this.client(
      PipelineRunResponse,
      `/organizations/${organizationId}/pipelines/${pipelineId}/runs/${runId}`,
    );
  }

  getPipelineDetails(
    organizationId: string | number,
    pipelineId: string | number,
    queryParams: DateQueryParams,
  ) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/pipelines/${pipelineId}/details`,
      { ...queryParams },
    );

    return this.client(PipelineDetailsResponse, url);
  }

  stopPipelineRun(
    organizationId: string | number,
    pipelineId: string | number,
    runId: string | number,
  ) {
    return this.client(
      PipelineRunResponse,
      `/organizations/${organizationId}/pipelines/${pipelineId}/runs/${runId}/stop`,
      { method: 'POST' },
    );
  }

  getAlias(
    organizationId: string | number,
    pipelineId: string | number,
    aliasId: string | number,
  ) {
    return this.client(
      AliasResponse,
      `/organizations/${organizationId}/pipelines/${pipelineId}/aliases/${aliasId}`,
    );
  }

  createAlias(
    organizationId: string | number,
    pipelineId: string | number,
    data: z.TypeOf<typeof CreateAliasSchema>,
  ) {
    return this.client(
      AliasResponse,
      `/organizations/${organizationId}/pipelines/${pipelineId}/aliases`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alias: data,
        }),
      },
    );
  }

  updateAlias(
    organizationId: string | number,
    pipelineId: string | number,
    aliasId: string | number,
    data: z.TypeOf<typeof UpdateAliasSchema>,
  ) {
    return this.client(
      AliasResponse,
      `/organizations/${organizationId}/pipelines/${pipelineId}/aliases/${aliasId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alias: data,
        }),
      },
    );
  }

  deleteAlias(
    organizationId: string | number,
    pipelineId: string | number,
    aliasId: string | number,
  ) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/pipelines/${pipelineId}/aliases/${aliasId}`,
      {
        method: 'DELETE',
      },
    );
  }

  getAliases(organizationId: string | number, pipelineId: string | number) {
    return this.client(
      AliasesResponse,
      `/organizations/${organizationId}/pipelines/${pipelineId}/aliases`,
    );
  }

  async getAliasedPipeline(
    organizationId: string | number,
    pipelineId: string | number,
    aliasId: string | number,
  ): Promise<IPipeline> {
    const pipeline = await this.getPipeline(organizationId, pipelineId);

    if (aliasId !== 'latest') {
      const alias = await this.getAlias(organizationId, pipelineId, aliasId);

      return {
        ...pipeline.data,
        name: alias.data.name,
        config: alias.data.config,
        interface_config: alias.data.interface_config,
      };
    }

    return pipeline.data;
  }

  getPipelines(
    organizationId: string | number,
    queryParams?: Partial<PaginationQueryParams> & { favorites?: boolean },
  ) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/pipelines`,
      { ...queryParams },
    );

    return this.client(PipelinesResponse, url);
  }

  deletePipeline(organizationId: string | number, pipelineId: string | number) {
    return this.client(
      z.any(),
      `/organizations/${organizationId}/pipelines/${pipelineId}`,
      { method: 'DELETE' },
    );
  }

  createPipeline(
    organizationId: string | number,
    data: z.TypeOf<typeof CreatePipelineSchema>,
  ) {
    return this.client(
      PipelineResponse,
      `/organizations/${organizationId}/pipelines`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
  }

  updatePipeline(
    organizationId: string | number,
    pipelineId: string | number,
    data: z.TypeOf<typeof UpdatePipelineSchema>,
  ) {
    return this.client(
      PipelineResponse,
      `/organizations/${organizationId}/pipelines/${pipelineId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pipeline: data,
        }),
      },
    );
  }

  updatePipelinePatch(
    organizationId: string | number,
    pipelineId: string | number,
    data: Partial<z.TypeOf<typeof UpdatePipelineSchema>>,
  ) {
    return this.client(
      PipelineResponse,
      `/organizations/${organizationId}/pipelines/${pipelineId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pipeline: data }),
      },
    );
  }

  updateAliasPatch(
    organizationId: string | number,
    pipelineId: string | number,
    aliasId: string | number,
    data: Partial<z.TypeOf<typeof UpdatePipelineSchema>>,
  ) {
    return this.client(
      AliasResponse,
      `/organizations/${organizationId}/pipelines/${pipelineId}/aliases/${aliasId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alias: data }),
      },
    );
  }

  toggleFavorite(organizationId: string | number, pipelineId: string | number) {
    return this.client(
      PipelineResponse,
      `/organizations/${organizationId}/pipelines/${pipelineId}/favorite`,
      {
        method: 'POST',
      },
    );
  }

  getAliasFromUrl(url: string) {
    return new URL(url).searchParams.get('alias') ?? 'latest';
  }

  getPublicPipeline(
    organizationId: string | number,
    pipelineId: string | number,
  ) {
    return this.client(
      PipelinePublicResponse,
      `/organizations/${organizationId}/pipelines/${pipelineId}/public`,
    );
  }

  getPipelineRunLogs(
    organizationId: string | number,
    pipelineId: string | number,
    runId: string | number,
    args: {
      block_name?: string;
      after?: string;
      per_page?: string | number;
    },
  ) {
    const url = buildUrlWithParams(
      `/organizations/${organizationId}/pipelines/${pipelineId}/runs/${runId}/logs`,
      { block_name: args.block_name, after: args.after },
    );

    return this.client(PipelineRunLogsResponse, url);
  }
}
