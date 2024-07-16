import React from "react";
import {
  Link,
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
} from "@remix-run/react";
import { Button } from "@elpassion/taco";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";
import { routes } from "~/utils/routes.utils";
import { InvitationsList } from "./InvitationsList";
import type { loader } from "./loader.server";

export function InvitationsPage() {
  const { organizationId, invitations } = useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const match = useMatch(routes.organizationInvitationsNew(organizationId));
  const isSidebarOpen = !!match;

  const handleCloseSidebar = () => {
    navigate(routes.organizationInvitations(organizationId));
  };

  return (
    <>
      <ActionSidebar
        className="!bg-neutral-950"
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        overlay
      >
        <ActionSidebarHeader
          heading="Invite user"
          subheading="Send invitation to your organziation."
          onClose={handleCloseSidebar}
        />
        <Outlet />
      </ActionSidebar>

      <div className="flex flex-col gap-4 items-end">
        <Link
          to={routes.organizationInvitationsNew(organizationId)}
          className="block w-fit"
        >
          <Button tabIndex={0} size="sm">
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
