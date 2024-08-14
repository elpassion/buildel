import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import {
  Link,
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
} from '@remix-run/react';

import { Button } from '~/components/ui/button';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import {
  Section,
  SectionContent,
  SectionHeading,
} from '../settingsLayout/PageLayout';
import type { loader } from './loader.server';

export function ProfileSettingsPage() {
  const { organization } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const match = useMatch(routes.profileSettingsChangePassword(organization.id));
  const isSidebarOpen = !!match;

  const handleCloseSidebar = () => {
    navigate(routes.profileSettings(organization.id));
  };
  return (
    <>
      <DialogDrawer open={isSidebarOpen} onOpenChange={handleCloseSidebar}>
        <DialogDrawerContent>
          <DialogDrawerHeader>
            <DialogDrawerTitle>Change password</DialogDrawerTitle>
          </DialogDrawerHeader>

          <DialogDrawerBody>
            <Outlet />
          </DialogDrawerBody>
        </DialogDrawerContent>
      </DialogDrawer>

      <div className="flex flex-col gap-9">
        <Section>
          <SectionHeading>Password</SectionHeading>
          <SectionContent>
            <Link to={routes.profileSettingsChangePassword(organization.id)}>
              <Button tabIndex={0} size="sm">
                Change password
              </Button>
            </Link>
          </SectionContent>
        </Section>
      </div>
    </>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Profile settings',
    },
  ];
});
