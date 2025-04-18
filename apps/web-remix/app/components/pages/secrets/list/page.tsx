import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Outlet, useLoaderData, useMatch, useNavigate } from '@remix-run/react';

import { PageContentWrapper } from '~/components/layout/PageContentWrapper';
import { BasicLink } from '~/components/link/BasicLink';
import { AppNavbar, AppNavbarHeading } from '~/components/navbar/AppNavbar';
import { PageSearch } from '~/components/search/PageSearch';
import { HelpfulIcon } from '~/components/tooltip/HelpfulIcon';
import { Button } from '~/components/ui/button';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';
import { SecretKeyList } from './SecretKeyList';

export function SecretListPage() {
  const navigate = useNavigate();
  const { organizationId, secrets, search } = useLoaderData<typeof loader>();
  const match = useMatch(routes.secretsNew(organizationId));
  const isSidebarOpen = !!match;

  const handleCloseSidebar = (value: boolean) => {
    if (value) return;
    navigate(routes.secrets(organizationId));
  };

  return (
    <>
      <AppNavbar
        leftContent={
          <AppNavbarHeading className="flex gap-3 items-center">
            <span>Secrets and API Keys</span>

            <HelpfulIcon
              id="secrets-and-api-keys"
              text="Secrets allow you to manage reusable configuration data. They are designed for storing sensitive information that your applications might need to communicate with external services, like GPT API."
            />
          </AppNavbarHeading>
        }
      ></AppNavbar>

      <DialogDrawer open={isSidebarOpen} onOpenChange={handleCloseSidebar}>
        <DialogDrawerContent>
          <DialogDrawerHeader>
            <DialogDrawerTitle>New Secret</DialogDrawerTitle>
            <DialogDrawerDescription>
              Enter your Secret to use them in multiple workflows.
            </DialogDrawerDescription>
          </DialogDrawerHeader>

          <DialogDrawerBody>
            <Outlet />
          </DialogDrawerBody>
        </DialogDrawerContent>
      </DialogDrawer>

      <PageContentWrapper className="mt-6">
        <div className="mb-10 -mt-1  flex gap-2 justify-end items-center">
          <PageSearch placeholder="Search Secrets" defaultValue={search} />

          <Button asChild size="sm">
            <BasicLink to={routes.secretsNew(organizationId)}>
              New Secret
            </BasicLink>
          </Button>
        </div>

        <SecretKeyList items={secrets} />
      </PageContentWrapper>
    </>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Secrets',
    },
  ];
});
