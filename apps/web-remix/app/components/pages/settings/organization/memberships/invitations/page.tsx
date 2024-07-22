import React from 'react';
import {
  Link,
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
} from '@remix-run/react';

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

import { InvitationsList } from './InvitationsList';
import type { loader } from './loader.server';

export function InvitationsPage() {
  const { organizationId, invitations } = useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const match = useMatch(routes.organizationInvitationsNew(organizationId));
  const isSidebarOpen = !!match;

  const handleCloseSidebar = (value: boolean) => {
    if (value) return;
    navigate(routes.organizationInvitations(organizationId));
  };

  return (
    <>
      <DialogDrawer open={isSidebarOpen} onOpenChange={handleCloseSidebar}>
        <DialogDrawerContent>
          <DialogDrawerHeader>
            <DialogDrawerTitle>Invite user</DialogDrawerTitle>
            <DialogDrawerDescription>
              Send invitation to your organziation.
            </DialogDrawerDescription>
          </DialogDrawerHeader>

          <DialogDrawerBody>
            <Outlet />
          </DialogDrawerBody>
        </DialogDrawerContent>
      </DialogDrawer>

      <div className="flex flex-col gap-4 items-end">
        <Link
          to={routes.organizationInvitationsNew(organizationId)}
          className="block w-fit"
        >
          <Button tabIndex={0} size="xs">
            New Member
          </Button>
        </Link>

        <div className="w-full">
          <InvitationsList invitations={invitations} />
        </div>
      </div>
    </>
  );
}
