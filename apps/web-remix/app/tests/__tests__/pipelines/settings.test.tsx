import React from "react";
import { test, describe, expect } from "vitest";
import {
  actionWithSession,
  loaderWithSession,
  RoutesProps,
  setupRoutes,
} from "~/tests/setup.tests";
import { render, screen } from "~/tests/render";
import { server } from "~/tests/server.mock";
import { SettingsPage } from "~/components/pages/pipelines/settings/page";
import { loader as settingsLoader } from "~/components/pages/pipelines/settings/loader.server";
import { SettingsConfigurationPage } from "~/components/pages/pipelines/settings/configuration/page";
import { loader as settingsConfigurtionLoader } from "~/components/pages/pipelines/settings/configuration/loader.server";
import { RunHandlers } from "~/tests/handlers/run.handlers";
import { runFixture } from "~/tests/fixtures/run.fixtures";
import { PipelineHandlers } from "~/tests/handlers/pipelines.handlers";
import { pipelineFixture } from "~/tests/fixtures/pipeline.fixtures";
import { handlers as blockTypesHandlers } from "~/tests/handlers/blockTypes.handlers";
import { RootErrorBoundary } from "~/components/errorBoundaries/RootErrorBoundary";
import { action as buildAction } from "~/components/pages/pipelines/build/action.server";
import { ButtonHandle } from "~/tests/handles/Button.handle";
import { InputHandle } from "~/tests/handles/Input.handle";
import { TextareaHandle } from "~/tests/handles/Textarea.handle";
import { LinkHandle } from "~/tests/handles/Link.handle";

const handlers = () => [
  ...blockTypesHandlers(),
  ...new RunHandlers([runFixture(), runFixture({ id: 2 })]).handlers,
  ...new PipelineHandlers([pipelineFixture({ id: 2, name: "sample-workflow" })])
    .handlers,
];

describe("Workflow settings page", () => {
  const setupServer = server(handlers());

  beforeAll(() => setupServer.listen());
  afterEach(() => setupServer.resetHandlers(...handlers()));
  afterAll(() => setupServer.close());

  test("should change workflow name", async () => {
    const page = new SettingsObject().render({
      initialEntries: ["/2/pipelines/2/settings"],
    });

    await page.openEditNameModal();

    const nameInput = await page.getNameInput();
    expect(nameInput.value).toBe("sample-workflow");

    await nameInput.type(" NEW_NAME");

    await page.submitNameChange();

    await screen.findByText("sample-workflow NEW_NAME");
  });

  test("should show validation error if name incorrect", async () => {
    const page = new SettingsObject().render({
      initialEntries: ["/2/pipelines/2/settings"],
    });

    await page.openEditNameModal();

    const nameInput = await page.getNameInput();

    await nameInput.clear();
    await page.submitNameChange();

    await screen.findByText(/String must contain at least 2 character/i);
  });

  test("should show error message if loader fails", async () => {
    setupServer.use(new PipelineHandlers().getPipelineErrorHandler());
    new SettingsObject().render({
      initialEntries: ["/2/pipelines/2/settings"],
    });

    await screen.findByText(/Internal server error/i);
  });

  test("should edit workflow configuration", async () => {
    const page = new SettingsObject().render({
      initialEntries: ["/2/pipelines/2/settings"],
    });

    await page.openWorkflowConfig();
    await page.pasteWorkflowConfig(pipelineFixture({ name: "HEY_HO" }));
    await page.submitWorkflowConfig();

    await screen.findByText(/HEY_HO/i);
  });

  test("should show validation errors if pasted configuration is incorrect", async () => {
    const page = new SettingsObject().render({
      initialEntries: ["/2/pipelines/2/settings"],
    });

    await page.openWorkflowConfig();
    await page.pasteWorkflowConfig({});
    await page.submitWorkflowConfig();

    await screen.findByText(/name: Required/i);
    await screen.findByText(/interface_config: Required/i);
  });

  test("should error if pasted json is incorrect", async () => {
    const page = new SettingsObject().render({
      initialEntries: ["/2/pipelines/2/settings"],
    });

    await page.openWorkflowConfig();
    await page.pasteWorkflowConfig("");
    await page.submitWorkflowConfig();

    await screen.findByText(/configuration: Invalid JSON configuration/i);
  });
});

class SettingsObject {
  render(props?: RoutesProps) {
    const Routes = setupRoutes([
      {
        path: "/",
        ErrorBoundary: RootErrorBoundary,
        children: [
          {
            action: actionWithSession(buildAction),
            path: "/:organizationId/pipelines/:pipelineId/build",
          },
          {
            path: "/:organizationId/pipelines/:pipelineId/settings",
            Component: SettingsPage,
            loader: loaderWithSession(settingsLoader),
          },
          {
            path: "/:organizationId/pipelines/:pipelineId/settings/configuration",
            Component: SettingsConfigurationPage,
            loader: loaderWithSession(settingsConfigurtionLoader),
          },
        ],
      },
    ]);

    render(<Routes {...props} />);

    return this;
  }

  async openEditNameModal() {
    const button = await ButtonHandle.fromRole("Edit workflow name");
    await button.click();

    return this;
  }

  async getNameInput() {
    return InputHandle.fromRole("name");
  }

  async submitNameChange() {
    const submit = await ButtonHandle.fromRole("Save");
    await submit.click();

    return this;
  }

  async pasteWorkflowConfig(config: Record<string, any> | string) {
    const configuration = await TextareaHandle.fromTestId(
      "configuration-editor"
    );
    await configuration.paste(JSON.stringify(config));

    return this;
  }

  async openWorkflowConfig() {
    const link = await LinkHandle.fromRole("Workflow configuration");
    await link.click();

    return this;
  }

  async submitWorkflowConfig() {
    const submit = await ButtonHandle.fromLabelText("Save configuration");
    await submit.click();

    return this;
  }
}
