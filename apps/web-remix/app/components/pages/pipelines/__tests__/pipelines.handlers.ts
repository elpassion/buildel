import { http, HttpResponse } from "msw";
import {
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
    () => {
      return HttpResponse.json<{ data: IPipelineResponse }>(
        { data: pipelineFixture({ id: 123 }) },
        { status: 200 }
      );
    }
  ),

  http.get(
    "/super-api/organizations/:organizationId/pipelines/:pipelineId/aliases/:aliasId",
    () => {
      return HttpResponse.json<{ data: IAliasResponse }>(
        { data: aliasFixture({ id: 123 }) },
        {
          status: 200,
        }
      );
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

  http.put(
    "/super-api/organizations/:organizationId/pipelines/:pipelineId",
    async () => {
      return HttpResponse.json({ data: pipelineFixture() }, { status: 200 });
    }
  ),
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

let pipeline = pipelineFixture({ id: 123 });

export const updatedPipelineHandles = [
  http.get(
    "/super-api/organizations/:organizationId/pipelines/:pipelineId",
    () => {
      return HttpResponse.json<{ data: IPipelineResponse }>(
        { data: pipeline },
        { status: 200 }
      );
    }
  ),
  http.put<any, { pipeline: IPipeline }>(
    "/super-api/organizations/:organizationId/pipelines/:pipelineId",
    async ({ request }) => {
      const data = await request.json();
      pipeline = { ...pipeline, ...data.pipeline };

      return HttpResponse.json({ data: pipeline }, { status: 200 });
    }
  ),
];
