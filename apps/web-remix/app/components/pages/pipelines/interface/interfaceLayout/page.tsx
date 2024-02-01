import React from "react";
import { Outlet, useLoaderData } from "@remix-run/react";
import { loader } from "./loader";
import {
  OutlinedNavigation,
  OutlinedNavigationLink,
} from "./OutlinedNavigation";
import { routes } from "~/utils/routes.utils";

export function InterfaceLayout() {
  const { pipelineId, organizationId } = useLoaderData<typeof loader>();

  return (
    <div className="pt-5">
      <div className="mt-5 mb-12">
        <OutlinedNavigation>
          <OutlinedNavigationLink
            to={routes.pipelineClientSDK(organizationId, pipelineId)}
          >
            Client SDK
          </OutlinedNavigationLink>
          <OutlinedNavigationLink
            to={routes.pipelineWebsiteChatbot(organizationId, pipelineId)}
          >
            Website Chatbot
          </OutlinedNavigationLink>

          <OutlinedNavigationLink
            to={routes.pipelineOpenAIApi(organizationId, pipelineId)}
          >
            OpenAI Api
          </OutlinedNavigationLink>
        </OutlinedNavigation>
      </div>

      <Outlet />
    </div>
  );
}
