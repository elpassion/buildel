import React from 'react';
import { Outlet, useLoaderData, useSearchParams } from '@remix-run/react';

import {
  OutlinedTabLink,
  OutlinedTabsWrapper,
} from '~/components/tabs/OutlinedTabs';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';

export function InterfaceLayout() {
  const { pipelineId, organizationId } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <div className="pt-5">
      <div className="mt-5 mb-12">
        <OutlinedTabsWrapper>
          <OutlinedTabLink
            to={routes.pipelineClientSDK(
              organizationId,
              pipelineId,
              Object.fromEntries(searchParams.entries()),
            )}
          >
            Client SDK
          </OutlinedTabLink>

          <OutlinedTabLink
            to={routes.pipelineHTTPApi(
              organizationId,
              pipelineId,
              Object.fromEntries(searchParams.entries()),
            )}
          >
            HTTP Api
          </OutlinedTabLink>

          <OutlinedTabLink
            to={routes.pipelineWebsiteChatbot(
              organizationId,
              pipelineId,
              Object.fromEntries(searchParams.entries()),
            )}
          >
            Website Chatbot
          </OutlinedTabLink>

          <OutlinedTabLink
            to={routes.pipelineForm(
              organizationId,
              pipelineId,
              Object.fromEntries(searchParams.entries()),
            )}
          >
            Form
          </OutlinedTabLink>

          <OutlinedTabLink
            to={routes.pipelineOpenAIApi(
              organizationId,
              pipelineId,
              Object.fromEntries(searchParams.entries()),
            )}
          >
            OpenAI Api
          </OutlinedTabLink>

          <OutlinedTabLink
            to={routes.pipelineBulk(
              organizationId,
              pipelineId,
              Object.fromEntries(searchParams.entries()),
            )}
          >
            Bulk
          </OutlinedTabLink>
        </OutlinedTabsWrapper>
      </div>

      <Outlet />
    </div>
  );
}
