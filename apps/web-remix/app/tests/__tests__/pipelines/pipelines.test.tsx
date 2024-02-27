import React from "react";
import { test, describe, expect } from "vitest";
import {
  actionWithSession,
  loaderWithSession,
  RoutesProps,
  setupRoutes,
} from "~/tests/setup.tests";
import { ButtonHandle } from "~/tests/handles/Button.handle";
import { render, screen, waitFor } from "~/tests/render";
import { server } from "~/tests/server.mock";
import { PipelinesPage } from "~/components/pages/pipelines/list/page";
import { loader as listLoader } from "~/components/pages/pipelines/list/loader.server";
import { action as listAction } from "~/components/pages/pipelines/list/action.server";
import { action as newPipelineAction } from "~/components/pages/pipelines/new/action.server";
import { PipelineHandlers } from "~/tests/handlers/pipelines.handlers";
import { ListHandle } from "~/tests/handles/List.handle";
import { NewPipelinePage } from "~/components/pages/pipelines/new/page";
import { LinkHandle } from "~/tests/handles/Link.handle";
import { InputHandle } from "~/tests/handles/Input.handle";
import { pipelineFixture } from "~/tests/fixtures/pipeline.fixtures";
import { RootErrorBoundary } from "~/components/errorBoundaries/RootErrorBoundary";

const handlers = () => [
  ...new PipelineHandlers([
    pipelineFixture(),
    pipelineFixture({ id: 2, name: "sample-workflow" }),
  ]).handlers,
];

describe(PipelinesPage.name, () => {
  const setupServer = server(handlers());

  beforeAll(() => setupServer.listen());
  afterEach(() => setupServer.resetHandlers(...handlers()));
  afterAll(() => setupServer.close());

  test("should render correct amount of pipelines", async () => {
    new PipelinesObject().render({
      initialEntries: ["/2/pipelines"],
    });

    const workflowList = await ListHandle.fromLabelText(/Workflows list/i);

    expect(workflowList.children).toHaveLength(2);
  });

  test("should render error message if fetch fails", async () => {
    setupServer.use(new PipelineHandlers().getPipelinesErrorHandler());

    new PipelinesObject().render({
      initialEntries: ["/2/pipelines"],
    });

    await screen.findByText(/Internal server error/i);
  });

  test("should render only workflow-templates when pipelines are empty", async () => {
    setupServer.use(...new PipelineHandlers().handlers);

    new PipelinesObject().render({
      initialEntries: ["/2/pipelines"],
    });

    await screen.findByRole("button", { name: /Build a new AI workflow/i });
  });

  test("should delete pipeline", async () => {
    const page = new PipelinesObject().render({
      initialEntries: ["/2/pipelines"],
    });

    await page.deleteWorkflow("AI Chat");

    const workflowList = await ListHandle.fromLabelText(/Workflows list/i);

    expect(workflowList.children).toHaveLength(1);
  });

  test("should render error message if deletion fails", async () => {
    setupServer.use(new PipelineHandlers().deleteErrorHandler());

    const page = new PipelinesObject().render({
      initialEntries: ["/2/pipelines"],
    });

    await page.deleteWorkflow("AI Chat");

    await waitFor(async () => {
      screen.findByText(/Internal server error/i);
    });
  });

  test("should duplicate pipeline", async () => {
    new PipelinesObject().render({
      initialEntries: ["/2/pipelines"],
    });

    const button = await ButtonHandle.fromLabelText(
      /Duplicate workflow: sample-workflow/i
    );

    await button.click();

    await screen.findByText(/pipeline/i);
  });

  test("should render error message if duplicate fails", async () => {
    setupServer.use(new PipelineHandlers().createErrorHandler());

    new PipelinesObject().render({
      initialEntries: ["/2/pipelines"],
    });

    const button = await ButtonHandle.fromLabelText(
      /Duplicate workflow: sample-workflow/i
    );

    await button.click();

    await waitFor(async () => {
      screen.findByText(/Internal server error/i);
    });
  });

  test("should create pipeline from template", async () => {
    new PipelinesObject().render({
      initialEntries: ["/2/pipelines"],
    });

    const button = await ButtonHandle.fromLabelText(
      /Create workflow: Speech To Text/i
    );

    await button.click();

    await screen.findByText(/pipeline/i);
  });

  test("should create new pipeline", async () => {
    new PipelinesObject().render({
      initialEntries: ["/2/pipelines"],
    });

    const link = await LinkHandle.fromLabelText(/Create new workflow/i);

    await link.click();

    const input = await InputHandle.fromLabelText(/Name/i);
    await input.type("LALALA");

    const submit = await ButtonHandle.fromRole("Create workflow");

    await submit.click();

    await screen.findByText(/pipeline/i);
  });

  test("should render error message if creation fails", async () => {
    setupServer.use(new PipelineHandlers().createErrorHandler());

    new PipelinesObject().render({
      initialEntries: ["/2/pipelines/new"],
    });

    const input = await InputHandle.fromLabelText(/Name/i);
    await input.type("LALALA");

    const submit = await ButtonHandle.fromRole("Create workflow");

    await submit.click();

    await waitFor(async () => {
      screen.findByText(/Internal server error/i);
    });
  });
});

class PipelinesObject {
  render(props?: RoutesProps) {
    const Routes = setupRoutes([
      {
        path: "/",
        Component: () => <p>Dashboard</p>,
      },
      {
        path: "/:organizationId",
        ErrorBoundary: RootErrorBoundary,
        children: [
          {
            path: "/:organizationId/pipelines",
            Component: PipelinesPage,
            loader: loaderWithSession(listLoader),
            action: actionWithSession(listAction),
          },
          {
            path: "/:organizationId/pipelines/new",
            action: actionWithSession(newPipelineAction),
            Component: NewPipelinePage,
          },
          {
            path: "/:organizationId/pipelines/:pipelineId",
            Component: () => <p>Pipeline</p>,
          },
        ],
      },
    ]);

    render(<Routes {...props} />);

    return this;
  }

  async deleteWorkflow(name: string) {
    const button = await ButtonHandle.fromLabelText(`Remove workflow: ${name}`);

    await button.click();

    const confirmButton = await waitFor(() =>
      ButtonHandle.fromRole("Delete workflow")
    );

    await confirmButton.click();

    return this;
  }
}
