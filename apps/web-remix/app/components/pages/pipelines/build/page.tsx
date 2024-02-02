import React, { useCallback } from "react";
import { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Outlet,
  useFetcher,
  useLoaderData,
  useMatch,
  useNavigate,
  useRevalidator,
} from "@remix-run/react";
import { ActionSidebar } from "~/components/sidebar/ActionSidebar";
import { ELProvider } from "~/components/pages/pipelines/EL/ELProvider";
import { routes } from "~/utils/routes.utils";
import { IPipeline, IPipelineConfig } from "../pipeline.types";
import { toPipelineConfig } from "../PipelineFlow.utils";
import { CustomEdge } from "../CustomEdges/CustomEdge";
import { Builder } from "../Builder";
import { PasteBlockConfigProvider } from "./CreateBlock/PasteBlockConfigProvider";
import { CreateBlockFloatingMenu } from "./CreateBlock/CreateBlockFloatingMenu";
import { PasteBlockConfiguration } from "./CreateBlock/PastConfigSidebar";
import { links as SubMenuLinks } from "./CreateBlock/GroupSubMenu";
import { BuilderHeader, SaveChangesButton } from "./BuilderHeader";
import { BuilderNode } from "./BuilderNode";
import { loader } from "./loader";

export const links: LinksFunction = () => [...SubMenuLinks()];

export function PipelineBuilder() {
  const revalidator = useRevalidator();
  const updateFetcher = useFetcher<IPipeline>();
  const { pipeline, pipelineId, organizationId } =
    useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const match = useMatch(
    "/:organizationId/pipelines/:pipelineId/build/blocks/:blockName"
  );
  const isSidebarOpen = !!match;

  const handleUpdatePipeline = useCallback(
    (config: IPipelineConfig) => {
      updateFetcher.submit(
        { ...pipeline, config: { ...config } },
        { method: "PUT", encType: "application/json" }
      );
    },
    [updateFetcher, pipeline]
  );

  const handleRevalidate = () => {
    revalidator.revalidate();
  };

  const handleCloseSidebar = () => {
    navigate(routes.pipelineBuild(organizationId, pipelineId));
  };

  return (
    <>
      <Builder
        pipeline={pipeline}
        CustomNode={BuilderNode}
        CustomEdge={CustomEdge}
        className="h-[calc(100vh_-_128px)]"
        isUpdating={updateFetcher.state !== "idle"}
      >
        {({ edges, nodes, isUpToDate, onBlockCreate }) => (
          <>
            <BuilderHeader isUpToDate={isUpToDate}>
              <SaveChangesButton
                isUpToDate={isUpToDate}
                isSaving={updateFetcher.state !== "idle"}
                onSave={() => {
                  handleUpdatePipeline(toPipelineConfig(nodes, edges));
                }}
              />
            </BuilderHeader>

            <ELProvider>
              {/*<ELHelper*/}
              {/*  pipelineId={pipelineId}*/}
              {/*  organizationId={organizationId}*/}
              {/*  onBlockCreate={handleRevalidate}*/}
              {/*/>*/}
              <PasteBlockConfigProvider>
                <CreateBlockFloatingMenu onCreate={onBlockCreate} />

                <PasteBlockConfiguration onSubmit={onBlockCreate} />
              </PasteBlockConfigProvider>
            </ELProvider>
          </>
        )}
      </Builder>

      <ActionSidebar
        overlay
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        className="md:w-[460px] lg:w-[550px]"
      >
        <Outlet />
      </ActionSidebar>
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Build",
    },
  ];
};
