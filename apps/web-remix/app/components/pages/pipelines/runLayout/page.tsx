import React, { useEffect } from 'react';
import {
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import { ChevronLeft } from 'lucide-react';

import { confirm } from '~/components/modal/confirm';
import { FilledTabLink } from '~/components/tabs/FilledTabLink';
import { FilledTabsWrapper } from '~/components/tabs/FilledTabsWrapper';
import { TabGroup } from '~/components/tabs/TabGroup';
import { successToast } from '~/components/toasts/successToast';
import { Button } from '~/components/ui/button';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';

export function PipelineRunLayout() {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [searchParams] = useSearchParams();
  const { pipeline, pipelineRun, runId, pipelineId, organizationId } =
    useLoaderData<typeof loader>();

  const handleRestoreRun = () => {
    confirm({
      onConfirm: async () =>
        fetcher.submit(
          { ...pipeline, config: { ...pipelineRun.config } },
          {
            method: 'PUT',
            encType: 'application/json',
            action: routes.pipelineBuild(organizationId, pipelineId) + '?index',
          },
        ),
      confirmText: 'Restore Run',
      children: (
        <p className="text-sm">
          You are about to restore pipeline run configuration. This action is
          irreversible.
        </p>
      ),
    });
  };

  const backToOverview = () => {
    navigate(routes.pipelineRuns(organizationId, pipelineId));
  };

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      successToast({ description: 'Configuration restored!' });
      navigate(routes.pipelineBuild(organizationId, pipelineId));
    }
  }, [fetcher]);

  return (
    <>
      {/*<AppNavbar*/}
      {/*  leftContent={*/}
      {/*    <div className="flex gap-2 text-white">*/}
      {/*      <Link*/}
      {/*        to={routes.pipelineRuns(*/}
      {/*          organizationId,*/}
      {/*          pipelineId,*/}
      {/*          Object.fromEntries(searchParams.entries()),*/}
      {/*        )}*/}
      {/*      >*/}
      {/*        <ArrowLeft className="w-6 h-6" />*/}
      {/*      </Link>*/}
      {/*      <div>*/}
      {/*        <h2 className="text-2xl font-medium">Run history</h2>*/}
      {/*        <h1 className="text-sm font-medium">{pipeline.name}</h1>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  }*/}
      {/*/>*/}

      <TabGroup>
        <header className="w-full h-16 bg-white border-b border-input px-4 py-2 flex gap-2 justify-between items-center">
          <div className="flex gap-2 items-center">
            <Button
              variant="secondary"
              size="xs"
              onClick={backToOverview}
              className="flex gap-2 items-center max-w-[250px]"
            >
              <ChevronLeft className="min-w-5 w-4 h-4 flex-shrink-0" />
              <span className="truncate">{pipeline.name}</span>
            </Button>

            <FilledTabsWrapper size="xs">
              <FilledTabLink
                end
                to={routes.pipelineRun(
                  organizationId,
                  pipelineId,
                  runId,
                  Object.fromEntries(searchParams.entries()),
                )}
              >
                Overview
              </FilledTabLink>
              <FilledTabLink
                to={routes.pipelineRunCosts(
                  organizationId,
                  pipelineId,
                  runId,
                  Object.fromEntries(searchParams.entries()),
                )}
              >
                Costs details
              </FilledTabLink>
              <FilledTabLink
                to={routes.pipelineRunLogs(
                  organizationId,
                  pipelineId,
                  runId,
                  Object.fromEntries(searchParams.entries()),
                )}
              >
                Logs
              </FilledTabLink>
            </FilledTabsWrapper>
          </div>

          <Button size="xs" onClick={handleRestoreRun}>
            Convert as latest
          </Button>
        </header>
      </TabGroup>

      <Outlet />
    </>
  );
}
