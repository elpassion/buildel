import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import {
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';

import { BasicLink } from '~/components/link/BasicLink';
import { OrganizationAvatar } from '~/components/pages/settings/organization/AboutOrganization';
import {
  Section,
  SectionContent,
  SectionHeading,
} from '~/components/pages/settings/settingsLayout/PageLayout';
import {
  ActionSidebar,
  ActionSidebarHeader,
} from '~/components/sidebar/ActionSidebar';
import { Button } from '~/components/ui/button';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
import { routes } from '~/utils/routes.utils';

import { EditPipelineNameForm } from './EditPipelineNameForm';
import { EditPipelineSettingsForm } from './EditPipelineSettingsForm';
import type { loader } from './loader.server';

export function SettingsPage() {
  const { pipeline, organizationId, pipelineId } =
    useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const match = useMatch(
    routes.pipelineSettingsConfiguration(organizationId, pipelineId),
  );
  const isSidebarOpen = !!match;

  const handleCloseSidebar = (value: boolean) => {
    if (value) return;

    navigate(
      routes.pipelineSettings(
        organizationId,
        pipelineId,
        Object.fromEntries(searchParams.entries()),
      ),
    );
  };

  return (
    <>
      <Section>
        <div className="flex gap-3 justify-between items-center mb-4">
          <SectionHeading>About Workflow</SectionHeading>
          <Button asChild variant="secondary">
            <BasicLink
              to={routes.pipelineSettingsConfiguration(
                organizationId,
                pipelineId,
                Object.fromEntries(searchParams.entries()),
              )}
            >
              Workflow configuration
            </BasicLink>
          </Button>
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

      <DialogDrawer open={isSidebarOpen} onOpenChange={handleCloseSidebar}>
        <DialogDrawerContent className="md:min-w-[700px]">
          <DialogDrawerHeader>
            <DialogDrawerTitle>Workflow configuration</DialogDrawerTitle>
            <DialogDrawerDescription>
              Any workflow can contain many Blocks and use your Knowledge Base.
            </DialogDrawerDescription>
          </DialogDrawerHeader>

          <DialogDrawerBody>
            <Outlet />
          </DialogDrawerBody>
        </DialogDrawerContent>
      </DialogDrawer>
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Settings',
    },
  ];
};
