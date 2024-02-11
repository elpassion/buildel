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
import { PipelinesPage } from "../page";
import { loader } from "../loader";
import { action } from "../action";
import { emptyHandlers, handlers } from "./pipelines.handlers";
import { ListHandle } from "~/tests/handles/List.handle";

describe(PipelinesPage.name, () => {
  const setupServer = server(handlers);

  beforeAll(() => setupServer.listen());
  afterEach(() => setupServer.resetHandlers());
  afterAll(() => setupServer.close());

  test("should render correct amount of pipelines", async () => {
    new PipelinesObject().render({
      initialEntries: ["/2/pipelines"],
    });

    const workflowList = await ListHandle.fromLabelText(/Workflows list/i);

    expect(workflowList.children).toHaveLength(2);
  });

  test("should render only workflow-templates when pipelines are empty", async () => {
    setupServer.use(...emptyHandlers);

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
        loader: loaderWithSession(loader),
        action: actionWithSession(action),
      },
    ]);

    render(<Routes {...props} />);

    return this;
  }
}
