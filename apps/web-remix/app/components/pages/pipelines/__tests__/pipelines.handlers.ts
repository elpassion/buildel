import { http, HttpResponse } from "msw";
import {
  IAliasesResponse,
  IAliasResponse,
  IPipelineResponse,
  IPipelinesResponse,
} from "~/api/pipeline/pipeline.contracts";
import { pipelineFixture } from "~/tests/fixtures/pipeline.fixtures";
import { IPipeline } from "~/components/pages/pipelines/pipeline.types";
import { aliasFixture } from "~/tests/fixtures/alias.fixtures";

const pipelines = new Map<number, IPipeline>();
pipelines.set(1, pipelineFixture());
pipelines.set(2, pipelineFixture({ id: 2, name: "sample-workflow" }));

export const handlers = [
  http.get("/super-api/organizations/:organizationId/pipelines", () => {
    return HttpResponse.json<IPipelinesResponse>(
      {
        data: [...pipelines.values()],
      },
      { status: 200 }
    );
  }),

  http.get(
    "/super-api/organizations/:organizationId/pipelines/:pipelineId",
    ({ params }) => {
      const pipeline = pipelines.get(Number(params.pipelineId));

      if (!pipeline) {
        return HttpResponse.json(
          {},
          {
            status: 404,
          }
        );
      }

      return HttpResponse.json<{ data: IPipelineResponse }>(
        { data: pipeline },
        { status: 200 }
      );
    }
  ),

  http.put<any, { pipeline: IPipeline }>(
    "/super-api/organizations/:organizationId/pipelines/:pipelineId",
    async ({ request, params }) => {
      const data = await request.json();
      const pipelineId = Number(params.pipelineId);

      const pipeline = pipelines.get(pipelineId);

      if (!pipeline) {
        return HttpResponse.json(
          {},
          {
            status: 404,
          }
        );
      }

      const updated = { ...pipeline, ...data.pipeline };

      pipelines.set(pipelineId, updated);

      return HttpResponse.json({ data: updated }, { status: 200 });
    }
  ),

  http.delete(
    "/super-api/organizations/:organizationId/pipelines/:pipelineId",
    ({ params }) => {
      const { pipelineId } = params;

      const id = Number(pipelineId);

      const deletedPipeline = pipelines.get(id);

      if (!deletedPipeline) return HttpResponse.json(null, { status: 404 });

      pipelines.delete(id);

      return HttpResponse.json(null);
    }
  ),

  http.post("/super-api/organizations/:organizationId/pipelines", async () => {
    return HttpResponse.json(
      { data: pipelineFixture({ id: 321 }) },
      { status: 201 }
    );
  }),
];

export const emptyHandlers = [
  http.get("/super-api/organizations/:organizationId/pipelines", () => {
    return HttpResponse.json<IPipelinesResponse>(
      {
        data: [],
      },
      { status: 200 }
    );
  }),
];

const aliases = new Map<number, IAliasResponse>();
aliases.set(1, aliasFixture({ id: 1 }));
aliases.set(
  2,
  aliasFixture({
    id: 2,
    name: "alias",
    config: { ...aliasFixture().config, blocks: [], connections: [] },
  })
);

export const pipelineAliasesHandlers = [
  http.post<any, { alias: IAliasResponse }>(
    "/super-api/organizations/:organizationId/pipelines/:pipelineId/aliases",
    async ({ request }) => {
      const { alias } = await request.json();

      alias.id = 3;

      aliases.set(3, alias);

      return HttpResponse.json<{ data: IAliasResponse }>(
        { data: alias },
        {
          status: 200,
        }
      );
    }
  ),

  http.delete(
    "/super-api/organizations/:organizationId/pipelines/:pipelineId/aliases/:aliasId",
    async ({ params }) => {
      const { aliasId } = params;

      aliases.delete(Number(aliasId));

      return HttpResponse.json(
        {},
        {
          status: 200,
        }
      );
    }
  ),

  http.get(
    "/super-api/organizations/:organizationId/pipelines/:pipelineId/aliases/:aliasId",
    ({ params }) => {
      const { aliasId } = params;
      const alias = aliases.get(Number(aliasId));

      if (!alias) {
        return HttpResponse.json(
          {},
          {
            status: 404,
          }
        );
      }

      return HttpResponse.json<{ data: IAliasResponse }>(
        { data: alias },
        {
          status: 200,
        }
      );
    }
  ),

  http.get(
    "/super-api/organizations/:organizationId/pipelines/:pipelineId/aliases",
    () => {
      return HttpResponse.json<{ data: IAliasesResponse }>(
        {
          data: [...aliases.values()],
        },
        {
          status: 200,
        }
      );
    }
  ),
];
