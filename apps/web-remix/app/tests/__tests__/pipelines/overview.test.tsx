import React from "react";
import { test, describe, expect } from "vitest";
import {
  loaderWithSession,
  RoutesProps,
  setupRoutes,
} from "~/tests/setup.tests";
import { render, screen } from "~/tests/render";
import { server } from "~/tests/server.mock";
import { OverviewPage } from "~/components/pages/pipelines/overview/page";
import { loader as overviewLoader } from "~/components/pages/pipelines/overview/loader.server";
import { PipelineRunOverview } from "~/components/pages/pipelines/runOverview/page";
import { loader as runOverviewLoader } from "~/components/pages/pipelines/runOverview/loader.server";
import { PipelineRunCosts } from "~/components/pages/pipelines/runCosts/page";
import { loader as runCostsLoader } from "~/components/pages/pipelines/runCosts/loader.server";
import { ListHandle } from "~/tests/handles/List.handle";
import { RunHandlers } from "~/tests/handlers/run.handlers";
import { runFixture } from "~/tests/fixtures/run.fixtures";
import { PipelineHandlers } from "~/tests/handlers/pipelines.handlers";
import { pipelineFixture } from "~/tests/fixtures/pipeline.fixtures";
import { handlers as blockTypesHandlers } from "~/tests/handlers/blockTypes.handlers";
import { RootErrorBoundary } from "~/components/errorBoundaries/RootErrorBoundary";

const handlers = () => [
  ...blockTypesHandlers(),
  ...new RunHandlers([runFixture(), runFixture({ id: 2 })]).handlers,
  ...new PipelineHandlers([pipelineFixture({ id: 2, name: "sample-workflow" })])
    .handlers,
];

describe("Workflow overview", () => {
  const setupServer = server(handlers());

  beforeAll(() => setupServer.listen());
  afterEach(() => setupServer.resetHandlers(...handlers()));
  afterAll(() => setupServer.close());

  test("should render correct amount of runs", async () => {
    new OverviewObject().render({
      initialEntries: ["/2/pipelines/2/runs"],
    });

    const list = await ListHandle.fromLabelText(/Runs list/i);

    expect(list.children).toHaveLength(3);
    expect(await screen.findAllByText(/finished/i)).toHaveLength(2);
  });

  test("should render error message if Runs fetch fails", async () => {
    setupServer.use(new RunHandlers([]).getRunsErrorHandler());
    new OverviewObject().render({
      initialEntries: ["/2/pipelines/2/runs"],
    });

    await screen.findAllByText(/Internal server error/i);
  });

  test("should render empty list message if runs empty", async () => {
    setupServer.use(...new RunHandlers([]).handlers);
    new OverviewObject().render({
      initialEntries: ["/2/pipelines/2/runs"],
    });

    await screen.findByText(/There is no runs yet/i);
  });

  test("should render readOnly run builder", async () => {
    new OverviewObject().render({
      initialEntries: ["/2/pipelines/2/runs/1"],
    });

    expect(screen.queryByLabelText(/Delete block: text_input_1/i)).toBeNull();
    expect(screen.queryByLabelText(/Edit block: text_input_1/i)).toBeNull();
    expect(screen.queryByLabelText(/run/i)).toBeNull();
  });

  test("should render error message if Run fetch fails", async () => {
    setupServer.use(new RunHandlers([]).gerRunErrorHandler());
    new OverviewObject().render({
      initialEntries: ["/2/pipelines/2/runs/1"],
    });

    await screen.findAllByText(/Internal server error/i);
  });

  test("should render error message if run not found", async () => {
    new OverviewObject().render({
      initialEntries: ["/2/pipelines/2/runs/123"],
    });

    await screen.findByText(/page not found/i);
  });

  test("should render costs list", async () => {
    new OverviewObject().render({
      initialEntries: ["/2/pipelines/2/runs/1/costs"],
    });

    const list = await ListHandle.fromLabelText(/Run cost list/i);
    expect(list.children).toHaveLength(3);
  });

  test("should render error message if Costs fetch fails", async () => {
    setupServer.use(new RunHandlers([]).gerRunErrorHandler());
    new OverviewObject().render({
      initialEntries: ["/2/pipelines/2/runs/1/costs"],
    });

    await screen.findAllByText(/Internal server error/i);
  });

  test("should render correct amount of run costs", async () => {
    new OverviewObject().render({
      initialEntries: ["/2/pipelines/2/runs/1/costs"],
    });

    const list = await ListHandle.fromLabelText(/Run cost list/i);
    expect(list.children).toHaveLength(3);
  });

  test("should render empty list message if costs empty", async () => {
    setupServer.use(...new RunHandlers([runFixture({ costs: [] })]).handlers);
    new OverviewObject().render({
      initialEntries: ["/2/pipelines/2/runs/1/costs"],
    });

    await screen.findByText(/There is no costs yet/i);
  });
});

class OverviewObject {
  render(props?: RoutesProps) {
    const Routes = setupRoutes([
      {
        path: "/",
        ErrorBoundary: RootErrorBoundary,
        children: [
          {
            path: "/:organizationId/pipelines/:pipelineId/runs",
            Component: OverviewPage,
            loader: loaderWithSession(overviewLoader),
          },
          {
            path: "/:organizationId/pipelines/:pipelineId/runs/:runId",
            Component: PipelineRunOverview,
            loader: loaderWithSession(runOverviewLoader),
          },
          {
            path: "/:organizationId/pipelines/:pipelineId/runs/:runId/costs",
            Component: PipelineRunCosts,
            loader: loaderWithSession(runCostsLoader),
          },
        ],
      },
    ]);

    render(<Routes {...props} />);

    return this;
  }
}
