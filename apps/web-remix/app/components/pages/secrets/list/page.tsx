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
import { Button, Icon } from "@elpassion/taco";
import { SecretKeyList } from "./SecretKeyList";
import { routes } from "~/utils/routes.utils";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";
import { AppNavbar, AppNavbarHeading } from "~/components/navbar/AppNavbar";
import { Tooltip } from "~/components/tooltip/Tooltip";
import classNames from "classnames";
import { PageContentWrapper } from "~/components/layout/PageContentWrapper";

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
          <Link to={routes.secretsNew(organizationId)}>
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

interface HelpfulIconProps {
  text: string;
  id: string;
  className?: string;
}

function HelpfulIcon({ className, text, id }: HelpfulIconProps) {
  return (
    <>
      <Tooltip
        anchorSelect={`#${id}-helpful-icon`}
        content={text}
        className="!text-xs max-w-[350px] "
        place="bottom"
      />
      <Icon
        id={`${id}-helpful-icon`}
        iconName="help-circle"
        className={classNames(
          "text-primary-500 text-xl cursor-pointer",
          className
        )}
      />
    </>
  );
}
