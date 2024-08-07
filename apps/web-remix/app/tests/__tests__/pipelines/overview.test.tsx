import React from 'react';
import { describe, expect, test } from 'vitest';

import { RootErrorBoundary } from '~/components/errorBoundaries/RootErrorBoundary';
import { action as buildAction } from '~/components/pages/pipelines/build/action.server';
import { action as overviewAction } from '~/components/pages/pipelines/overview/action.server';
import { loader as overviewLoader } from '~/components/pages/pipelines/overview/loader.server';
import { OverviewPage } from '~/components/pages/pipelines/overview/page';
import { loader as runCostsLoader } from '~/components/pages/pipelines/runCosts/loader.server';
import { PipelineRunCosts } from '~/components/pages/pipelines/runCosts/page';
import { loader as runLayoutLoader } from '~/components/pages/pipelines/runLayout/loader.server';
import { PipelineRunLayout } from '~/components/pages/pipelines/runLayout/page';
import { loader as runOverviewLoader } from '~/components/pages/pipelines/runOverview/loader.server';
import { PipelineRunOverview } from '~/components/pages/pipelines/runOverview/page';
import { pipelineFixture } from '~/tests/fixtures/pipeline.fixtures';
import { runFixture } from '~/tests/fixtures/run.fixtures';
import { handlers as blockTypesHandlers } from '~/tests/handlers/blockTypes.handlers';
import { PipelineHandlers } from '~/tests/handlers/pipelines.handlers';
import { RunHandlers } from '~/tests/handlers/run.handlers';
import { ButtonHandle } from '~/tests/handles/Button.handle';
import { ListHandle } from '~/tests/handles/List.handle';
import { render, screen } from '~/tests/render';
import { server } from '~/tests/server.mock';
import {
  actionWithSession,
  loaderWithSession,
  setupRoutes,
} from '~/tests/setup.tests';
import type { RoutesProps } from '~/tests/setup.tests';
import { WebSocketServerMock } from '~/tests/WebSocketServerMock';

const handlers = () => [
  ...blockTypesHandlers(),
  ...new RunHandlers([
    runFixture(),
    runFixture({ id: 2 }),
    runFixture({ id: 3, status: 'running' }),
  ]).handlers,
  ...new PipelineHandlers([pipelineFixture({ id: 2, name: 'sample-workflow' })])
    .handlers,
];

describe('Workflow overview', () => {
  new WebSocketServerMock();
  const setupServer = server(handlers());

  beforeAll(() => setupServer.listen());
  afterEach(() => setupServer.resetHandlers(...handlers()));
  afterAll(() => setupServer.close());

  test('should render correct amount of runs', async () => {
    new OverviewObject().render({
      initialEntries: ['/2/pipelines/2/runs'],
    });

    const runs = await screen.findAllByLabelText(/pipeline run/i);

    expect(runs).toHaveLength(3);
    expect(await screen.findAllByText(/finished/i)).toHaveLength(2);
    expect(await screen.findAllByText(/running/i)).toHaveLength(1);
  });

  test('should render error message if Runs fetch fails', async () => {
    setupServer.use(new RunHandlers([]).getRunsErrorHandler());
    new OverviewObject().render({
      initialEntries: ['/2/pipelines/2/runs'],
    });

    await screen.findAllByText(/Internal server error/i);
  });

  test('should render empty list message if runs empty', async () => {
    setupServer.use(...new RunHandlers([]).handlers);
    new OverviewObject().render({
      initialEntries: ['/2/pipelines/2/runs'],
    });

    await screen.findByText(/There are no pipeline runs.../i);
  });

  test('should stop non finished run', async () => {
    new OverviewObject().render({
      initialEntries: ['/2/pipelines/2/runs'],
    });

    expect(await screen.findAllByText(/running/i)).toHaveLength(1);
    expect(await screen.findAllByText(/finished/i)).toHaveLength(2);

    const stopRun = await ButtonHandle.fromRole('Stop run');
    await stopRun.click();

    expect(await screen.findAllByText(/finished/i)).toHaveLength(3);
    expect(screen.queryAllByText(/running/i)).toHaveLength(0);
  });

  test('should render readOnly run builder', async () => {
    new OverviewObject().render({
      initialEntries: ['/2/pipelines/2/runs/1'],
    });

    expect(screen.queryByLabelText(/Delete block: text_input_1/i)).toBeNull();
    expect(screen.queryByLabelText(/Edit block: text_input_1/i)).toBeNull();
    expect(screen.queryByLabelText(/run/i)).toBeNull();
  });

  test('should render error message if Run fetch fails', async () => {
    setupServer.use(new RunHandlers([]).getRunErrorHandler());
    new OverviewObject().render({
      initialEntries: ['/2/pipelines/2/runs/1'],
    });

    await screen.findAllByText(/Internal server error/i);
  });

  test('should render error message if run not found', async () => {
    new OverviewObject().render({
      initialEntries: ['/2/pipelines/2/runs/123'],
    });

    await screen.findByText(/page not found/i);
  });

  test('should render costs list', async () => {
    new OverviewObject().render({
      initialEntries: ['/2/pipelines/2/runs/1/costs'],
    });

    const list = await ListHandle.fromLabelText(/Run cost list/i);
    expect(list.children).toHaveLength(3);
  });

  test('should render error message if Costs fetch fails', async () => {
    setupServer.use(new RunHandlers([]).getRunErrorHandler());
    new OverviewObject().render({
      initialEntries: ['/2/pipelines/2/runs/1/costs'],
    });

    await screen.findAllByText(/Internal server error/i);
  });

  test('should render correct amount of run costs', async () => {
    new OverviewObject().render({
      initialEntries: ['/2/pipelines/2/runs/1/costs'],
    });

    const list = await ListHandle.fromLabelText(/Run cost list/i);
    expect(list.children).toHaveLength(3);
  });

  test('should render empty list message if costs empty', async () => {
    setupServer.use(...new RunHandlers([runFixture({ costs: [] })]).handlers);
    new OverviewObject().render({
      initialEntries: ['/2/pipelines/2/runs/1/costs'],
    });

    await screen.findByText(/There is no costs yet/i);
  });

  test('should restore run configuration', async () => {
    new OverviewObject().render({
      initialEntries: ['/2/pipelines/2/runs/1'],
    });

    const convertButton = await ButtonHandle.fromRole('Convert as latest');

    await convertButton.click();

    const confirmButton = await ButtonHandle.fromRole('Restore Run');
    await confirmButton.click();

    await screen.findByText(/build/i);
  });
});

class OverviewObject {
  render(props?: RoutesProps) {
    const Routes = setupRoutes([
      {
        path: '/',
        ErrorBoundary: RootErrorBoundary,
        children: [
          {
            path: '/:organizationId/pipelines/:pipelineId/build',
            Component: () => <p>build</p>,
            action: actionWithSession(buildAction),
          },
          {
            path: '/:organizationId/pipelines/:pipelineId/runs',
            Component: OverviewPage,
            loader: loaderWithSession(overviewLoader),
            action: actionWithSession(overviewAction),
          },
          {
            Component: PipelineRunLayout,
            loader: loaderWithSession(runLayoutLoader),
            children: [
              {
                path: '/:organizationId/pipelines/:pipelineId/runs/:runId',
                Component: PipelineRunOverview,
                loader: loaderWithSession(runOverviewLoader),
              },
              {
                path: '/:organizationId/pipelines/:pipelineId/runs/:runId/costs',
                Component: PipelineRunCosts,
                loader: loaderWithSession(runCostsLoader),
              },
            ],
          },
        ],
      },
    ]);

    render(<Routes {...props} />);

    return this;
  }
}
