import { http, HttpResponse } from "msw";
import { IPipelineResponse } from "~/api/pipeline/pipeline.contracts";
import { pipelineFixture } from "~/tests/fixtures/pipeline.fixtures";
import { IPipeline } from "~/components/pages/pipelines/pipeline.types";

const pipelines = new Map<number, IPipeline>();
pipelines.set(1, pipelineFixture());
pipelines.set(2, pipelineFixture({ id: 2, name: "sample-workflow" }));

export const handlers = [
  http.get("/super-api/organizations/:organizationId/pipelines", () => {
    return HttpResponse.json<IPipelineResponse>(
      {
        data: [...pipelines.values()],
      },
      { status: 200 }
    );
  }),

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
    return HttpResponse.json<IPipelineResponse>(
      {
        data: [],
      },
      { status: 200 }
    );
  }),
];
