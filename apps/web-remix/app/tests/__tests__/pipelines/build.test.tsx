import React from "react";
import { test, describe, expect } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  Matcher,
  findByText,
} from "~/tests/render";
import { ButtonHandle } from "~/tests/handles/Button.handle";
import { InputHandle } from "~/tests/handles/Input.handle";
import userEvent from "@testing-library/user-event";
import { server } from "~/tests/server.mock";
import {
  actionWithSession,
  loaderWithSession,
  RoutesProps,
  setupRoutes,
} from "~/tests/setup.tests";
import { loader as editBlockLoader } from "~/components/pages/pipelines/build/editBlock/loader.server";
import { action as buildAction } from "~/components/pages/pipelines/build/action.server";
import { loader as buildLoader } from "~/components/pages/pipelines/build/loader.server";
import { EditBlockPage } from "~/components/pages/pipelines/build/editBlock/page";
import { PipelineBuilder } from "~/components/pages/pipelines/build/page";
import { PipelineLayout } from "~/components/pages/pipelines/pipelineLayout/page";
import { BuildErrorBoundary } from "~/components/pages/pipelines/build/errorBoundary";
import {
  loader as layoutLoader,
  action as layoutAction,
} from "~/components/pages/pipelines/pipelineLayout/index.server";
import {
  PipelineHandlers,
  pipelineFixtureWithUnfilledBlock,
} from "~/tests/handlers/pipelines.handlers";
import { TextareaHandle } from "~/tests/handles/Textarea.handle";
import {
  CreatableSelectHandle,
  SelectHandle,
} from "~/tests/handles/SelectHandle";
import { RadioHandle } from "~/tests/handles/Radio.handle";
import { pipelineFixture } from "~/tests/fixtures/pipeline.fixtures";
import { ListHandle } from "~/tests/handles/List.handle";
import { buildHandlers } from "./build.handlers";
import { WebSocketClientMock } from "~/tests/WebSocketClientMock";

describe(PipelineBuilder.name, () => {
  const setupServer = server([...buildHandlers()]);

  beforeAll(() => {
    //@ts-ignore
    global.WebSocket = WebSocketClientMock;
    setupServer.listen();
  });
  afterEach(() => setupServer.resetHandlers(...buildHandlers()));
  afterAll(() => setupServer.close());

  test("should render correct amount of build nodes based on pipeline config", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    const blocks = await page.getBlocks();

    expect(blocks).toHaveLength(4);
  });

  test("should render error message if loader fail", async () => {
    setupServer.use(new PipelineHandlers().getPipelineErrorHandler());
    new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    await screen.findByText(/Something went wrong/i);
  });

  test("should render blocks types", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    const blockGroups = await page.getBlockTypeGroups();

    expect(blockGroups).toHaveLength(9);
  });

  test("should render handles based on block configuration", async () => {
    new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    await screen.findByTestId("text_input_1-output-handle");
    await screen.findByTestId("chat_123321-input-handle");
    await screen.findByTestId("chat_123321-output-handle");
    await screen.findByTestId("chat_123321-message_output-handle");
    await screen.findByTestId("chat_123321-tool-handle");
    await screen.findByTestId("chat_123321-chat-handle");
    await screen.findByTestId("text_output_1-input-handle");
  });

  test("should add block after clicking on side menu item", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    const blockGroups = await page.getBlockTypeGroups();

    await page.hoverOverBlockGroup(blockGroups[0]);

    const blockTypes = await page.getBlockTypes();

    const addButton = blockTypes[0].querySelector("button");

    await userEvent.click(addButton!);

    const blocks = await page.getBlocks();

    expect(blocks).toHaveLength(5);
  });

  test("should remove block after clicking trash icon on node", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    const deleteButton = await ButtonHandle.fromLabelText(
      /Delete block: text_input_1/i,
    );

    await page.fireBlockOnClick(deleteButton.buttonElement);

    await page.confirmAction();

    const blocks = await page.getBlocks();

    expect(blocks).toHaveLength(3);
  });

  test("should edit block name", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    const editButton = await ButtonHandle.fromLabelText(
      /Edit block: text_output_1/i,
    );

    await page.fireBlockOnClick(editButton.buttonElement);

    await screen.findByText(/Text Output 1/i);

    const input = await InputHandle.fromRole();

    expect(input.value).toBe("text_output_1");

    await input.type("super_output");

    const submit = await ButtonHandle.fromRole("Save changes");

    await submit.click();

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

    expect(links).toHaveLength(2);

    await page.openAliasDropdown();

    await page.deleteAlias(/Delete alias: alias/i);

    const linksAfterDelete = await page.getAliasLinks();

    expect(linksAfterDelete).toHaveLength(1);
  });

  test("should edit alias name", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    await page.openAliasDropdown();

    await page.editAlias(/Edit alias: alias/i);

    const nameInput = await InputHandle.fromTestId("alias-name");
    expect(nameInput.value).toBe("alias");

    await nameInput.type(" v2");

    await page.saveAlias();

    await ButtonHandle.fromLabelText(/Edit alias: alias v2/i);
  });

  test("shouldn't allow edit alias name", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    await page.openAliasDropdown();

    await page.editAlias(/Edit alias: alias/i);

    const nameInput = await InputHandle.fromTestId("alias-name");
    expect(nameInput.value).toBe("alias");

    await nameInput.clear();
    await page.saveAlias();

    await screen.findByText(/String must contain at least/i);
  });

  test("change alias and load its configuration", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    const blocks = await page.getBlocks();

    expect(blocks).toHaveLength(4);

    await page.openAliasDropdown();

    await page.selectAlias(/Select alias: alias/i);

    const aliasBlocks = await waitFor(() =>
      screen.queryAllByTestId("builder-block"),
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
      screen.queryAllByTestId("builder-block"),
    );

    expect(aliasBlocks).toHaveLength(1);
  });

  test("should render form inputs based on chat block schema", async () => {
    new PipelineObject().render({
      initialEntries: [
        `/2/pipelines/${pipelineFixtureWithUnfilledBlock().id}/build/blocks/${
          pipelineFixtureWithUnfilledBlock().config.blocks[0].name
        }`,
      ],
    });

    await InputHandle.fromRole("opts.description");
    await InputHandle.fromRole("opts.endpoint");
    await InputHandle.fromLabelText("opts.api_key");
    await InputHandle.fromLabelText("google");
    await InputHandle.fromLabelText("opts.model");
    await InputHandle.fromLabelText("rolling");
    await InputHandle.fromLabelText("Temperature");
    await InputHandle.fromLabelText("opts.system_message");
    await InputHandle.fromLabelText("opts.prompt_template");
  });

  test("should fill required inputs and submit", async () => {
    const page = new PipelineObject().render({
      initialEntries: [
        `/2/pipelines/${pipelineFixtureWithUnfilledBlock().id}/build`,
      ],
    });

    await screen.findByText(/This block contains problems to fix./i);

    await page.editBlock("chat_123321");

    await page.fillSystemMessage("You are a helpful assistant");

    const select = await SelectHandle.fromTestId("opts.api_key");
    await select.selectOption("OPENAI");

    const submit = await ButtonHandle.fromRole("Save changes");

    await submit.click();

    expect(
      screen.queryByText(/This block contains problems to fix./i),
    ).toBeNull();
  });

  test("should allow to create new secret value and select it", async () => {
    new PipelineObject().render({
      initialEntries: [
        `/2/pipelines/${
          pipelineFixtureWithUnfilledBlock().id
        }/build/blocks/chat_123321`,
      ],
    });

    const select = await CreatableSelectHandle.fromTestId("opts.api_key");
    await select.openModal();
    const selectModal = await select.getModal();

    const name = await InputHandle.fromLabelTextAndContainer(
      /name/i,
      selectModal,
    );
    await name.type("SAMPLE_KEY");

    const modalSubmit = await ButtonHandle.fromLabelTextAndContainer(
      /create new/i,
      selectModal,
    );

    await modalSubmit.click();

    await findByText(selectModal, /String must contain at least 1 character/i);

    const value = await InputHandle.fromLabelTextAndContainer(
      /value/i,
      selectModal,
    );
    await value.type("SAMPLE_KEY_VALUE");

    await modalSubmit.click();

    await select.selectOption("SAMPLE_KEY");
  });

  test("should render recursive creatable select in DocumentSearchBlock", async () => {
    new PipelineObject().render({
      initialEntries: [`/2/pipelines/1/build/blocks/document_search_1`],
    });

    const knowledgeSelect =
      await CreatableSelectHandle.fromTestId("opts.knowledge");
    await knowledgeSelect.openModal();
    const submitKnowledgeBase = await ButtonHandle.fromLabelTextAndContainer(
      /Create new/i,
      await knowledgeSelect.getModal(),
    );

    // new knowledge base

    const newKnowledgeNameInput =
      await InputHandle.fromLabelText(/collection_name/i);
    await newKnowledgeNameInput.type("NEW_NEW");
    const newKnowledgeModelSelect =
      await SelectHandle.fromTestId("embeddings.model");
    await newKnowledgeModelSelect.selectOption("text-embedding-ada-002");

    // new knowledge base -> new secret

    const newKnowledgeSecretSelect = await CreatableSelectHandle.fromTestId(
      "embeddings.secret_name",
    );
    await newKnowledgeSecretSelect.openModal();
    const newSecretModal = await newKnowledgeSecretSelect.getModal();
    const newSecretNameInput = await InputHandle.fromLabelTextAndContainer(
      /name/i,
      newSecretModal,
    );
    await newSecretNameInput.type("WRRR");
    const newSecretValueInput = await InputHandle.fromLabelTextAndContainer(
      /value/i,
      newSecretModal,
    );
    await newSecretValueInput.type("WRRR");
    const newSecretSubmitButton = await ButtonHandle.fromLabelTextAndContainer(
      /Create new/i,
      newSecretModal,
    );
    await newSecretSubmitButton.click();
    expect(newKnowledgeSecretSelect.value).toBe("WRRR");

    // --------

    await waitFor(() => submitKnowledgeBase.click());

    expect(knowledgeSelect.value).toBe("NEW_NEW");
  });

  test("should reload memory files after changing knowledge base", async () => {
    const page = new PipelineObject().render({
      initialEntries: [`/2/pipelines/2/build`],
    });

    const list = await ListHandle.fromLabelText(
      /document_search_1 memory list/i,
    );
    expect(list.children).toHaveLength(0);

    const editButton = await ButtonHandle.fromLabelText(
      /Edit block: document_search_1/i,
    );
    await page.fireBlockOnClick(editButton.buttonElement);

    const knowledgeSelect = await SelectHandle.fromTestId("opts.knowledge");
    await knowledgeSelect.selectOption("super-collection");

    const submit = await ButtonHandle.fromRole("Save changes");
    await waitFor(async () => {
      await submit.click();
    });

    const listAfterUpdate = await ListHandle.fromLabelText(
      /document_search_1 memory list/i,
    );

    expect(listAfterUpdate.children).toHaveLength(2);
  });

  test.skip("should remove memory file after clicking on delete", async () => {
    setupServer.use(
      ...new PipelineHandlers([
        pipelineFixture({
          id: 2,
          name: "sample-workflow",
          config: {
            ...pipelineFixture().config,
            blocks: [
              {
                ...pipelineFixture().config.blocks[0],
                opts: { knowledge: 2 },
              },
            ],
          },
        }),
      ]).handlers,
    );
    new PipelineObject().render({
      initialEntries: [`/2/pipelines/2/build`],
    });

    const button = await ButtonHandle.fromLabelText(/Delete file: test_file/i);
    await button.click();

    const list = await waitFor(async () => {
      return await ListHandle.fromLabelText(/document_search_1 memory list/i);
    });
    expect(list.children).toHaveLength(1);
  });

  test("should clear model and endpoint after changing API type", async () => {
    new PipelineObject().render({
      initialEntries: [
        `/2/pipelines/${
          pipelineFixtureWithUnfilledBlock().id
        }/build/blocks/chat_123321`,
      ],
    });

    const endpoint = await InputHandle.fromRole("opts.endpoint");
    const select = await SelectHandle.fromTestId("opts.model");

    await select.selectOption("GPT-3.5 Turbo");

    expect(select.value).toBe("GPT-3.5 Turbo");
    expect(endpoint.value).toBe("https://api.openai.com/v1");

    const googleRadio = await RadioHandle.fromLabelText("google");

    await googleRadio.click();

    expect(select.value).toBe(null);
    expect(endpoint.value).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models",
    );
  });

  test("should create block after pasting configuration", async () => {
    const page = new PipelineObject().render({
      initialEntries: [`/2/pipelines/2/build`],
    });

    await page.openPastBlockConfig();
    await page.pasteBlockConfig(pipelineFixture().config.blocks[1]);
    await page.submitBlockConfig();

    await screen.findByText(/text_input_2/i);
  });

  test("should show validation errors if pasted configuration has missing type", async () => {
    const page = new PipelineObject().render({
      initialEntries: [`/2/pipelines/2/build`],
    });

    await page.openPastBlockConfig();
    await page.pasteBlockConfig({ opts: {} });
    await page.submitBlockConfig();

    await screen.findByText(/Missing block 'type'/i);
  });

  test("should show validation errors if pasted configuration has incorrect type", async () => {
    const page = new PipelineObject().render({
      initialEntries: [`/2/pipelines/2/build`],
    });

    await page.openPastBlockConfig();
    await page.pasteBlockConfig({ type: "test", opts: {} });
    await page.submitBlockConfig();

    await screen.findByText(/Incorrect block 'type'/i);
  });

  test("should show errors if pasted configuration is incorrect", async () => {
    const page = new PipelineObject().render({
      initialEntries: [`/2/pipelines/2/build`],
    });

    await page.openPastBlockConfig();
    await page.submitBlockConfig();

    await screen.findByText(/Invalid configuration/i);
  });
});

class PipelineObject {
  render(props?: RoutesProps) {
    const Routes = setupRoutes([
      {
        action: actionWithSession(layoutAction),
        loader: loaderWithSession(layoutLoader),
        path: "/:organizationId/pipelines/:pipelineId",
        Component: PipelineLayout,
        ErrorBoundary: BuildErrorBoundary,
        children: [
          {
            action: actionWithSession(buildAction),
            loader: loaderWithSession(buildLoader),
            path: "/:organizationId/pipelines/:pipelineId/build",
            Component: PipelineBuilder,
          },
        ],
      },

      {
        loader: loaderWithSession(editBlockLoader),
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
    await userEvent.hover(element);

    return this;
  }

  async getBlockTypes() {
    const submenu = await screen.findByTestId(/submenu-text/i);
    return submenu.querySelectorAll("#draggable-block-item");
  }

  async editBlock(blockName: string) {
    const editButton = await ButtonHandle.fromLabelText(
      `Edit block: ${blockName}`,
    );

    await this.fireBlockOnClick(editButton.buttonElement);

    return this;
  }

  //to avoid issue with d3.drag lib (document = null).
  async fireBlockOnClick(element: Element) {
    fireEvent(
      element,
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      }),
    );

    return this;
  }

  async openAliasDropdown() {
    const aliasDropdown = await ButtonHandle.fromLabelText(/Select aliases/i);

    await aliasDropdown.click();

    return this;
  }

  async restore() {
    const restore = await ButtonHandle.fromRole("Restore");

    await restore.click();

    return this;
  }

  async createAlias() {
    const create = await ButtonHandle.fromTestId("create-alias");

    await create.click();

    return this;
  }

  async selectAlias(name: Matcher) {
    const aliasLink = await ButtonHandle.fromLabelText(name);

    await aliasLink.click();

    return this;
  }

  async getAliasLinks() {
    return screen.findAllByTestId("alias-link");
  }

  async deleteAlias(label: Matcher) {
    const deleteButton = await ButtonHandle.fromLabelText(label);

    await deleteButton.click();

    return this;
  }

  async editAlias(label: Matcher) {
    const editButton = await ButtonHandle.fromLabelText(label);

    await editButton.click();

    return this;
  }

  async saveAlias() {
    const button = await ButtonHandle.fromRole("Save");
    await button.click();

    return this;
  }

  async confirmAction() {
    const confirmButton = await ButtonHandle.fromRole("Confirm");

    await confirmButton.click();

    return this;
  }

  async fillSystemMessage(message: string) {
    const system_message = await TextareaHandle.fromTestId(
      "opts.system_message-editor",
    );

    await system_message.type(message);

    return this;
  }

  async openPastBlockConfig() {
    const button = await ButtonHandle.fromRole("Paste configuration");
    await button.click();
    return this;
  }

  async pasteBlockConfig(config: Record<string, any>) {
    const configuration = await TextareaHandle.fromTestId(
      "configuration-editor",
    );
    await configuration.paste(JSON.stringify(config));

    return this;
  }

  async submitBlockConfig() {
    const submit = await ButtonHandle.fromRole("Add block");
    await submit.click();

    return this;
  }
}
