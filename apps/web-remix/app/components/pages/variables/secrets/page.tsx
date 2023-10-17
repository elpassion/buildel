import React from "react";
import { MetaFunction } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
} from "@remix-run/react";
import { loader } from "./loader";
import { Button } from "@elpassion/taco";
import { SecretKeyList } from "./SecretKeyList";
import { routes } from "~/utils/routes.utils";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";

export function SecretPage() {
  const navigate = useNavigate();
  const { organizationId, secrets } = useLoaderData<typeof loader>();
  const match = useMatch(routes.secretsNew(organizationId));
  const isSidebarOpen = !!match;

  const handleCloseSidebar = () => {
    navigate(routes.secrets(organizationId));
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
          heading="New Secret"
          subheading="Enter your Secret to use them in multiple workflows."
          onClose={handleCloseSidebar}
        />
        <Outlet />
      </ActionSidebar>

      <div className="mt-5 mb-6 flex gap-2 justify-end items-center">
        <Link to={routes.secretsNew(organizationId)}>
          <Button size="sm" tabIndex={0}>
            New Secret
          </Button>
        </Link>
      </div>

      <SecretKeyList items={secrets} />
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Secrets",
    },
  ];
};
