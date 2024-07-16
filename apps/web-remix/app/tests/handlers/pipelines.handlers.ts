import { http, HttpResponse } from 'msw';

import type {
  IAliasesResponse,
  IAliasResponse,
  IPipelineDetailsResponse,
  IPipelineResponse,
  IPipelinesResponse,
} from '~/api/pipeline/pipeline.contracts';
import type { IPipeline } from '~/components/pages/pipelines/pipeline.types';
import { aliasFixture } from '~/tests/fixtures/alias.fixtures';
import {
  pipelineDetailsFixture,
  pipelineFixture,
} from '~/tests/fixtures/pipeline.fixtures';

export class PipelineHandlers {
  private pipelines: Map<number, IPipeline> = new Map();

  constructor(initials: IPipeline[] = []) {
    initials.forEach((pipeline) => {
      this.pipelines.set(pipeline.id, pipeline);
    });
  }

  getPipelinesHandler() {
    return http.get(
      '/super-api/organizations/:organizationId/pipelines',
      () => {
        return HttpResponse.json<IPipelinesResponse>(
          {
            data: [...this.pipelines.values()],
          },
          { status: 200 },
        );
      },
    );
  }

  getPipelineDetails() {
    return http.get(
      '/super-api/organizations/:organizationId/pipelines/:pipelineId/details',
      () => {
        return HttpResponse.json<{ data: IPipelineDetailsResponse }>(
          { data: pipelineDetailsFixture() },
          { status: 200 },
        );
      },
    );
  }

  getPipelinesErrorHandler() {
    return http.get(
      '/super-api/organizations/:organizationId/pipelines',
      () => {
        return HttpResponse.json<IPipelinesResponse>(null, { status: 500 });
      },
    );
  }

  getPipelineHandler() {
    return http.get(
      '/super-api/organizations/:organizationId/pipelines/:pipelineId',
      ({ params }) => {
        const pipeline = this.pipelines.get(Number(params.pipelineId));

        if (!pipeline) {
          return HttpResponse.json(
            {},
            {
              status: 404,
            },
          );
        }

        return HttpResponse.json<{ data: IPipelineResponse }>(
          { data: pipeline },
          { status: 200 },
        );
      },
    );
  }

  getPipelineErrorHandler() {
    return http.get(
      '/super-api/organizations/:organizationId/pipelines/:pipelineId',
      () => {
        return HttpResponse.json<{ data: IPipelineResponse }>(null, {
          status: 500,
        });
      },
    );
  }

  updateHandler() {
    return http.put<any, { pipeline: IPipeline }>(
      '/super-api/organizations/:organizationId/pipelines/:pipelineId',
      async ({ request, params }) => {
        const data = await request.json();
        const pipelineId = Number(params.pipelineId);

        const pipeline = this.pipelines.get(pipelineId);

        if (!pipeline) {
          return HttpResponse.json(
            {},
            {
              status: 404,
            },
          );
        }

        const updated = { ...pipeline, ...data.pipeline };

        this.pipelines.set(pipelineId, updated);

        return HttpResponse.json({ data: updated }, { status: 200 });
      },
    );
  }

  updateErrorHandler() {
    return http.put(
      '/super-api/organizations/:organizationId/pipelines/:pipelineId',
      async () => {
        return HttpResponse.json(null, { status: 404 });
      },
    );
  }

  deleteHandler() {
    return http.delete(
      '/super-api/organizations/:organizationId/pipelines/:pipelineId',
      ({ params }) => {
        const { pipelineId } = params;

        const id = Number(pipelineId);

        const deletedPipeline = this.pipelines.get(id);

        if (!deletedPipeline) return HttpResponse.json(null, { status: 404 });

        this.pipelines.delete(id);

        return HttpResponse.json(null);
      },
    );
  }

  deleteErrorHandler() {
    return http.delete(
      '/super-api/organizations/:organizationId/pipelines/:pipelineId',
      () => {
        return HttpResponse.json(null, { status: 404 });
      },
    );
  }

  createHandler() {
    return http.post(
      '/super-api/organizations/:organizationId/pipelines',
      async () => {
        return HttpResponse.json(
          { data: pipelineFixture({ id: this.pipelines.size + 1 }) },
          { status: 201 },
        );
      },
    );
  }

  createErrorHandler() {
    return http.post(
      '/super-api/organizations/:organizationId/pipelines',
      async () => {
        return HttpResponse.json(null, { status: 404 });
      },
    );
  }

  get handlers() {
    return [
      this.getPipelineHandler(),
      this.getPipelinesHandler(),
      this.deleteHandler(),
      this.createHandler(),
      this.updateHandler(),
      this.getPipelineDetails(),
    ];
  }
}

export class AliasHandlers {
  private aliases: Map<number | string, IAliasResponse> = new Map();

  constructor(initials: IAliasResponse[] = []) {
    initials.forEach((alias) => {
      this.aliases.set(alias.id, alias);
    });

    aliasFixture({
      id: 2,
      name: 'alias',
      config: {
        ...aliasFixture().config,
        blocks: [aliasFixture().config.blocks[0]],
        connections: [],
      },
    });
  }

  updateHandler() {
    return http.patch<any, { alias: IAliasResponse }>(
      '/super-api/organizations/:organizationId/pipelines/:pipelineId/aliases/:aliasId',
      async ({ request, params }) => {
        const data = await request.json();
        const aliasId = Number(params.aliasId);

        const alias = this.aliases.get(aliasId);

        if (!alias) {
          return HttpResponse.json(
            {},
            {
              status: 404,
            },
          );
        }

        const updated = { ...alias, ...data.alias };

        this.aliases.set(aliasId, updated);

        return HttpResponse.json({ data: updated }, { status: 200 });
      },
    );
  }

  createHandler() {
    return http.post<any, { alias: IAliasResponse }>(
      '/super-api/organizations/:organizationId/pipelines/:pipelineId/aliases',
      async ({ request }) => {
        const { alias } = await request.json();

        alias.id = this.aliases.size + 1;

        this.aliases.set(3, alias);

        return HttpResponse.json<{ data: IAliasResponse }>(
          { data: alias },
          {
            status: 200,
          },
        );
      },
    );
  }

  deleteHandler() {
    return http.delete(
      '/super-api/organizations/:organizationId/pipelines/:pipelineId/aliases/:aliasId',
      async ({ params }) => {
        const { aliasId } = params;

        this.aliases.delete(Number(aliasId));

        return HttpResponse.json(
          {},
          {
            status: 200,
          },
        );
      },
    );
  }

  getAliasHandler() {
    return http.get(
      '/super-api/organizations/:organizationId/pipelines/:pipelineId/aliases/:aliasId',
      ({ params }) => {
        const { aliasId } = params;
        const alias = this.aliases.get(Number(aliasId));

        if (!alias) {
          return HttpResponse.json(
            {},
            {
              status: 404,
            },
          );
        }

        return HttpResponse.json<{ data: IAliasResponse }>(
          { data: alias },
          {
            status: 200,
          },
        );
      },
    );
  }

  getAliasesHandler() {
    return http.get(
      '/super-api/organizations/:organizationId/pipelines/:pipelineId/aliases',
      () => {
        return HttpResponse.json<{ data: IAliasesResponse }>(
          {
            data: [...this.aliases.values()],
          },
          {
            status: 200,
          },
        );
      },
    );
  }

  get handlers() {
    return [
      this.createHandler(),
      this.getAliasesHandler(),
      this.getAliasHandler(),
      this.deleteHandler(),
      this.updateHandler(),
    ];
  }

  get length() {
    return this.aliases.size;
  }
}

export function pipelineFixtureWithUnfilledBlock() {
  return pipelineFixture({
    id: 555,
    name: 'empty-block',
    config: {
      ...pipelineFixture().config,
      connections: [],
      blocks: [
        {
          name: 'chat_123321',
          opts: {},
          inputs: [],
          connections: [],
          position: {
            x: 327,
            y: -952,
          },
          type: 'chat',
        },
      ],
    },
  });
}
