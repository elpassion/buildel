import React from "react";
import {
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { BasicLink } from "~/components/link/BasicLink";
import { OrganizationAvatar } from "~/components/pages/settings/organization/AboutOrganization";
import {
  Section,
  SectionContent,
  SectionHeading,
} from "~/components/pages/settings/settingsLayout/PageLayout";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";
import { routes } from "~/utils/routes.utils";
import { EditPipelineNameForm } from "./EditPipelineNameForm";
import { EditPipelineSettingsForm } from "./EditPipelineSettingsForm";
import type { loader } from "./loader.server";
import type { MetaFunction } from "@remix-run/node";

export function SettingsPage() {
  const { pipeline, organizationId, pipelineId } =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

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

        <div className="flex flex-col gap-6">
          <SectionContent>
            <OrganizationAvatar name={pipeline.name} />

            <EditPipelineNameForm defaultValues={pipeline} />
          </SectionContent>

          <SectionContent>
            <EditPipelineSettingsForm defaultValues={pipeline} />
          </SectionContent>
        </div>
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
