import React from "react";
import { MetaFunction } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
} from "@remix-run/react";
import { loader } from "./loader.server";
import { Button } from "@elpassion/taco";
import { SecretKeyList } from "./SecretKeyList";
import { routes } from "~/utils/routes.utils";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";
import { AppNavbar, AppNavbarHeading } from "~/components/navbar/AppNavbar";
import { PageContentWrapper } from "~/components/layout/PageContentWrapper";
import { HelpfulIcon } from "~/components/tooltip/HelpfulIcon";

export function SecretListPage() {
  const navigate = useNavigate();
  const { organizationId, secrets } = useLoaderData<typeof loader>();
  const match = useMatch(routes.secretsNew(organizationId));
  const isSidebarOpen = !!match;

  const handleCloseSidebar = () => {
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
      />
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

      <PageContentWrapper>
        <div className="mt-5 mb-6 flex gap-2 justify-end items-center">
          <Link
            to={routes.secretsNew(organizationId)}
            aria-label="Add new secret"
          >
            <Button size="sm" tabIndex={0}>
              New Secret
            </Button>
          </Link>
        </div>

        <SecretKeyList items={secrets} />
      </PageContentWrapper>
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
