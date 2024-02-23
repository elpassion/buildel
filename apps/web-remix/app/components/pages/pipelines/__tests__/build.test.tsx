import React from "react";
import { test, describe, expect } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
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
import { loader as editBlockLoader } from "../build/editBlock/loader.server";
import { handlers as blockTypesHandlers } from "~/tests/handlers/blockTypes.handlers";
import { action as buildAction } from "../build/action.server";
import { loader as buildLoader } from "../build/loader.server";
import { EditBlockPage } from "../build/editBlock/page";
import { PipelineBuilder } from "../build/page";
import { PipelineLayout } from "../pipelineLayout/page";
import {
  loader as layoutLoader,
  action as layoutAction,
} from "../pipelineLayout/index.server";
import {
  PipelineHandlers,
  pipelineFixtureWithUnfilledBlock,
  AliasHandlers,
} from "~/tests/handlers/pipelines.handlers";
import { TextareaHandle } from "~/tests/handles/Textarea.handle";
import {
  CreatableSelectHandle,
  SelectHandle,
} from "~/tests/handles/SelectHandle";
import { SecretsHandlers } from "~/tests/handlers/secret.handlers";
import {
  EmbeddingsHandlers,
  ModelsHandlers,
} from "~/tests/handlers/model.handlers";
import { RadioHandle } from "~/tests/handles/Radio.handle";
import { CollectionHandlers } from "~/tests/handlers/collection.handlers";
import { pipelineFixture } from "~/tests/fixtures/pipeline.fixtures";
import { aliasFixture } from "~/tests/fixtures/alias.fixtures";

const handlers = () => [
  ...blockTypesHandlers(),
  ...new SecretsHandlers().handlers,
  ...new ModelsHandlers().handlers,
  ...new CollectionHandlers().handlers,
  ...new EmbeddingsHandlers().handlers,
  ...new PipelineHandlers([
    pipelineFixture(),
    pipelineFixture({ id: 2, name: "sample-workflow" }),
    pipelineFixtureWithUnfilledBlock(),
  ]).handlers,
  ...new AliasHandlers([
    aliasFixture(),
    aliasFixture({
      id: 2,
      name: "alias",
      config: {
        ...aliasFixture().config,
        blocks: [aliasFixture().config.blocks[0]],
        connections: [],
      },
    }),
  ]).handlers,
];

describe(PipelineBuilder.name, () => {
  const setupServer = server([...handlers()]);

  beforeAll(() => setupServer.listen());
  afterEach(() => setupServer.resetHandlers(...handlers()));
  afterAll(() => setupServer.close());

  test("should render correct amount of build nodes based on pipeline config", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    const blocks = await page.getBlocks();

    expect(blocks).toHaveLength(4);
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

    await act(async () => {
      await userEvent.click(addButton!);
    });

    const blocks = await page.getBlocks();

    expect(blocks).toHaveLength(5);
  });

  test("should remove block after clicking trash icon on node", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    const deleteButton = await ButtonHandle.fromLabelText(
      /Delete block: text_input_1/i
    );

    act(() => {
      page.fireBlockOnClick(deleteButton.buttonElement);
    });

    await page.confirmAction();

    const blocks = await page.getBlocks();

    expect(blocks).toHaveLength(3);
  });

  test("should edit block name", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    const editButton = await ButtonHandle.fromLabelText(
      /Edit block: text_output_1/i
    );

    act(() => {
      page.fireBlockOnClick(editButton.buttonElement);
    });

    await screen.findByText(/Text Output 1/i);

    const input = await InputHandle.fromRole();

    expect(input.value).toBe("text_output_1");

    await input.type("super_output");

    const submit = await ButtonHandle.fromRole("Save changes");

    await act(async () => {
      await submit.click();
    });

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

  test("change alias and load its configuration", async () => {
    const page = new PipelineObject().render({
      initialEntries: ["/2/pipelines/2/build"],
    });

    const blocks = await page.getBlocks();

    expect(blocks).toHaveLength(4);

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

    await act(async () => {
      await submit.click();
    });

    expect(
      screen.queryByText(/This block contains problems to fix./i)
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
      selectModal
    );
    await name.type("SAMPLE_KEY");

    const modalSubmit = await ButtonHandle.fromLabelTextAndContainer(
      /create new/i,
      selectModal
    );

    await modalSubmit.click();

    await findByText(selectModal, /String must contain at least 1 character/i);

    const value = await InputHandle.fromLabelTextAndContainer(
      /value/i,
      selectModal
    );
    await value.type("SAMPLE_KEY_VALUE");

    await modalSubmit.click();

    await select.selectOption("SAMPLE_KEY");
  });

  test("should render recursive creatable select in DocumentSearchBlock", async () => {
    new PipelineObject().render({
      initialEntries: [`/2/pipelines/1/build/blocks/document_search_1`],
    });

    const knowledgeSelect = await CreatableSelectHandle.fromTestId(
      "opts.knowledge"
    );
    await knowledgeSelect.openModal();
    const submitKnowledgeBase = await ButtonHandle.fromLabelTextAndContainer(
      /Create new/i,
      await knowledgeSelect.getModal()
    );

    // new knowledge base

    const newKnowledgeNameInput = await InputHandle.fromLabelText(
      /collection_name/i
    );
    await newKnowledgeNameInput.type("NEW_NEW");
    const newKnowledgeModelSelect = await SelectHandle.fromTestId(
      "embeddings.model"
    );
    await newKnowledgeModelSelect.selectOption("text-embedding-ada-002");

    // new knowledge base -> new secret

    const newKnowledgeSecretSelect = await CreatableSelectHandle.fromTestId(
      "embeddings.secret_name"
    );
    await newKnowledgeSecretSelect.openModal();
    const newSecretModal = await newKnowledgeSecretSelect.getModal();
    const newSecretNameInput = await InputHandle.fromLabelTextAndContainer(
      /name/i,
      newSecretModal
    );
    await newSecretNameInput.type("WRRR");
    const newSecretValueInput = await InputHandle.fromLabelTextAndContainer(
      /value/i,
      newSecretModal
    );
    await newSecretValueInput.type("WRRR");
    const newSecretSubmitButton = await ButtonHandle.fromLabelTextAndContainer(
      /Create new/i,
      newSecretModal
    );
    await newSecretSubmitButton.click();
    expect(newKnowledgeSecretSelect.value).toBe("WRRR");

    // --------

    await submitKnowledgeBase.click();

    expect(knowledgeSelect.value).toBe("NEW_NEW");
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
    expect(endpoint.value).toBe("https://api.openai.com/v1/chat/completions");

    const googleRadio = await RadioHandle.fromLabelText("google");

    await googleRadio.click();

    expect(select.value).toBe(null);
    expect(endpoint.value).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models"
    );
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
    await act(() => userEvent.hover(element));

    return this;
  }

  async getBlockTypes() {
    const submenu = await screen.findByTestId(/submenu-text/i);
    return submenu.querySelectorAll("#draggable-block-item");
  }

  async editBlock(blockName: string) {
    const editButton = await ButtonHandle.fromLabelText(
      `Edit block: ${blockName}`
    );

    act(() => {
      this.fireBlockOnClick(editButton.buttonElement);
    });

    return this;
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

  async fillSystemMessage(message: string) {
    const system_message = await TextareaHandle.fromTestId(
      "opts.system_message-editor"
    );

    await system_message.type(message);

    return this;
  }
}
