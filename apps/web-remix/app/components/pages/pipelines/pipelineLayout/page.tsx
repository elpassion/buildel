import React from 'react';
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import { ChevronLeft } from 'lucide-react';

import { FilledTabLink } from '~/components/tabs/FilledTabLink';
import { FilledTabsWrapper } from '~/components/tabs/FilledTabsWrapper';
import { TabGroup } from '~/components/tabs/TabGroup';
import { Button } from '~/components/ui/button';
import { routes } from '~/utils/routes.utils';

import { AliasSelect, CreateAliasForm, RestoreWorkflow } from './Aliases';
import type { loader } from './loader.server';

export function PipelineLayout() {
  const navigate = useNavigate();
  const { pipeline, organizationId, aliases, aliasId } =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const backToWorkflows = () => {
    navigate(routes.pipelines(organizationId));
  };

  return (
    <>
      <TabGroup>
        <header className="w-full h-16 bg-white border-b border-input px-4 py-2 flex gap-2 justify-between items-center">
          <div className="flex gap-2 items-center">
            <Button
              variant="secondary"
              size="xs"
              className="w-8 h-8"
              onClick={backToWorkflows}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <FilledTabsWrapper size="xs">
              <FilledTabLink
                end
                to={routes.pipelineBuild(
                  pipeline.organization_id,
                  pipeline.id,
                  Object.fromEntries(searchParams),
                )}
              >
                Build
              </FilledTabLink>
              <FilledTabLink
                to={routes.pipelineRuns(
                  pipeline.organization_id,
                  pipeline.id,
                  Object.fromEntries(searchParams),
                )}
              >
                Overview
              </FilledTabLink>
              <FilledTabLink
                to={routes.pipelineInterface(
                  pipeline.organization_id,
                  pipeline.id,
                  Object.fromEntries(searchParams),
                )}
              >
                Interface
              </FilledTabLink>
              <FilledTabLink
                to={routes.pipelineSettings(
                  pipeline.organization_id,
                  pipeline.id,
                  Object.fromEntries(searchParams),
                )}
              >
                Settings
              </FilledTabLink>
            </FilledTabsWrapper>
          </div>

          <div className="flex gap-2 items-center">
            <AliasSelect aliases={aliases} value={aliasId} />

            {aliasId !== 'latest' && <RestoreWorkflow pipeline={pipeline} />}

            {aliasId === 'latest' && (
              <CreateAliasForm pipeline={pipeline} aliases={aliases} />
            )}
          </div>
        </header>

        <Outlet />
      </TabGroup>
    </>
  );
}
