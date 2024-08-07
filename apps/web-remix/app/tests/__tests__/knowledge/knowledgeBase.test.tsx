import React from 'react';
import { describe, expect, test } from 'vitest';

import { RootErrorBoundary } from '~/components/errorBoundaries/RootErrorBoundary';
import { action as collectionAction } from '~/components/pages/knowledgeBase/collectionContent/action.server';
import { loader as collectionLoader } from '~/components/pages/knowledgeBase/collectionContent/loader.server';
import { KnowledgeBaseContentPage } from '~/components/pages/knowledgeBase/collectionContent/page';
import { loader as collectionLayoutLoader } from '~/components/pages/knowledgeBase/collectionLayout/loader.server';
import { KnowledgeBaseCollectionLayout } from '~/components/pages/knowledgeBase/collectionLayout/page';
import { action as collectionSettingsAction } from '~/components/pages/knowledgeBase/collectionSettings/action.server';
import { loader as collectionSettingsLoader } from '~/components/pages/knowledgeBase/collectionSettings/loader.server';
import { CollectionSettingsPage } from '~/components/pages/knowledgeBase/collectionSettings/page';
import { action as listAction } from '~/components/pages/knowledgeBase/list/action.server';
import { loader as listLoader } from '~/components/pages/knowledgeBase/list/loader.server';
import { KnowledgeBasePage } from '~/components/pages/knowledgeBase/list/page';
import { loader as newCollectionFilesLoader } from '~/components/pages/knowledgeBase/newCollectionFiles/loader.server';
import { NewCollectionFilesPage } from '~/components/pages/knowledgeBase/newCollectionFiles/page';
import { action as newCollectionAction } from '~/components/pages/knowledgeBase/newKnowledgeBase/action.server';
import { loader as newCollectionLoader } from '~/components/pages/knowledgeBase/newKnowledgeBase/loader.server';
import { NewKnowledgeBasePage } from '~/components/pages/knowledgeBase/newKnowledgeBase/page';
import {
  CollectionHandlers,
  CollectionMemoriesHandlers,
} from '~/tests/handlers/collection.handlers';
import { ButtonHandle } from '~/tests/handles/Button.handle';
import { FileInputHandle } from '~/tests/handles/FileInput.handle';
import { InputHandle } from '~/tests/handles/Input.handle';
import { ListHandle } from '~/tests/handles/List.handle';
import { SelectHandle } from '~/tests/handles/SelectHandle';
import { render, screen, waitFor } from '~/tests/render';
import { server } from '~/tests/server.mock';
import type { RoutesProps } from '~/tests/setup.tests';
import {
  actionWithSession,
  loaderWithSession,
  setupRoutes,
} from '~/tests/setup.tests';

import { knowledgeBaseHandlers } from './knowledgeBase.handlers';

describe.skip('KnowledgeBase', () => {
  const setupServer = server([...knowledgeBaseHandlers()]);

  beforeAll(() => setupServer.listen());
  afterEach(() => setupServer.resetHandlers(...knowledgeBaseHandlers()));
  afterAll(() => setupServer.close());

  test('should render correct amount of collections', async () => {
    const page = new KnowledgeBaseObject().render({
      initialEntries: ['/2/knowledge-base'],
    });

    const collectionList = await page.getCollectionList();

    // 3 not 2 because of hidden element
    expect(collectionList.children).toHaveLength(3);
  });

  test('should display empty message if no collections', async () => {
    setupServer.use(...new CollectionHandlers().handlers);
    new KnowledgeBaseObject().render({
      initialEntries: ['/2/knowledge-base'],
    });

    await screen.findByText(/There is no Collections yet/i);
  });

  test('should remove collection', async () => {
    const page = new KnowledgeBaseObject().render({
      initialEntries: ['/2/knowledge-base'],
    });

    const button = await ButtonHandle.fromLabelText(
      /Remove collection: super-collection/i,
    );

    await button.click();

    await page.confirmCollectionDelete();

    const collectionList = await page.getCollectionList();

    expect(collectionList.children).toHaveLength(2);
  });

  test('should edit collection', async () => {
    const page = new KnowledgeBaseObject().render({
      initialEntries: ['/2/knowledge-base/super-collection/settings'],
    });

    const secret = await SelectHandle.fromTestId('secret');
    expect(secret.value).toBe('openai');

    await secret.selectOption('Test');

    await page.updateCollection();

    expect(secret.value).toBe('Test');
  });

  test('should create collection', async () => {
    const page = new KnowledgeBaseObject().render({
      initialEntries: ['/2/knowledge-base'],
    });

    await page.openNewForm();

    const name = await InputHandle.fromLabelText('collection_name');

    await name.type('TEST COLLECTION');

    const model = await SelectHandle.fromTestId('model');
    await model.selectOption('embedding');

    const secret = await SelectHandle.fromTestId('secret');
    await secret.selectOption('OPENAI');

    await page.submitCollection();

    screen.getByRole('heading', { name: /test collection database/i });
  });

  test('should show validation error', async () => {
    const page = new KnowledgeBaseObject().render({
      initialEntries: ['/2/knowledge-base/new'],
    });

    await page.openNewForm();

    await page.submitCollection();

    expect(
      await screen.findAllByText(/String must contain at least/i),
    ).toHaveLength(3);
  });

  test('should render correct amount of collection files', async () => {
    new KnowledgeBaseObject().render({
      initialEntries: ['/2/knowledge-base/super-collection/content'],
    });

    const list = await ListHandle.fromLabelText(/Collection files/i);

    expect(list.children).toHaveLength(3);
  });

  test('should display file chunks', async () => {
    new KnowledgeBaseObject().render({
      initialEntries: ['/2/knowledge-base/super-collection/content'],
    });

    const list = await ListHandle.fromLabelText(/Collection files/i);

    expect(list.children).toHaveLength(3);
  });

  test('should delete collection file', async () => {
    const page = new KnowledgeBaseObject().render({
      initialEntries: ['/2/knowledge-base/super-collection/content'],
    });

    const button = await ButtonHandle.fromLabelText(/Delete file: test_file/i);
    await button.click();
    await page.confirmFileDelete();

    const list = await ListHandle.fromLabelText(/Collection files/i);
    expect(list.children).toHaveLength(2);
  });

  describe('File uploading', () => {
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });

    test('should disable button if files empty', async () => {
      new KnowledgeBaseObject().render({
        initialEntries: ['/2/knowledge-base/super-collection/content/new'],
      });

      const submit = await ButtonHandle.fromLabelText(
        /Upload knowledge items/i,
      );

      expect(submit.isDisabled()).toBe(true);
    });

    test.skip('should upload collection file', async () => {
      new KnowledgeBaseObject().render({
        initialEntries: ['/2/knowledge-base/super-collection/content/new'],
      });

      const fileInput = await FileInputHandle.fromLabelText(/files/i);
      await fileInput.upload(file);

      await screen.findByText(/hello/i);

      const submit = await ButtonHandle.fromLabelText(
        /Upload knowledge items/i,
      );
      await submit.click();

      expect(screen.queryByText(/hello/i)).toBeNull();
    });

    test('should show uploading error', async () => {
      setupServer.use(
        new CollectionMemoriesHandlers().createCollectionMemoryFailed(),
      );

      new KnowledgeBaseObject().render({
        initialEntries: ['/2/knowledge-base/super-collection/content/new'],
      });

      const fileInput = await FileInputHandle.fromLabelText(/files/i);
      await fileInput.upload(file);

      const submit = await ButtonHandle.fromLabelText(
        /Upload knowledge items/i,
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
        path: '/',
        Component: () => <p>Dashboard</p>,
        ErrorBoundary: RootErrorBoundary,
      },
      {
        path: '/:organizationId/knowledge-base',
        Component: KnowledgeBasePage,
        action: actionWithSession(listAction),
        loader: loaderWithSession(listLoader),
        children: [
          {
            path: '/:organizationId/knowledge-base/new',
            Component: NewKnowledgeBasePage,
            action: actionWithSession(newCollectionAction),
            loader: loaderWithSession(newCollectionLoader),
          },
          {
            path: '/:organizationId/knowledge-base/:collectionName',
            Component: KnowledgeBaseCollectionLayout,
            loader: loaderWithSession(collectionLayoutLoader),
            children: [
              {
                path: '/:organizationId/knowledge-base/:collectionName/content',
                Component: KnowledgeBaseContentPage,
                action: actionWithSession(collectionAction),
                loader: loaderWithSession(collectionLoader),
              },
              {
                path: '/:organizationId/knowledge-base/:collectionName/settings',
                Component: CollectionSettingsPage,
                action: actionWithSession(collectionSettingsAction),
                loader: loaderWithSession(collectionSettingsLoader),
              },
              {
                path: '/:organizationId/knowledge-base/:collectionName/content/new',
                loader: loaderWithSession(newCollectionFilesLoader),
                Component: NewCollectionFilesPage,
              },
            ],
          },
        ],
      },
    ]);

    render(<Routes {...props} />);

    return this;
  }

  async confirmCollectionDelete() {
    const confirmButton = await waitFor(() =>
      ButtonHandle.fromRole('Delete collection'),
    );

    await confirmButton.click();

    return this;
  }

  async confirmFileDelete() {
    const confirmButton = await waitFor(() =>
      ButtonHandle.fromRole('Delete item'),
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
      ButtonHandle.fromRole('Create collection'),
    );

    await submit.click();

    return this;
  }

  async updateCollection() {
    const submit = await waitFor(() =>
      ButtonHandle.fromRole('Update collection'),
    );

    await submit.click();

    return this;
  }
}
