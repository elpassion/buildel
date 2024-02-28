import React from "react";
import { test, describe, expect, vi } from "vitest";
import {
  loaderWithSession,
  RoutesProps,
  setupRoutes,
} from "~/tests/setup.tests";
import { render, waitFor, screen, act } from "~/tests/render";
import { server } from "~/tests/server.mock";
import { PipelineBuilder } from "~/components/pages/pipelines/build/page";
import { loader as builderLoader } from "~/components/pages/pipelines/build/loader.server";
import { PipelineHandlers } from "~/tests/handlers/pipelines.handlers";
import { simplePipelineFixture } from "~/tests/fixtures/pipeline.fixtures";
import { handlers as blockTypesHandlers } from "~/tests/handlers/blockTypes.handlers";
import { RootErrorBoundary } from "~/components/errorBoundaries/RootErrorBoundary";
import { ButtonHandle } from "~/tests/handles/Button.handle";
import { TextareaHandle } from "~/tests/handles/Textarea.handle";
import { WebSocketServerMock } from "~/tests/WebSocketServerMock";
import { runHandlers } from "~/tests/__tests__/pipelines/pipeline-run.handlers";

const handlers = () => [
  ...runHandlers(),
  ...blockTypesHandlers(),
  ...new PipelineHandlers([simplePipelineFixture()]).handlers,
];

describe("Pipeline workflow run", () => {
  const onMessageMock = vi.fn();
  const setupServer = server(handlers());
  const wsServer = new WebSocketServerMock({ onMessage: onMessageMock });

  beforeAll(() => {
    setupServer.listen();
  });

  afterEach(() => {
    setupServer.resetHandlers(...handlers());
  });
  afterAll(() => {
    setupServer.close();
    wsServer.close();
  });

  test("should enable Send buttons when workflow is running", async () => {
    const page = new PipelineRunObject().render({
      initialEntries: ["/2/pipelines/1/build"],
    });

    const startButton = await page.startWorkflowButton();
    const textInputSendButton = await page.sendMessageButton("text_input_1");

    expect(textInputSendButton.isDisabled()).toBe(true);

    await startButton.click();

    await waitFor(() => {
      expect(textInputSendButton.isDisabled()).toBe(false);
    });
  });

  test("should render streamed block output", async () => {
    const page = new PipelineRunObject().render({
      initialEntries: ["/1/pipelines/1/build"],
    });

    const startButton = await page.startWorkflowButton();
    await startButton.click();

    const textInputTextarea = await page.textBlockInput("text_input_1-input");
    const textInputSendButton = await page.sendMessageButton("text_input_1");

    await textInputTextarea.type("new message");
    await textInputSendButton.click();
    expect(onMessageMock).toHaveBeenCalledWith("new message");

    await act(async () => {
      wsServer.send({
        topicName: "pipelines:1:1",
        eventName: "output:text_output_1:output",
        payload: { message: "Hey" },
      });
      wsServer.send({
        topicName: "pipelines:1:1",
        eventName: "output:text_output_1:output",
        payload: { message: " HO" },
      });
    });

    await screen.findByText("Hey HO");
  });
});

class PipelineRunObject {
  render(props?: RoutesProps) {
    const Routes = setupRoutes([
      {
        path: "/",
        ErrorBoundary: RootErrorBoundary,
        children: [
          {
            path: "/:organizationId/pipelines/:pipelineId/build",
            Component: PipelineBuilder,
            loader: loaderWithSession(builderLoader),
          },
        ],
      },
    ]);

    render(<Routes {...props} />);

    return this;
  }

  async startWorkflowButton() {
    return ButtonHandle.fromRole("Start workflow");
  }

  async sendMessageButton(blockName: string) {
    return ButtonHandle.fromLabelText(`Send message from: ${blockName}`);
  }

  async textBlockInput(blockName: string) {
    return TextareaHandle.fromTestId(blockName);
  }
}
