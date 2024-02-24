import React from "react";
import { test, describe, expect } from "vitest";
import {
  actionWithSession,
  loaderWithSession,
  RoutesProps,
  setupRoutes,
} from "~/tests/setup.tests";
import { render, screen, waitFor } from "~/tests/render";
import { server } from "~/tests/server.mock";
import { loader as listLoader } from "~/components/pages/knowledgeBase/list/loader.server";
import { action as listAction } from "~/components/pages/knowledgeBase/list/action.server";
import { ListHandle } from "~/tests/handles/List.handle";
import { InputHandle } from "~/tests/handles/Input.handle";
import { ButtonHandle } from "~/tests/handles/Button.handle";
import { SecretsHandlers } from "~/tests/handlers/secret.handlers";
import { KnowledgeBasePage } from "~/components/pages/knowledgeBase/list/page";
import {
  CollectionHandlers,
  CollectionMemoriesHandlers,
} from "~/tests/handlers/collection.handlers";
import { NewKnowledgeBasePage } from "~/components/pages/knowledgeBase/newKnowledgeBase/page";
import { loader as newCollectionLoader } from "~/components/pages/knowledgeBase/newKnowledgeBase/loader.server";
import { action as newCollectionAction } from "~/components/pages/knowledgeBase/newKnowledgeBase/action.server";
import { KnowledgeBaseCollectionPage } from "~/components/pages/knowledgeBase/collection/page";
import { loader as collectionLoader } from "~/components/pages/knowledgeBase/collection/loader.server";
import { action as collectionAction } from "~/components/pages/knowledgeBase/collection/action.server";
import {
  EmbeddingsHandlers,
  ModelsHandlers,
} from "~/tests/handlers/model.handlers";
import { SelectHandle } from "~/tests/handles/SelectHandle";
import { collectionFixture } from "~/tests/fixtures/collection.fixtures";
import { collectionMemoryFixtures } from "~/tests/fixtures/collectionMemory.fixtures";
import { embeddingFixture } from "~/tests/fixtures/embedding.fixtures";
import { modelFixture } from "~/tests/fixtures/models.fixtures";
import { secretFixture } from "~/tests/fixtures/secrets.fixtures";

const handlers = () => [
  ...new SecretsHandlers([
    secretFixture(),
    secretFixture({ name: "Test", id: "Test" }),
  ]).handlers,
  ...new ModelsHandlers([
    modelFixture(),
    modelFixture({ name: "Test", id: "Test", type: "google" }),
  ]).handlers,
  ...new EmbeddingsHandlers([
    embeddingFixture(),
    embeddingFixture({ name: "embedding", id: "embedding" }),
  ]).handlers,
  ...new CollectionMemoriesHandlers([
    collectionMemoryFixtures(),
    collectionMemoryFixtures({ id: 2, file_name: "test_file" }),
  ]).handlers,
  ...new CollectionHandlers([
    collectionFixture(),
    collectionFixture({ id: 2, name: "super-collection" }),
  ]).handlers,
];

describe("KnowledgeBase", () => {
  const setupServer = server([...handlers()]);

  beforeAll(() => setupServer.listen());
  afterEach(() => setupServer.resetHandlers(...handlers()));
  afterAll(() => setupServer.close());

  test("should render correct amount of collections", async () => {
    const page = new KnowledgeBaseObject().render({
      initialEntries: ["/2/knowledge-base"],
    });

    const collectionList = await page.getCollectionList();

    // 3 not 2 because of hidden element
    expect(collectionList.children).toHaveLength(3);
  });

  test("should remove collection", async () => {
    const page = new KnowledgeBaseObject().render({
      initialEntries: ["/2/knowledge-base"],
    });

    const button = await ButtonHandle.fromLabelText(
      /Remove collection: super-collection/i
    );

    await button.click();

    await page.confirmDelete();

    const collectionList = await page.getCollectionList();

    expect(collectionList.children).toHaveLength(2);
  });

  test("should create collection", async () => {
    const page = new KnowledgeBaseObject().render({
      initialEntries: ["/2/knowledge-base"],
    });

    await page.openNewForm();

    await page.submitCollection();

    expect(
      await screen.findAllByText(/String must contain at least/i)
    ).toHaveLength(3);

    const name = await InputHandle.fromLabelText("collection_name");

    await name.type("TEST COLLECTION");

    const model = await SelectHandle.fromTestId("model");
    await model.selectOption("embedding");

    const secret = await SelectHandle.fromTestId("secret");
    await secret.selectOption("OPENAI");

    await page.submitCollection();

    screen.getByRole("heading", { name: /test collection database/i });
  });
});

class KnowledgeBaseObject {
  render(props?: RoutesProps) {
    const Routes = setupRoutes([
      {
        path: "/",
        Component: () => <p>Dashboard</p>,
      },
      {
        path: "/:organizationId/knowledge-base",
        Component: KnowledgeBasePage,
        action: actionWithSession(listAction),
        loader: loaderWithSession(listLoader),
        children: [
          {
            path: "/:organizationId/knowledge-base/new",
            Component: NewKnowledgeBasePage,
            action: actionWithSession(newCollectionAction),
            loader: loaderWithSession(newCollectionLoader),
          },
          {
            path: "/:organizationId/knowledge-base/:collectionName",
            Component: KnowledgeBaseCollectionPage,
            action: actionWithSession(collectionAction),
            loader: loaderWithSession(collectionLoader),
          },
        ],
      },
    ]);

    render(<Routes {...props} />);

    return this;
  }

  async confirmDelete() {
    const confirmButton = await waitFor(() =>
      ButtonHandle.fromRole("Delete collection")
    );

    await confirmButton.click();

    return this;
  }

  async getCollectionList() {
    return ListHandle.fromLabelText(/Memory collections list/i);
  }

  async openNewForm() {
    const link = await ButtonHandle.fromLabelText(/Go to new collection page/i);

    await link.click();

    return this;
  }

  async submitCollection() {
    const submit = await waitFor(() =>
      ButtonHandle.fromRole("Create collection")
    );

    await submit.click();

    return this;
  }
}
