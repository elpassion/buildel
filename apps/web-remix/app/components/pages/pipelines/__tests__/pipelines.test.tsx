import React from "react";
import { test, describe, expect } from "vitest";
import {
  actionWithSession,
  loaderWithSession,
  RoutesProps,
  setupRoutes,
} from "~/tests/setup.tests";
import { ButtonHandle } from "~/tests/handles/Button.handle";
import { render, screen, waitFor, act } from "~/tests/render";
import { server } from "~/tests/server.mock";
import { PipelinesPage } from "../list/page";
import { loader as listLoader } from "../list/loader.server";
import { action as listAction } from "../list/action.server";
import { action as newPipelineAction } from "../new/action.server";
import { PipelineHandlers } from "~/tests/handlers/pipelines.handlers";
import { ListHandle } from "~/tests/handles/List.handle";
import { NewPipelinePage } from "../new/page";
import { LinkHandle } from "~/tests/handles/Link.handle";
import { InputHandle } from "~/tests/handles/Input.handle";
import { pipelineFixture } from "~/tests/fixtures/pipeline.fixtures";

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

  test("should render only workflow-templates when pipelines are empty", async () => {
    setupServer.use(...new PipelineHandlers().handlers);

    new PipelinesObject().render({
      initialEntries: ["/2/pipelines"],
    });

    await waitFor(() =>
      screen.findByRole("button", { name: /Build a new AI workflow/i })
    );
  });

  test("should delete pipeline", async () => {
    new PipelinesObject().render({
      initialEntries: ["/2/pipelines"],
    });

    const button = await ButtonHandle.fromLabelText(
      /Remove workflow: AI Chat/i
    );

    await button.click();

    const confirmButton = await waitFor(() =>
      ButtonHandle.fromRole("Delete workflow")
    );

    await confirmButton.click();

    const workflowList = await ListHandle.fromLabelText(/Workflows list/i);

    expect(workflowList.children).toHaveLength(1);
  });

  test("should duplicate pipeline", async () => {
    new PipelinesObject().render({
      initialEntries: ["/2/pipelines"],
    });

    const button = await ButtonHandle.fromLabelText(
      /Duplicate workflow: sample-workflow/i
    );

    await button.click();

    const text = await screen.findByText(/pipeline/i);

    expect(text).toBeTruthy();
  });

  test("should create pipeline from template", async () => {
    new PipelinesObject().render({
      initialEntries: ["/2/pipelines"],
    });

    const button = await ButtonHandle.fromLabelText(
      /Create workflow: Speech To Text/i
    );

    await button.click();

    const text = await screen.findByText(/pipeline/i);
    expect(text).toBeTruthy();
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

    const text = await screen.findByText(/pipeline/i);
    expect(text).toBeTruthy();
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
        Component: () => <p>organizationId</p>,
      },
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
    ]);

    render(<Routes {...props} />);

    return this;
  }
}