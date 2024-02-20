import React from "react";
import { Outlet, useLoaderData, useSearchParams } from "@remix-run/react";
import { loader } from "./loader.server";
import {
  OutlinedNavigation,
  OutlinedNavigationLink,
} from "./OutlinedNavigation";
import { routes } from "~/utils/routes.utils";

export function InterfaceLayout() {
  const { pipelineId, organizationId } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <div className="pt-5">
      <div className="mt-5 mb-12">
        <OutlinedNavigation>
          <OutlinedNavigationLink
            to={routes.pipelineClientSDK(
              organizationId,
              pipelineId,
              Object.fromEntries(searchParams.entries())
            )}
          >
            Client SDK
          </OutlinedNavigationLink>

          <OutlinedNavigationLink
            to={routes.pipelineHTTPApi(
              organizationId,
              pipelineId,
              Object.fromEntries(searchParams.entries())
            )}
          >
            HTTP Api
          </OutlinedNavigationLink>

          <OutlinedNavigationLink
            to={routes.pipelineWebsiteChatbot(
              organizationId,
              pipelineId,
              Object.fromEntries(searchParams.entries())
            )}
          >
            Website Chatbot
          </OutlinedNavigationLink>

          <OutlinedNavigationLink
            to={routes.pipelineOpenAIApi(
              organizationId,
              pipelineId,
              Object.fromEntries(searchParams.entries())
            )}
          >
            OpenAI Api
          </OutlinedNavigationLink>
        </OutlinedNavigation>
      </div>

      <Outlet />
    </div>
  );
}
