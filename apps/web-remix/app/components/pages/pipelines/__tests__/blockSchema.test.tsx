import React from "react";
import { test, describe } from "vitest";
import { render } from "~/tests/render";
import { server } from "~/tests/server.mock";
import {
  actionWithSession,
  RoutesProps,
  setupRoutes,
} from "~/tests/setup.tests";
import { loader as editBlockLoader } from "../build/editBlock/loader.server";
import { handlers as blockTypesHandlers } from "./blockTypes.handlers";
import { action as buildAction } from "../build/action.server";
import { loader as buildLoader } from "../build/loader.server";
import { EditBlockPage } from "../build/editBlock/page";
import { PipelineBuilder } from "../build/page";
import { PipelinesPage } from "../list/page";
import {
  handlers as pipelinesHandlers,
  pipelineAliasesHandlers,
} from "./pipelines.handlers";

describe(EditBlockPage.name, () => {
  const setupServer = server([
    ...pipelinesHandlers,
    ...pipelineAliasesHandlers,
    ...blockTypesHandlers,
  ]);

  beforeAll(() => setupServer.listen());
  afterEach(() => setupServer.resetHandlers());
  afterAll(() => setupServer.close());

  test("should render correct amount of build nodes based on pipeline config", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });
  });
});

class PipelineObject {
  render(props?: RoutesProps) {
    const Routes = setupRoutes([
      {
        action: actionWithSession(buildAction),
        loader: actionWithSession(buildLoader),
        path: "/:organizationId/pipelines/:pipelineId/build",
        Component: PipelineBuilder,
      },

      {
        loader: actionWithSession(editBlockLoader),
        path: "/:organizationId/pipelines/:pipelineId/build/blocks/:blockName",
        Component: EditBlockPage,
      },
    ]);

    render(<Routes {...props} />);

    return this;
  }
}
