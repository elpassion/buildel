import React, { useCallback } from "react";
import {
  Outlet,
  useFetcher,
  useLoaderData,
  useMatch,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { MetaFunction } from "@remix-run/node";
import { EditPipelineNameForm } from "./EditPipelineNameForm";
import { IPipeline } from "~/components/pages/pipelines/pipeline.types";
import { routes } from "~/utils/routes.utils";
import {
  Section,
  SectionContent,
  SectionHeading,
} from "~/components/pages/settings/settingsLayout/PageLayout";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";
import { OrganizationAvatar } from "~/components/pages/settings/organization/AboutOrganization";
import { BasicLink } from "~/components/link/BasicLink";
import { loader } from "./loader";

export function SettingsPage() {
  const { pipeline, organizationId, pipelineId } =
    useLoaderData<typeof loader>();
  const updateFetcher = useFetcher<IPipeline>();
  const [searchParams] = useSearchParams();

  const handleUpdatePipeline = useCallback(
    (pipeline: IPipeline) => {
      console.log(pipeline);
      updateFetcher.submit(pipeline, {
        method: "PUT",
        encType: "application/json",
        action:
          routes.pipelineBuild(pipeline.organization_id, pipeline.id) +
          "?index",
      });
    },
    [updateFetcher]
  );

  const navigate = useNavigate();
  const match = useMatch(
    routes.pipelineSettingsConfiguration(organizationId, pipelineId)
  );
  const isSidebarOpen = !!match;

  const handleCloseSidebar = () => {
    navigate(
      routes.pipelineSettings(
        organizationId,
        pipelineId,
        Object.fromEntries(searchParams.entries())
      )
    );
  };

  return (
    <div className="mt-10">
      <Section>
        <div className="flex gap-3 justify-between items-center">
          <SectionHeading>About Workflow</SectionHeading>
          <BasicLink
            className="text-sm underline text-neutral-200 hover:text-primary-500"
            to={routes.pipelineSettingsConfiguration(
              organizationId,
              pipelineId,
              Object.fromEntries(searchParams.entries())
            )}
          >
            Workflow configuration
          </BasicLink>
        </div>

        <SectionContent>
          <OrganizationAvatar name={pipeline.name} />

          <EditPipelineNameForm
            defaultValues={pipeline}
            onSubmit={handleUpdatePipeline}
          />
        </SectionContent>
      </Section>

      <ActionSidebar
        className="!bg-neutral-950 md:!w-[550px]"
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        overlay
      >
        <ActionSidebarHeader
          heading="Workflow configuration"
          subheading="Any workflow can contain many Blocks and use your Knowledge Base."
          onClose={handleCloseSidebar}
        />
        <Outlet />
      </ActionSidebar>
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Settings",
    },
  ];
};
