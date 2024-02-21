import React from "react";
import { test, describe, expect } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
  Matcher,
} from "~/tests/render";
import { ButtonHandle } from "~/tests/handles/Button.handle";
import { InputHandle } from "~/tests/handles/Input.handle";
import userEvent from "@testing-library/user-event";
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
import { PipelineLayout } from "../pipelineLayout/page";
import {
  loader as layoutLoader,
  action as layoutAction,
} from "../pipelineLayout/index.server";
import {
  handlers as pipelinesHandlers,
  pipelineAliasesHandlers,
} from "./pipelines.handlers";

describe(PipelinesPage.name, () => {
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

    const blocks = await page.getBlocks();

    expect(blocks).toHaveLength(3);
  });

  test("should render blocks types", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    const blockGroups = await page.getBlockTypeGroups();

    expect(blockGroups).toHaveLength(9);
  });

  test("should add block after clicking on side menu item", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    const blockGroups = await page.getBlockTypeGroups();

    await page.hoverOverBlockGroup(blockGroups[0]);

    const blockTypes = await page.getBlockTypes();

    const addButton = blockTypes[0].querySelector("button");

    await act(() => userEvent.click(addButton!));

    const blocks = await page.getBlocks();

    expect(blocks).toHaveLength(4);
  });

  test("should remove block after clicking trash icon on node", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    const deleteButton = await ButtonHandle.fromLabelText(
      /Delete block: text_input_1/i
    );

    await act(() => page.fireBlockOnClick(deleteButton.buttonElement));

    const confirmButton = await ButtonHandle.fromRole("Confirm");

    await act(() => confirmButton.click());

    const blocks = await page.getBlocks();

    expect(blocks).toHaveLength(2);
  });

  test("should edit block name", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    const editButton = await ButtonHandle.fromLabelText(
      /Edit block: text_output_1/i
    );

    await act(() => page.fireBlockOnClick(editButton.buttonElement));

    await screen.findByText(/Text Output 1/i);

    const input = await InputHandle.fromRole();

    expect(input.value).toBe("text_output_1");

    await input.type("super_output");

    const submit = await ButtonHandle.fromRole("Save changes");

    await act(async () => await submit.click());

    await waitFor(() => screen.findByText(/super_output/i));
  });

  test("should create alias", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    await page.createAlias();

    const links = await page.getAliasLinks();

    expect(links).toHaveLength(3);
  });

  test("should delete alias", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    const links = await page.getAliasLinks();

    expect(links).toHaveLength(3);

    await page.openAliasDropdown();

    await page.deleteAlias(/Delete alias: sample-workflow v1/i);

    const linksAfterDelete = await page.getAliasLinks();

    expect(linksAfterDelete).toHaveLength(2);
  });

  test("change alias and load its configuration", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    const blocks = await page.getBlocks();

    expect(blocks).toHaveLength(3);

    await page.openAliasDropdown();

    await page.selectAlias(/Select alias: alias/i);

    const aliasBlocks = await waitFor(() =>
      screen.queryAllByTestId("builder-block")
    );

    expect(aliasBlocks).toHaveLength(1);
  });

  test("shouldn't allow to edit configuration", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    await page.openAliasDropdown();

    await page.selectAlias(/Select alias: alias/i);

    expect(screen.queryByLabelText(/Delete block: text_input_1/i)).toBeNull();
    expect(screen.queryByLabelText(/Edit block: text_input_1/i)).toBeNull();
    expect(screen.queryAllByRole("menuitem")).toHaveLength(0);
  });

  test("should restore alias", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    await page.openAliasDropdown();

    await page.selectAlias(/Select alias: alias/i);

    await page.restore();

    await page.confirmAction();

    const aliasBlocks = await waitFor(() =>
      screen.queryAllByTestId("builder-block")
    );

    expect(aliasBlocks).toHaveLength(1);
  });
});

class PipelineObject {
  render(props?: RoutesProps) {
    const Routes = setupRoutes([
      {
        action: actionWithSession(layoutAction),
        loader: actionWithSession(layoutLoader),
        path: "/:organizationId/pipelines/:pipelineId",
        Component: PipelineLayout,
        children: [
          {
            action: actionWithSession(buildAction),
            loader: actionWithSession(buildLoader),
            path: "/:organizationId/pipelines/:pipelineId/build",
            Component: PipelineBuilder,
          },
        ],
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

  async getBlocks() {
    return screen.findAllByTestId("builder-block");
  }

  async getBlockTypeGroups() {
    return screen.findAllByRole("menuitem");
  }

  async hoverOverBlockGroup(element: Element) {
    await act(() => userEvent.hover(element));

    return this;
  }

  async getBlockTypes() {
    const submenu = await screen.findByTestId(/submenu-text/i);
    return submenu.querySelectorAll("#draggable-block-item");
  }

  //to avoid issue with d3.drag lib (document = null).
  async fireBlockOnClick(element: Element) {
    fireEvent(
      element,
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );

    return this;
  }

  async openAliasDropdown() {
    const aliasDropdown = await ButtonHandle.fromLabelText(/Select aliases/i);

    await act(async () => {
      await aliasDropdown.click();
    });

    return this;
  }

  async restore() {
    const restore = await ButtonHandle.fromRole("Restore");

    await act(async () => {
      await restore.click();
    });

    return this;
  }

  async createAlias() {
    const create = await ButtonHandle.fromTestId("create-alias");

    await act(async () => {
      await create.click();
    });

    return this;
  }

  async selectAlias(name: Matcher) {
    const aliasLink = await ButtonHandle.fromLabelText(name);

    await act(async () => {
      await aliasLink.click();
    });

    return this;
  }

  async getAliasLinks() {
    return screen.findAllByTestId("alias-link");
  }

  async deleteAlias(label: Matcher) {
    const deleteButton = await ButtonHandle.fromLabelText(label);

    await act(async () => {
      await deleteButton.click();
    });

    return this;
  }

  async confirmAction() {
    const confirmButton = await ButtonHandle.fromRole("Confirm");

    await act(async () => {
      await confirmButton.click();
    });

    return this;
  }
}
