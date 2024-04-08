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
import { KnowledgeBasePage } from "~/components/pages/knowledgeBase/list/page";
import { NewKnowledgeBasePage } from "~/components/pages/knowledgeBase/newKnowledgeBase/page";
import { loader as newCollectionLoader } from "~/components/pages/knowledgeBase/newKnowledgeBase/loader.server";
import { action as newCollectionAction } from "~/components/pages/knowledgeBase/newKnowledgeBase/action.server";
import { EditKnowledgeBasePage } from "~/components/pages/knowledgeBase/editKnowledgeBase/page";
import { loader as editCollectionLoader } from "~/components/pages/knowledgeBase/editKnowledgeBase/loader.server";
import { action as editCollectionAction } from "~/components/pages/knowledgeBase/editKnowledgeBase/action.server";
import { KnowledgeBaseCollectionPage } from "~/components/pages/knowledgeBase/collection/page";
import { loader as collectionLoader } from "~/components/pages/knowledgeBase/collection/loader.server";
import { action as collectionAction } from "~/components/pages/knowledgeBase/collection/action.server";
import { NewCollectionFilesPage } from "~/components/pages/knowledgeBase/newCollectionFiles/page";
import { loader as newCollectionFilesLoader } from "~/components/pages/knowledgeBase/newCollectionFiles/loader.server";
import { SelectHandle } from "~/tests/handles/SelectHandle";
import { knowledgeBaseHandlers } from "./knowledgeBase.handlers";
import {
  CollectionHandlers,
  CollectionMemoriesHandlers,
} from "~/tests/handlers/collection.handlers";
import { RootErrorBoundary } from "~/components/errorBoundaries/RootErrorBoundary";
import { FileInputHandle } from "~/tests/handles/FileInput.handle";

describe("KnowledgeBase", () => {
  const setupServer = server([...knowledgeBaseHandlers()]);

  beforeAll(() => setupServer.listen());
  afterEach(() => setupServer.resetHandlers(...knowledgeBaseHandlers()));
  afterAll(() => setupServer.close());

  test("should render correct amount of collections", async () => {
    const page = new KnowledgeBaseObject().render({
      initialEntries: ["/2/knowledge-base"],
    });

    const collectionList = await page.getCollectionList();

    // 3 not 2 because of hidden element
    expect(collectionList.children).toHaveLength(3);
  });

  test("should display empty message if no collections", async () => {
    setupServer.use(...new CollectionHandlers().handlers);
    new KnowledgeBaseObject().render({
      initialEntries: ["/2/knowledge-base"],
    });

    await screen.findByText(/There is no Collections yet/i);
  });

  test("should remove collection", async () => {
    const page = new KnowledgeBaseObject().render({
      initialEntries: ["/2/knowledge-base"],
    });

    const button = await ButtonHandle.fromLabelText(
      /Remove collection: super-collection/i
    );

    await button.click();

    await page.confirmCollectionDelete();

    const collectionList = await page.getCollectionList();

    expect(collectionList.children).toHaveLength(2);
  });

  test("should edit collection", async () => {
    const page = new KnowledgeBaseObject().render({
      initialEntries: ["/2/knowledge-base"],
    });

    const button = await ButtonHandle.fromLabelText(/Edit collection: test/i);
    await button.click();

    const secret = await SelectHandle.fromTestId("secret");
    expect(secret.value).toBe("openai");

    await secret.selectOption("Test");

    await page.updateCollection();

    await button.click();
    expect(secret.value).toBe("Test");
  });

  test("should create collection", async () => {
    const page = new KnowledgeBaseObject().render({
      initialEntries: ["/2/knowledge-base"],
    });

    await page.openNewForm();

    const name = await InputHandle.fromLabelText("collection_name");

    await name.type("TEST COLLECTION");

    const model = await SelectHandle.fromTestId("model");
    await model.selectOption("embedding");

    const secret = await SelectHandle.fromTestId("secret");
    await secret.selectOption("OPENAI");

    await page.submitCollection();

    screen.getByRole("heading", { name: /test collection database/i });
  });

  test("should show validation error", async () => {
    const page = new KnowledgeBaseObject().render({
      initialEntries: ["/2/knowledge-base/new"],
    });

    await page.openNewForm();

    await page.submitCollection();

    expect(
      await screen.findAllByText(/String must contain at least/i)
    ).toHaveLength(3);
  });

  test("should render correct amount of collection files", async () => {
    new KnowledgeBaseObject().render({
      initialEntries: ["/2/knowledge-base/super-collection"],
    });

    const list = await ListHandle.fromLabelText(/Collection files/i);

    expect(list.children).toHaveLength(3);
  });

  test("should display empty message if no collections", async () => {
    setupServer.use(...new CollectionMemoriesHandlers().handlers);
    new KnowledgeBaseObject().render({
      initialEntries: ["/2/knowledge-base/super-collection"],
    });

    await screen.findByText(/There is no files in collection yet/i);
  });

  test("should display file chunks", async () => {
    new KnowledgeBaseObject().render({
      initialEntries: ["/2/knowledge-base/super-collection"],
    });

    const list = await ListHandle.fromLabelText(/Collection files/i);

    expect(list.children).toHaveLength(3);
  });

  test("should delete collection file", async () => {
    const page = new KnowledgeBaseObject().render({
      initialEntries: ["/2/knowledge-base/super-collection"],
    });

    const button = await ButtonHandle.fromLabelText(/Delete file: test_file/i);
    await button.click();
    await page.confirmFileDelete();

    const list = await ListHandle.fromLabelText(/Collection files/i);
    expect(list.children).toHaveLength(2);
  });

  describe("File uploading", () => {
    const file = new File(["hello"], "hello.png", { type: "image/png" });

    test("should disable button if files empty", async () => {
      new KnowledgeBaseObject().render({
        initialEntries: ["/2/knowledge-base/super-collection/new"],
      });

      const submit = await ButtonHandle.fromLabelText(
        /Upload knowledge items/i
      );

      expect(submit.isDisabled()).toBe(true);
    });

    test("should upload collection file", async () => {
      new KnowledgeBaseObject().render({
        initialEntries: ["/2/knowledge-base/super-collection/new"],
      });

      const fileInput = await FileInputHandle.fromLabelText(/files/i);
      await fileInput.upload(file);

      await screen.findByText(/hello/i);

      const submit = await ButtonHandle.fromLabelText(
        /Upload knowledge items/i
      );
      await submit.click();

      expect(screen.queryByText(/hello/i)).toBeNull();
    });

    test("should show uploading error", async () => {
      setupServer.use(
        new CollectionMemoriesHandlers().createCollectionMemoryFailed()
      );

      new KnowledgeBaseObject().render({
        initialEntries: ["/2/knowledge-base/super-collection/new"],
      });

      const fileInput = await FileInputHandle.fromLabelText(/files/i);
      await fileInput.upload(file);

      const submit = await ButtonHandle.fromLabelText(
        /Upload knowledge items/i
      );
      await submit.click();

      await screen.findByText(/Invalid API key provided for embeddings model/i);
    });
  });
});

class KnowledgeBaseObject {
  render(props?: RoutesProps) {
    const Routes = setupRoutes([
      {
        path: "/",
        Component: () => <p>Dashboard</p>,
        ErrorBoundary: RootErrorBoundary,
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
          {
            path: "/:organizationId/knowledge-base/:collectionName/edit",
            Component: EditKnowledgeBasePage,
            action: actionWithSession(editCollectionAction),
            loader: loaderWithSession(editCollectionLoader),
          },
          {
            path: "/:organizationId/knowledge-base/:collectionName/new",
            loader: loaderWithSession(newCollectionFilesLoader),
            Component: NewCollectionFilesPage,
          },
        ],
      },
    ]);

    render(<Routes {...props} />);

    return this;
  }

  async confirmCollectionDelete() {
    const confirmButton = await waitFor(() =>
      ButtonHandle.fromRole("Delete collection")
    );

    await confirmButton.click();

    return this;
  }

  async confirmFileDelete() {
    const confirmButton = await waitFor(() =>
      ButtonHandle.fromRole("Delete item")
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

  async updateCollection() {
    const submit = await waitFor(() =>
      ButtonHandle.fromRole("Update collection")
    );

    await submit.click();

    return this;
  }
}
