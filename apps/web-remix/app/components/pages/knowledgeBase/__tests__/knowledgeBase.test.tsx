import React from "react";
import { test, describe, expect } from "vitest";
import {
  actionWithSession,
  loaderWithSession,
  RoutesProps,
  setupRoutes,
} from "~/tests/setup.tests";
import { render, screen, waitFor, act } from "~/tests/render";
import { server } from "~/tests/server.mock";
import { loader as listLoader } from "../list/loader.server";
import { action as listAction } from "../list/action.server";
import { ListHandle } from "~/tests/handles/List.handle";
import { InputHandle } from "~/tests/handles/Input.handle";
import { ButtonHandle } from "~/tests/handles/Button.handle";
import { SecretsHandlers } from "~/tests/handlers/secret.handlers";
import { KnowledgeBasePage } from "~/components/pages/knowledgeBase/list/page";
import {
  CollectionHandlers,
  CollectionMemoriesHandlers,
} from "~/components/pages/knowledgeBase/__tests__/collection.handlers";
import { NewKnowledgeBasePage } from "../newKnowledgeBase/page";
import { loader as newCollectionLoader } from "../newKnowledgeBase/loader.server";
import { action as newCollectionAction } from "../newKnowledgeBase/action.server";
import { KnowledgeBaseCollectionPage } from "../collection/page";
import { loader as collectionLoader } from "../collection/loader.server";
import { action as collectionAction } from "../collection/action.server";
import {
  EmbeddingsHandlers,
  ModelsHandlers,
} from "~/tests/handlers/model.handlers";
import { SelectHandle } from "~/tests/handles/SelectHandle";

const handlers = () => [
  ...new CollectionHandlers().handlers,
  ...new SecretsHandlers().handlers,
  ...new EmbeddingsHandlers().handlers,
  ...new ModelsHandlers().handlers,
  ...new CollectionMemoriesHandlers().handlers,
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

    await act(async () => {
      await button.click();
    });

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

    await screen.getByRole("heading", { name: /test collection database/i });
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

    await act(async () => {
      await confirmButton.click();
    });

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
