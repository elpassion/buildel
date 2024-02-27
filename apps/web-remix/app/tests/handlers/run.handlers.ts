import { http, HttpResponse } from "msw";
import {
  IPipelineRun,
  IPipelineRuns,
} from "~/components/pages/pipelines/pipeline.types";
import { IPaginationMeta } from "~/components/pagination/pagination.types";

export class RunHandlers {
  private runs: Map<number | string, IPipelineRun> = new Map();

  constructor(initials: IPipelineRun[] = []) {
    initials.forEach((run) => {
      this.runs.set(run.id, run);
    });
  }

  gerRunHandler() {
    return http.get(
      "/super-api/organizations/:organizationId/pipelines/:pipelineId/runs/:runId",
      ({ params }) => {
        const run = this.runs.get(Number(params.runId));

        if (!run) {
          return HttpResponse.json(
            {},
            {
              status: 404,
            }
          );
        }

        return HttpResponse.json<{
          data: IPipelineRun;
        }>(
          {
            data: run,
          },
          { status: 200 }
        );
      }
    );
  }

  gerRunErrorHandler() {
    return http.get(
      "/super-api/organizations/:organizationId/pipelines/:pipelineId/runs/:runId",
      () => {
        return HttpResponse.json<{
          data: IPipelineRun;
        }>(null, { status: 500 });
      }
    );
  }

  getRunsHandler() {
    return http.get(
      "/super-api/organizations/:organizationId/pipelines/:pipelineId/runs",
      () => {
        return HttpResponse.json<{
          data: IPipelineRuns;
          meta: IPaginationMeta;
        }>(
          {
            data: [...this.runs.values()],
            meta: {
              total: 2,
              page: 1,
              per_page: 10,
            },
          },
          { status: 200 }
        );
      }
    );
  }

  getRunsErrorHandler() {
    return http.get(
      "/super-api/organizations/:organizationId/pipelines/:pipelineId/runs",
      () => {
        return HttpResponse.json(null, { status: 500 });
      }
    );
  }

  get handlers() {
    return [this.getRunsHandler(), this.gerRunHandler()];
  }
}
